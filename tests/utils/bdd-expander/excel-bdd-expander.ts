import fs from 'fs';
import path from 'path';
import { DataReaderFactory } from './data-reader.factory';

/**
 * Expands Scenario Outline Examples using external test data
 * Supports:
 *  - No Examples (copy as-is)
 *  - Plain Data Tables (copy as-is)
 *  - Table-based Examples (Excel / CSV / JSON)
 *  - Legacy inline Examples { datafile, sheetName } (Excel only)
 */
export async function expandFeatureWithExternalData(
  originalFeaturePath: string,
  outDir: string
): Promise<string> {

  const featureText = fs.readFileSync(originalFeaturePath, 'utf8');

  // -------- CASE 1: No Examples --------
  if (!featureText.includes('Examples:')) {
    return writeGeneratedFeature(originalFeaturePath, featureText, outDir);
  }

  const scenarioRegex =
    /Scenario Outline:[\s\S]*?Examples:\s*([\s\S]*?)(?=\n\s*\n|@[A-Za-z0-9_]|Scenario Outline:|$)/g

  let updatedFeature = featureText;
  const replacements: { start: number; end: number; value: string }[] = [];

  let match: RegExpExecArray | null;

  while ((match = scenarioRegex.exec(featureText)) !== null) {
    const fullBlock = match[0];
    const examplesIndex = fullBlock.indexOf('Examples:');
    if (examplesIndex === -1) continue;

    const beforeExamples = fullBlock.substring(0, examplesIndex);
    const examplesPart = fullBlock.substring(examplesIndex);

    let rows: Array<Record<string, string>> = [];

    // -------- CASE 2: INLINE LEGACY FORMAT --------
    if (examplesPart.includes('{') && examplesPart.includes('}')) {
      rows = await handleInlineExamples(examplesPart);
    }

    // -------- CASE 3: TABLE FORMAT --------
    else {
      rows = await handleTableExamples(examplesPart);
    }

    if (!rows.length) continue;

    // Build new Examples table
    const headers = Object.keys(rows[0]);
    let newExamples = 'Examples:\n';
    newExamples += `| ${headers.join(' | ')} |\n`;

    for (const row of rows) {
      newExamples += `| ${headers.map(h => row[h] ?? '').join(' | ')} |\n`;
    }

    const replacedBlock = beforeExamples + newExamples;

    replacements.push({
      start: match.index,
      end: match.index + fullBlock.length,
      value: replacedBlock
    });
  }

  // Apply replacements bottom-up
  for (const r of replacements.reverse()) {
    updatedFeature =
      updatedFeature.slice(0, r.start) +
      r.value +
      updatedFeature.slice(r.end);
  }

  return writeGeneratedFeature(originalFeaturePath, updatedFeature, outDir);
}

/* ------------------------------------------------------------------ */
/* --------------------- INLINE LEGACY HANDLER ----------------------- */
/* ------------------------------------------------------------------ */

async function handleInlineExamples(examplesPart: string) {
  const inlineMatch = examplesPart.match(
    /Examples\s*:\s*(\{[\s\S]*\})/
  );
  if (!inlineMatch) return [];

  const jsonText = inlineMatch[1]
    .replace(/'/g, '"')
    .replace(/(\w+)\s*:/g, '"$1":');

  let config: any;
  try {
    config = JSON.parse(jsonText);
  } catch {
    throw new Error(`Invalid inline Examples format: ${examplesPart}`);
  }

  if (!config.datafile) {
    throw new Error('Inline Examples must contain datafile');
  }

  const fullPath = config.datafile;
  const filePath = path.dirname(fullPath);
  const fileName = path.basename(fullPath);

  const ext = path.extname(fileName).toLowerCase();
  let fileType: 'excel' | 'csv' | 'json';

  if (ext === '.xlsx' || ext === '.xls') fileType = 'excel';
  else if (ext === '.csv') fileType = 'csv';
  else if (ext === '.json') fileType = 'json';
  else throw new Error(`Unsupported datafile type: ${ext}`);

  const reader = DataReaderFactory.create({
    fileType,
    filePath,
    fileName,
    sheetName: fileType === 'excel' ? config.sheetName : undefined
  });

  return reader.read();
}

/* ------------------------------------------------------------------ */
/* --------------------- TABLE FORMAT HANDLER ------------------------ */
/* ------------------------------------------------------------------ */

async function handleTableExamples(examplesPart: string) {
  const lines = examplesPart.split('\n').map(l => l.trim()).filter(Boolean);
  const tableLines = lines.filter(l => l.startsWith('|'));

  if (tableLines.length < 2) return [];

  const headers = tableLines[0]
    .split('|')
    .map(h => h.trim())
    .filter(Boolean);

  // ✅ HEADER-ONLY DECISION (new + legacy)
  const EXTERNAL_HEADERS = [
    'fileType',
    'filePath',
    'fileName',
    'sheetName',
    'excelFile' // legacy
  ];

  const isExternalTable = headers.some(h => EXTERNAL_HEADERS.includes(h));

  // ❌ Pure Gherkin Examples → DO NOT EXPAND
  if (!isExternalTable) {
    return [];
  }

  const values = tableLines[1]
    .split('|')
    .map(v => v.trim())
    .filter(Boolean);

  let meta: {
    fileType: string;
    filePath: string;
    fileName: string;
    sheetName?: string;
  };

  // ---- Legacy Excel table (excelFile + sheetName) ----
  if (headers.includes('excelFile')) {
    const excelFile = values[headers.indexOf('excelFile')];
    const sheetName = headers.includes('sheetName')
      ? values[headers.indexOf('sheetName')]
      : undefined;

    if (!excelFile || !sheetName) return [];

    meta = {
      fileType: 'excel',
      //filePath: path.dirname(excelFile),
      filePath: 'tests/testdata',
      fileName: path.basename(excelFile),
      sheetName
    };
  }

  // ---- Old Excel-only table ----
  else if (!headers.includes('fileType')) {
    if (!values[0] || !values[1]) return [];

    meta = {
      fileType: 'excel',
      filePath: 'tests/testdata',
      fileName: values[0],
      sheetName: values[1]
    };
  }

  // ---- New generic table ----
  else {
    const fileType = values[headers.indexOf('fileType')];
    const filePath = values[headers.indexOf('filePath')];
    const fileName = values[headers.indexOf('fileName')];

    if (!fileType || !filePath || !fileName) return [];

    meta = {
      fileType,
      filePath,
      fileName,
      sheetName: headers.includes('sheetName')
        ? values[headers.indexOf('sheetName')]
        : undefined
    };
  }

  const reader = DataReaderFactory.create(meta);
  return reader.read();
}

/* ------------------------------------------------------------------ */

function writeGeneratedFeature(
  originalPath: string,
  content: string,
  outDir: string
): string {
  const baseName = path.basename(originalPath, '.feature');
  const outPath = path.join(outDir, `${baseName}.gen.feature`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, content, 'utf8');
  return outPath;
}