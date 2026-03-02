import path from 'path';
import { ExcelReader } from './readers/excel.reader';
import { CsvReader } from './readers/csv.reader';
import { JsonReader } from './readers/json.reader';

export interface DataReader {
  read(): Promise<Array<Record<string, string>>>;
}

export class DataReaderFactory {

  static create(meta: {
    fileType: string;
    filePath: string;
    fileName: string;
    sheetName?: string;
  }): DataReader {

    const fullPath = path.join(meta.filePath, meta.fileName);

    switch (meta.fileType.toLowerCase()) {
      case 'excel':
        if (!meta.sheetName) {
          throw new Error('sheetName is required for Excel');
        }
        return new ExcelReader(fullPath, meta.sheetName);

      case 'csv':
        return new CsvReader(fullPath);

      case 'json':
        return new JsonReader(fullPath);

      default:
        throw new Error(`Unsupported fileType: ${meta.fileType}`);
    }
  }
}