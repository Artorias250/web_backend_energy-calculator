"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionForMime = extensionForMime;
exports.latinObjectName = latinObjectName;
exports.isStoredObjectKey = isStoredObjectKey;
exports.resolveMediaUrl = resolveMediaUrl;
const crypto_1 = require("crypto");
const DEFAULT_IMAGE = '/media/default.png';
const DEFAULT_VIDEO = '/media/default.mp4';
const EXTENSION_BY_MIME = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
};
function extensionForMime(mime) {
    return EXTENSION_BY_MIME[mime] ?? null;
}
function latinObjectName(kind, mime) {
    const extension = extensionForMime(mime);
    if (!extension) {
        throw new Error(`Неподдерживаемый тип файла: ${mime}`);
    }
    const suffix = (0, crypto_1.randomBytes)(4).toString('hex');
    return `${kind}-${Date.now()}-${suffix}.${extension}`;
}
function isStoredObjectKey(value) {
    if (!value || value.trim() === '') {
        return false;
    }
    return !/^https?:\/\//i.test(value);
}
function resolveMediaUrl(stored, kind) {
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
//# sourceMappingURL=media-url.js.map