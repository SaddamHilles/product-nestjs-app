import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class FilesUploadDto {
  @ApiProperty({
    type: 'array',
    name: 'files',
    items: { type: 'string', format: 'binary' },
  })
  file: Array<Express.Multer.File>;
}
