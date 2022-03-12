import { CacheHandler } from "server/cache-handler";
import { CacheRegeneration } from "./handle-regeneration";

export const checkCacheHandler = async (
  req: any,
  res: any,
  next: any,
  indexHtml: string,
  cache: CacheHandler,
  cacheRegeneration: CacheRegeneration
) => {
  try {
    const cacheData = await cache.get(req.url);
    const { html, options, createdAt } = cacheData;

    // const lastCacheDateDiff = (Date.now() - createdAt) / 1000; // in seconds
    if (options.revalidate && options.revalidate > 0) {
      cacheRegeneration.regenerate(req.url, req, res, indexHtml, cacheData);
    }

    // Cache exists. Send it.
    console.log("Page was retrieved from cache: ", req.url);
    res.send(`${html} <h1>From cache</h1>`);
  } catch (error) {
    // Cache does not exist. Serve user using SSR
    next();
  }
};
