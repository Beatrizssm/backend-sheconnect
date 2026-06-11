import { BadRequestException } from '@nestjs/common';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function normalizeProfileImage(value: string | null | undefined): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value.trim() === '') {
    return null;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const match = value.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
  if (!match) {
    throw new BadRequestException('Formato de imagem inválido. Use JPG, PNG ou WEBP.');
  }

  const mime = match[1].toLowerCase();
  if (!ALLOWED_MIME.includes(mime)) {
    throw new BadRequestException('Formato de imagem inválido. Use JPG, PNG ou WEBP.');
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.byteLength > MAX_BYTES) {
    throw new BadRequestException('A imagem deve ter no máximo 5MB.');
  }

  return value;
}
