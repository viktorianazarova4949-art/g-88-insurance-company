import { Injectable } from '@nestjs/common';
import { VectorStorageService } from '../vector-strage/vector-storage.service';
import { TxtExtractor } from './extractors/txt.extractor';
import { CleanService } from './clean.service';
import { ChunkingService } from './chunking.service';


@Injectable()
export class IngestionService {
  constructor(
    private readonly storageService: VectorStorageService,
    private readonly txtExtractor: TxtExtractor,
    private readonly cleanService: CleanService,
    private readonly chunkingService: ChunkingService,
  ) {}

  async ingest(file: Express.Multer.File): Promise<void> {
    // прочитать текст из переданного файла

    const text: string = this.txtExtractor.extract(file.buffer);
    // очистить файл от мусора (лишние пробелы)

    const cleanedText: string = this.cleanService.cleanText(text);
    // разбить очищенный текст на чанки

    const chunks: string[] =
      this.chunkingService.chunkBySizeWithOverlap(cleanedText);

    // полученные чанки передать в storageService для сохранения в БД
    await this.storageService.saveToDb(chunks);
  }
}
