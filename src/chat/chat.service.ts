import { Injectable } from '@nestjs/common';
import { VectorStorageService } from '../vector-strage/vector-storage.service';

@Injectable()
export class ChatService {
  constructor(private readonly vectorStorageService: VectorStorageService) {}

  async generateResponse(request: string): Promise<string> {
    const relevantChunks: string[] =
      await this.vectorStorageService.getRelevantChunks(request);

    console.log('Question:');
    console.log(request + '\n');
    console.log('Relevant chunks:' + '\n');
    relevantChunks.forEach((c: string): void => console.log(c + '\n'));

    return 'Здесь будет ответ ИИ';
  }
}
