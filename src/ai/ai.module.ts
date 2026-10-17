import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { GeminiClient } from './clients/gemini.client';
import { OpenAiClient } from './clients/openai.client';

@Module({
  providers: [AiService, GeminiClient, OpenAiClient],
})
export class AiModule {}
