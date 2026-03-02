import fs from 'fs';
import path from 'path';
import { test } from '@playwright/test';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    ImageRun,
    AlignmentType
} from 'docx';
import { getCurrentTimestamp } from './time-stamp.utils';

export class DocxEvidenceOperations {

    /**
     * Generates a DOCX evidence file from captured screenshots
     */
    static async generate(): Promise<void> {

        const shots = (test.info() as any)._shots || [];
        if (!shots.length) return;

        const fileTitle = test.info().titlePath[2].replace(/[^a-z0-9]/gi, '_');
        const fileName = `SS_${fileTitle}_${getCurrentTimestamp()}.docx`;
        const docxPath = path.join(test.info().outputDir, fileName);

        const children: Paragraph[] = [];

        // ---------- HEADER ----------
        children.push(
            new Paragraph({
                text: 'Test Execution Evidence',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER
            })
        );

        children.push(
            new Paragraph(`Test: ${test.info().titlePath[2]}`),
            new Paragraph(`Status: ${test.info().status}`),
            new Paragraph(`Executed: ${new Date().toLocaleString()}`),
            new Paragraph({ text: '', spacing: { after: 300 } })
        );

        // ---------- STEPS ----------
        for (const s of shots) {

            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Step: ${s.name}`,
                            bold: true
                        })
                    ]
                })
            );

            children.push(
                new Paragraph({
                    text: `Time: ${s.time}`,
                    spacing: { after: 200 }
                })
            );

            const imageBuffer = fs.readFileSync(s.path);

            children.push(
                new Paragraph({
                    children: [
                        new ImageRun({
                            data: imageBuffer,
                            transformation: {
                                width: 600,
                                height: 350
                            }
                        } as any)
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                })
            );
        }

        // ---------- BUILD DOCUMENT ----------
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children
                }
            ]
        });

        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(docxPath, buffer);

        // ---------- ATTACH TO REPORT ----------
        await test.info().attach(`DOCX_${fileName}`, {
            path: docxPath,
            contentType:
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        console.info(`[DOCX Evidence generated] ${fileName}`);
    }
}