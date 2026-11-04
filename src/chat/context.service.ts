import { Injectable } from '@nestjs/common';
import { SimilaritySearchResult } from '../exceptions/types/similarity-search-result';
import { QdrantPayload } from '../exceptions/types/qdrant-payload';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ContextService {
  private readonly overlap: number;

  constructor(private readonly configService: ConfigService) {
    this.overlap = Number(
      this.configService.getOrThrow('CHUNK_OVERLAP_IN_WORDS'),
    );
  }

  generateContext(chunks: SimilaritySearchResult[]): string[] {
    // 1. Группируем чанки по принадлежности к конкретным документам.
    const chunksByDocId: Map<string, SimilaritySearchResult[]> =
      this.groupChunksByDocumentId(chunks);

    // 2. Сортируем чанки по индексам внутри каждой группы.
    this.sortChunksByIndex(chunksByDocId);

    // 3. Внутри каждой группы объединяем соседние чанки.
    for (const [documentId, documentChunks] of chunksByDocId.entries()) {
      const unionChunks: SimilaritySearchResult[] =
        this.unionNeighborChunks(documentChunks);
      chunksByDocId.set(documentId, unionChunks);
    }

    // 4. Объединяем все чанки из групп обратно в единый массив.
    let processedChunks: SimilaritySearchResult[] =
      this.flatGroupedChunks(chunksByDocId);

    // 5. Сортируем чанки по убыванию score (самый нерелевантный окажется самым последним).
    processedChunks.sort(
      (c1: SimilaritySearchResult, c2: SimilaritySearchResult): number =>
        c2.score - c1.score,
    );

    // 6. Контролируем размер контекста и отбрасываем наименее релевантные, если контекст слишком большой.
    processedChunks = this.getLimitedChunks(processedChunks);

    // 7. Преобразуем полученные чанки в текст и возвращаем результат.
    return processedChunks.map(
      (c: SimilaritySearchResult): string => c.payload.content,
    );
  }

  private getLimitedChunks(
    chunks: SimilaritySearchResult[],
  ): SimilaritySearchResult[] {
    const maxLengthInWords: number = Number(
      this.configService.getOrThrow('MAX_CONTEXT_LENGTH_IN_WORDS'),
    );

    const result: SimilaritySearchResult[] = [];
    let currentLengthInWords: number = 0;

    for (const chunk of chunks) {
      const chunkLengthInWords: number =
        chunk.payload.content.split(/\s+/).length;
      if (currentLengthInWords + chunkLengthInWords <= maxLengthInWords) {
        result.push(chunk);
        currentLengthInWords += chunkLengthInWords;
      }
    }

    return result;
  }

  private flatGroupedChunks(
    chunksByDocId: Map<string, SimilaritySearchResult[]>,
  ): SimilaritySearchResult[] {
    const result: SimilaritySearchResult[] = [];
    for (const chunks of chunksByDocId.values()) {
      chunks.forEach((c: SimilaritySearchResult): void => {
        result.push(c);
      });
    }
    return result;
  }

  private unionNeighborChunks(
    chunks: SimilaritySearchResult[],
  ): SimilaritySearchResult[] {
    if (chunks.length < 2) {
      return chunks;
    }

    const result: SimilaritySearchResult[] = [];
    let previousChunk: SimilaritySearchResult = chunks[0];

    for (let i: number = 1; i < chunks.length; i++) {
      const currentChunk: SimilaritySearchResult = chunks[i];

      if (
        currentChunk.payload.metadata.index -
          previousChunk.payload.metadata.index ===
        1
      ) {
        previousChunk = this.unionChunksWithOverlapCutting(
          previousChunk,
          currentChunk,
        );
      } else {
        result.push(previousChunk);
        previousChunk = currentChunk;
      }
    }

    result.push(previousChunk);
    return result;
  }

  private unionChunksWithOverlapCutting(
    previousChunk: SimilaritySearchResult,
    currentChunk: SimilaritySearchResult,
  ): SimilaritySearchResult {
    const unionPayload: QdrantPayload = new QdrantPayload();
    unionPayload.metadata.documentId =
      previousChunk.payload.metadata.documentId;
    unionPayload.metadata.index = currentChunk.payload.metadata.index;
    unionPayload.content = this.concatTextsWithOverlapCutting(
      previousChunk.payload.content,
      currentChunk.payload.content,
    );

    const union: SimilaritySearchResult = new SimilaritySearchResult();
    union.payload = unionPayload;
    union.score = Math.max(previousChunk.score, currentChunk.score);

    return union;
  }

  private concatTextsWithOverlapCutting(text1: string, text2: string): string {
    const text2WithoutOverlap: string = text2
      .split(/\s+/)
      .slice(this.overlap)
      .join(' ');

    return `${text1} ${text2WithoutOverlap}`;
  }

  private sortChunksByIndex(
    chunksByDocId: Map<string, SimilaritySearchResult[]>,
  ): void {
    for (const chunks of chunksByDocId.values()) {
      chunks.sort(
        (c1: SimilaritySearchResult, c2: SimilaritySearchResult): number =>
          c1.payload.metadata.index - c2.payload.metadata.index,
      );
    }
  }

  private groupChunksByDocumentId(
    chunks: SimilaritySearchResult[],
  ): Map<string, SimilaritySearchResult[]> {
    const chunksByDocId: Map<string, SimilaritySearchResult[]> = new Map<
      string,
      SimilaritySearchResult[]
    >();

    chunks.forEach((c: SimilaritySearchResult): void => {
      const documentId: string = c.payload.metadata.documentId;

      if (chunksByDocId.has(documentId)) {
        chunksByDocId.get(documentId)?.push(c);
      } else {
        chunksByDocId.set(documentId, [c]);
      }
    });

    return chunksByDocId;
  }
}
