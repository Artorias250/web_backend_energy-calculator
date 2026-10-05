import { randomBytes } from 'crypto';

const DEFAULT_IMAGE = '/media/default.png';
const DEFAULT_VIDEO = '/media/default.mp4';

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
};

export function extensionForMime(mime: string): string | null {
  return EXTENSION_BY_MIME[mime] ?? null;
}

export function latinObjectName(kind: 'image' | 'video', mime: string): string {
  const extension = extensionForMime(mime);
  if (!extension) {
    throw new Error(`Неподдерживаемый тип файла: ${mime}`);
  }
  const suffix = randomBytes(4).toString('hex');
  return `${kind}-${Date.now()}-${suffix}.${extension}`;
}

export function isStoredObjectKey(
  value: string | null | undefined,
): value is string {
  if (!value || value.trim() === '') {
    return false;
  }
  return !/^https?:\/\//i.test(value);
}

export function resolveMediaUrl(
  stored: string | null | undefined,
  kind: 'image' | 'video',
): string {
  if (!stored || stored.trim() === '') {
    return kind === 'image' ? DEFAULT_IMAGE : DEFAULT_VIDEO;
  }
  if (/^https?:\/\//i.test(stored)) {
    return stored;
  }

  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  const bucket = process.env.MINIO_BUCKET || 'appliances';
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  return `${protocol}://${endpoint}:${port}/${bucket}/${stored}`;
}
