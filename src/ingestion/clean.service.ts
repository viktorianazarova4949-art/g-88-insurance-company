import { Injectable } from '@nestjs/common';

@Injectable()
export class CleanService {
  cleanText(text: string): string {
    return text.replace(/ +/g, ' ').trim();
    // убрали пробелы в нутри). с наружи предложения
  }
}