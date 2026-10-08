import { Injectable } from '@nestjs/common';
import { Document } from 'langchain';
import { QdrantVectorStore } from '@langchain/qdrant';

@Injectable()
export class VectorStorageService {
  constructor(private readonly vectorStore: QdrantVectorStore) {}

  async saveToDb(texts: string[]): Promise<void> {
    const documents: Document[] = this.mapTextsToDocuments(texts);
    await this.vectorStore.addDocuments(documents);
  }

  private mapTextsToDocuments(texts: string[]): Document[] {
    return texts.map((t: string): Document => new Document({ pageContent: t }));
  }
}
