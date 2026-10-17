import { Injectable } from '@nestjs/common';
import { VectorStorageService } from '../vector-strage/vector-storage.service';
import { TxtExtractor } from './extractors/txt.extractor';
import { CleanService } from './clean.service';
import { ChunkingService } from './chunking.service';
import { MultiformatExtractor } from './extractors/multiformat.extractor';


@Injectable()
export class IngestionService {
  constructor(
    private readonly storageService: VectorStorageService,
    private readonly multiformatExtractor: MultiformatExtractor,
    private readonly cleanService: CleanService,
    private readonly chunkingService: ChunkingService,
  ) {}

  async ingest(file: Express.Multer.File): Promise<void> {
    // прочитать текст из переданного файла

    const text: string = await this.multiformatExtractor.extract(file);
    // очистить файл от мусора (лишние пробелы)

    const cleanedText: string = this.cleanService.cleanText(text);
    // разбить очищенный текст на чанки

    const chunks: string[] =
      this.chunkingService.chunkBySizeWithOverlap(cleanedText);

    // полученные чанки передать в storageService для сохранения в БД
    await this.storageService.saveToDb(chunks);
  }
}
