import { ExcelOperations } from "../../excel-operations.utils";
import { DataReader } from '../data-reader.factory';

export class ExcelReader implements DataReader {

  constructor(
    private filePath: string,
    private sheetName: string
  ) {}

  async read(): Promise<Array<Record<string, string>>> {
    return ExcelOperations.read(this.filePath, this.sheetName);
  }
}