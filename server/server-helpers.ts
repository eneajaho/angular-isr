import { CacheHandler } from "./cache-handler";

export const handleInvalidation = async (
  cache: CacheHandler,
  req: any,
  res: any
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
        message: "The url you provided doesnt exist in cache!",
      });
    }

    try {
      await cache.delete(`${urlToInvalidate}`);

      res.json({
        status: "success",
        message: `Url: ${urlToInvalidate} was removed from cache!`,
      });
    } catch (err) {
      res.json({ status: "error", message: "Error while deleting url!!" });
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
