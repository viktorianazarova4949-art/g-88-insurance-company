import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { VectorStorageModule } from '../vector-strage/vector-storage.module';
import { AiModule } from '../ai/ai.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
  imports: [VectorStorageModule, AiModule],
})
export class ChatModule {}
