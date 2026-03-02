import * as path from 'path';
import ExcelJS from 'exceljs';

export class RunConfigOperations {

  /**
   * Reads RunConfig sheet and returns runnable test case tags
   */
  static async getRunnableTags(
    relativeFilePath: string
  ): Promise<string[]> {

    const absPath = path.join(process.cwd(), relativeFilePath);
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(absPath);
    const worksheet = workbook.getWorksheet('RunConfig');

    if (!worksheet) {
      console.warn('RunConfig sheet not found');
      return [];
    }

    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell, colIndex) => {
      headers[colIndex] = String(cell.value ?? '');
    });

    const runnableTags: string[] = [];

    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex === 1) return;

      const rowData: Record<string, string> = {};
      row.eachCell((cell, colIndex) => {
        rowData[headers[colIndex]] = String(cell.value ?? '');
      });

      if (String(rowData.Run).toUpperCase() === 'YES') {
        runnableTags.push(String(rowData.TestCaseId).trim());
      }
    });

    return runnableTags;
  }
}