import { CacheHandler } from "server/cache-handler";
import { CacheData } from "./cache-handler";
import { renderUrl } from "./render-url";

export class CacheRegeneration {
  private urlsOnHold: string[] = []; // urls that have regeneration loading

  constructor(public cache: CacheHandler) {}

  regenerate(
    url: string,
    req: any,
    res: any,
    indexHtml: string,
    cacheData: CacheData
  ): void {
    if (this.urlsOnHold.includes(url)) {
      console.log("Another regeneration is on-going...");
      return;
    }

    const { options } = cacheData;
    const { revalidate } = options;

    console.log(
      `The url: ${url} will be regenerated after ${revalidate} s.`
    );

    this.urlsOnHold.push(url);

    setTimeout(() => {
      // re-render the page again
      renderUrl(url, req, res, indexHtml).then((html) => {
        // add the regenerated page to cache
        this.cache.add(req.url, html, { revalidate }).then(() => {
          // remove url from urlsOnHold
          this.urlsOnHold = this.urlsOnHold.filter((x) => x !== url);
          console.log("Url: " + url + " was regenerated!");
        });
      });
    }, revalidate! * 1000);
  }
}
