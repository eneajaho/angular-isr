import { renderUrl } from "./render-url";
import { CacheHandler } from "./cache-handler";
import { getISROptions } from "./get-isr-options";

export const handleInvalidation = async (
  cache: CacheHandler,
  req: any,
  res: any,
  indexHtml: string
) => {
  // if (req.query.secret !== process.env.MY_SECRET_TOKEN) {

  const { secretToken, urlToInvalidate } = extractData(req);

  if (secretToken !== "MY_TOKEN") {
    res.json({ status: "error", message: "Your secret token is wrong!!!" });
  }

  if (!urlToInvalidate) {
    res.json({
      status: "error",
      message: "Please add `urlToInvalidate` query param in your url",
    });
  }

  if (urlToInvalidate) {
    if (!cache.has(urlToInvalidate)) {
      res.json({
        status: "error",
        message: "The url you provided doesn't exist in cache!",
      });
    }

    try {
      // re-render the page again
      const html = await renderUrl(urlToInvalidate, req, res, indexHtml);
      // get revalidate data in order to set it to cache data
      const { revalidate } = getISROptions(html);
      // add the regenerated page to cache
      await cache.add(req.url, html, { revalidate });

      console.log(`Url: ${urlToInvalidate} was regenerated!`);

      res.json({
        status: "success",
        message: `Url: ${urlToInvalidate} was regenerated!`,
      });
    } catch (err) {
      res.json({ status: "error", message: "Error while regenerating url!!" });
    }
  }
};

const extractData = (req: any) => {
  return {
    secretToken: req.query["secret"] || null,
    urlToInvalidate: req.query["urlToInvalidate"] || null,
    // urlsToInvalidate: req.body.urls || [],
  };
};
