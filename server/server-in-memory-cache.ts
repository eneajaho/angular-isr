import { CacheHandler } from "./cache-handler";

export class ServerSsrInMemoryCache implements CacheHandler {
  private cache = new Map<string, string>();

  add(url: string, html: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cache.set(url, html);
      resolve();
    })
  }

  get(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if(this.cache.has(url)) {
        const html = this.cache.get(url)!;
        resolve(html);
      }
      reject('This url does not exist in cache!');
    })
  }

  getAll(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      resolve(Array.from(this.cache.keys()))
    })
  }

  has(url: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(this.cache.has(url));
    })
  }

  delete(url: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(this.cache.delete(url));
    })
  }
}