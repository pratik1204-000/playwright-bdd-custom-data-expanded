import fs from 'fs';
import { DataReader } from '../data-reader.factory';

export class CsvReader implements DataReader {

  constructor(private filePath: string) {}

  async read(): Promise<Array<Record<string, string>>> {
    const content = fs.readFileSync(this.filePath, 'utf8');
    const [headerLine, ...lines] = content.split('\n').filter(Boolean);

    const headers = headerLine.split(',').map(h => h.trim());

    return lines.map(line => {
      const values = line.split(',');
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = values[i]?.trim() ?? '';
      });
      return row;
    });
  }
}