import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import sizeOf from 'image-size';
import { test } from '@playwright/test';
import { getCurrentTimestamp } from './time-stamp.utils';

export class PdfEvidenceOperations {

    /**
     * Generates a PDF evidence file from captured screenshots
     */
    static async generate(): Promise<void> {

        const shots = (test.info() as any)._shots || [];
        if (!shots.length) return;

        const fileTitle = test.info().titlePath[2].replace(/[^a-z0-9]/gi, '_');
        const fileName = `SS_${fileTitle}_${getCurrentTimestamp()}.pdf`;
        const pdfPath = path.join(test.info().outputDir, fileName);

        const doc = new PDFDocument({
            autoFirstPage: true,
            margin: 40
        });

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // ---------- HEADER LOGO ----------
        const rootDir = path.dirname(test.info().config.rootDir);
        const logoPath = path.join(rootDir, 'tests', 'assets', 'header_logo.png');

        if (fs.existsSync(logoPath)) {
            const logoWidth = 200;
            const x = (doc.page.width - logoWidth) / 2;
            doc.image(logoPath, x, 20, { width: logoWidth });
            doc.y = 120;
        }

        // ---------- HEADER TEXT ----------
        doc.fontSize(18).text('Test Execution Evidence', {
            align: 'center',
            width: doc.page.width - 80,
            underline: true
        });

        doc.moveDown();
        doc.fontSize(12).text(`Test: ${test.info().titlePath[2]}`);
        doc.text(`Status: ${test.info().status}`);
        doc.text(`Executed: ${new Date().toLocaleString()}`);
        doc.moveDown();

        // ---------- SETTINGS ----------
        const margin = 40;
        let pageNumber = 1;
        let stepsOnCurrentPage = 0;

        for (const s of shots) {

            const maxStepsThisPage = pageNumber === 1 ? 1 : 2;

            const imgBuffer = fs.readFileSync(s.path);
            const dims = sizeOf(imgBuffer);
            if (!dims.width || !dims.height) continue;

            const usableWidth = doc.page.width - margin * 2;
            const scale = usableWidth / dims.width;
            const imageHeight = dims.height * scale;

            const estimatedHeight =
                20 +    // step title
                14 +    // time
                10 +    // spacing
                imageHeight +
                20;     // bottom spacing

            const needsNewPage =
                stepsOnCurrentPage >= maxStepsThisPage ||
                doc.y + estimatedHeight > doc.page.height - margin;

            if (needsNewPage) {
                doc.addPage();
                doc.y = margin;
                pageNumber++;
                stepsOnCurrentPage = 0;
            }

            // ---- Step header ----
            doc.fontSize(12).text(`Step: ${s.name}`);
            doc.text(`Time: ${s.time}`);
            doc.moveDown(0.5);

            // ---- Screenshot ----
            doc.image(imgBuffer, {
                width: usableWidth,
                align: 'center'
            });

            doc.moveDown(2);
            stepsOnCurrentPage++;
        }

        doc.end();

        // ---------- WAIT UNTIL WRITTEN ----------
        await new Promise<void>((resolve, reject) => {
            stream.on('close', resolve);
            stream.on('error', reject);
        });

        // ---------- ATTACH TO REPORT ----------
        await test.info().attach(`PDF_${fileName}`, {
            path: pdfPath,
            contentType: 'application/pdf'
        });

        console.info(`[PDF Evidence generated] ${fileName}`);
    }
}