export abstract class CacheHandler {
  abstract add(url: string, html: string): Promise<void>
  abstract get(url: string): Promise<string>
  abstract has(url: string): Promise<boolean>
  abstract delete(url: string): Promise<boolean>
  abstract getAll(): Promise<string[]>
  abstract clearCache?(): Promise<boolean>
}