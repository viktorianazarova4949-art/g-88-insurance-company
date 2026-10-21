import { Injectable } from '@nestjs/common';
import { VectorStorageService } from '../vector-strage/vector-storage.service';
import { CleanService } from './clean.service';
import { ChunkingService } from './chunking.service';
import { MultiformatExtractor } from './extractors/multiformat.extractor';
import { Document } from 'langchain';

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
    const pages: string[] = await this.multiformatExtractor.extract(file);

    // // очистить файл от мусора (лишние пробелы)
    const cleanedPages: string[] = this.cleanService.cleanTexts(pages);

   // console.log(cleanedPages);

    // // разбить очищенный текст на чанки
    const chunks: Document[] = this.chunkingService.chunkBySizeWithOverlap(
      cleanedPages,
      file.originalname
    );

    //console.log(chunks);

    // // полученные чанки передать в storageService для сохранения в БД
    await this.storageService.saveToDb(chunks);
  }
}
