export declare function extensionForMime(mime: string): string | null;
export declare function latinObjectName(kind: 'image' | 'video', mime: string): string;
export declare function isStoredObjectKey(value: string | null | undefined): value is string;
export declare function resolveMediaUrl(stored: string | null | undefined, kind: 'image' | 'video'): string;
