import { APP_BASE_HREF } from "@angular/common";
import { CacheHandler } from "./cache-handler";
import { getISROptions } from "./get-isr-options";

export const renderingHandler = async (
  req: any,
  res: any,
  cache: CacheHandler,
  indexHtml: string
) => {
  res.render(
    indexHtml,
    {
      req,
      providers: [
        { provide: APP_BASE_HREF, useValue: req.baseUrl },
        // { provide: 'ssrRequest', useValue: req }
      ],
    },
    async (err: Error, html: string) => {
      const { revalidate } = getISROptions(html);

      // if revalidate is null we won't cache it
      // if revalidate is 0, we will never clear the cache automatically
      // if revalidate is x, we will clear cache every x seconds (after the last request) for that url

      if (revalidate === null) {
        res.send(html);
        return;
      }

      // Cache the rendered `html` for this request url to use for subsequent requests
      await cache.add(req.url, html, { revalidate });
      res.send(html);
    }
  );
};
