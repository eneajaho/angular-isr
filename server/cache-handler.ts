export interface PageCacheOptions {
  revalidate: number | null; // null, 0, > 0
}

export interface CacheData {
  html: string;
  options: PageCacheOptions;
  createdAt: number;
  deployId?: string;
}

export abstract class CacheHandler {
  abstract add(url: string, html: string, options?: PageCacheOptions): Promise<void>
  abstract get(url: string): Promise<CacheData>
  abstract has(url: string): Promise<boolean>
  abstract delete(url: string): Promise<boolean>
  abstract getAll(): Promise<string[]>
  abstract clearCache?(): Promise<boolean>
}