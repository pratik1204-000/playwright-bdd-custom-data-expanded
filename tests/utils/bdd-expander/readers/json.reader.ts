import fs from 'fs';
import { DataReader } from '../data-reader.factory';

export class JsonReader implements DataReader {

  constructor(private filePath: string) {}

  async read(): Promise<Array<Record<string, string>>> {
    const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));

    if (!Array.isArray(data)) {
      throw new Error('JSON data must be an array of objects');
    }

    return data;
  }
}