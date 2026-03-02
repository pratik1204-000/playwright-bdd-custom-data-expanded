import * as path from 'path';
import ExcelJS from 'exceljs';

export interface ExcelRow {
  [key: string]: string;
}

export class ExcelOperations {

  /**
   * Reads an Excel sheet and returns rows as array of objects
   */
  static async read(
    relativeFilePath: string,
    sheetName: string
  ): Promise<ExcelRow[]> {

    const absPath = path.join(process.cwd(), relativeFilePath);
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(absPath);
    const worksheet = workbook.getWorksheet(sheetName);

    if (!worksheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    const headers: string[] = [];
    const rows: ExcelRow[] = [];

    worksheet.getRow(1).eachCell((cell, colIndex) => {
      headers[colIndex] = String(cell.value ?? '');
    });

    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) return;

      const rowData: ExcelRow = {};
      row.eachCell((cell, colIndex) => {
        rowData[headers[colIndex]] = String(cell.value ?? '');
      });

      rows.push(rowData);
    });

    return rows;
  }

  /**
   * Updates a single cell value using header name
   */
  static async write(
    relativeFilePath: string,
    sheetName: string,
    rowIndex: number,
    columnName: string,
    value: string
  ): Promise<void> {

    const absPath = path.join(process.cwd(), relativeFilePath);
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(absPath);
    const worksheet = workbook.getWorksheet(sheetName);

    if (!worksheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    const headerRow = worksheet.getRow(1);
    let columnIndex = -1;

    headerRow.eachCell((cell, colIndex) => {
      if (String(cell.value) === columnName) {
        columnIndex = colIndex;
      }
    });

    if (columnIndex === -1) {
      throw new Error(`Column not found: ${columnName}`);
    }

    const targetRow = worksheet.getRow(rowIndex + 2); // header + 0-based index
    targetRow.getCell(columnIndex).value = value;
    targetRow.commit();

    await workbook.xlsx.writeFile(absPath);
  }
}