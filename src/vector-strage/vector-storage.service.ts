import { Injectable } from '@nestjs/common';
import { Document } from 'langchain';
import { QdrantVectorStore } from '@langchain/qdrant';
import { ConfigService } from '@nestjs/config';
import { DocumentInterface } from '@langchain/core/documents';

@Injectable()
export class VectorStorageService {
  private readonly topKValue: number;

  constructor(
    private readonly vectorStore: QdrantVectorStore,
    private readonly configService: ConfigService,
  ) {
    this.topKValue = Number(this.configService.getOrThrow('TOP_K_VALUE'));
  }

  async saveToDb(texts: string[]): Promise<void> {
    const documents: Document[] = this.mapTextsToDocuments(texts);
    await this.vectorStore.addDocuments(documents);
  }

  async getRelevantChunks(request: string): Promise<string[]> {
    const result: DocumentInterface[] =
      await this.vectorStore.similaritySearch(request, this.topKValue);
    return this.mapDocumentsToTexts(result);
  }
//TEXT=>DOKUMENT
  private mapTextsToDocuments(texts: string[]): Document[] {
    return texts.map((t: string): Document => new Document({ pageContent: t }));
  }
//DOKUMENT=>TEXT
  private mapDocumentsToTexts(documents: DocumentInterface[]): string[] {
    return documents.map((d: DocumentInterface): string => d.pageContent);
  }
}
