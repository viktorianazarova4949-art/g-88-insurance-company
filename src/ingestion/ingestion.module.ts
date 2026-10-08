import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { VectorStorageModule } from '../vector-strage/vector-storage.module';
import { TxtExtractor } from './extractors/txt.extractor';
import { CleanService } from './clean.service';
import { ChunkingService } from './chunking.service';

@Module({
  controllers: [IngestionController],
  providers: [IngestionService,TxtExtractor,CleanService,ChunkingService],
  imports: [VectorStorageModule],
})
export class IngestionModule {}
