import { IsNotEmpty, IsString } from 'class-validator';

export class IngestDocumentDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
