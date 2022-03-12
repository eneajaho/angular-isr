import { CacheHandler } from "server/cache-handler";
import { CacheData } from "./cache-handler";

export class CacheRegeneration {
  private urlsThatHaveRegenerationLoading: string[] = [];

  constructor(public cache: CacheHandler) {}

  addToQueue(url: string, cacheData: CacheData): void {
    if (this.urlsThatHaveRegenerationLoading.includes(url)) {
      console.log("Another regeneration for this page is on-going, so returning.");
      return;
    }

    const { options } = cacheData;

    console.log(
      "Added timeout, and after: " +
        options.revalidate +
        " seconds, we will re-generate this page: " + url
    );

    this.urlsThatHaveRegenerationLoading.push(url);

    setTimeout(() => {
      console.log("I'm deleting the cache for: ", url);
      this.cache.delete(url).then(() => {
        this.urlsThatHaveRegenerationLoading =
          this.urlsThatHaveRegenerationLoading.filter((x) => x !== url);
      });
    }, options.revalidate! * 1000);
  }
}
