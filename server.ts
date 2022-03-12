import { APP_BASE_HREF } from "@angular/common";
import { ngExpressEngine } from "@nguniversal/express-engine";
import * as express from "express";
import { existsSync } from "fs";
import { join } from "path";
import { CacheHandler } from "server/cache-handler";
import { getISROptions } from "server/get-isr-options";
import { handleInvalidation } from "server/handle-invalidation";
import "zone.js/dist/zone-node";
import { CacheRegeneration } from './server/handle-regeneration';
import { ServerSsrInMemoryCache } from "./server/server-in-memory-cache";
import { AppServerModule } from "./src/main.server";


// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), "dist/ssr-cache/browser");
  const indexHtml = existsSync(join(distFolder, "index.original.html"))
    ? "index.original.html"
    : "index";

  const cache: CacheHandler = new ServerSsrInMemoryCache();
  // const cache: CacheHandler = new ServerFileSystemCache(`${distFolder}/cache`);

  const cacheRegeneration = new CacheRegeneration(cache);

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine(
    "html",
    ngExpressEngine({
      bootstrap: AppServerModule,
    })
  );

  server.set("view engine", "html");
  server.set("views", distFolder);

  server.get(
    "/api/invalidate",
    async (req, res) => await handleInvalidation(cache, req, res)
  );

  // Serve static files from /browser
  server.get(
    "*.*",
    express.static(distFolder, {
      maxAge: "1y",
    })
  );

  server.get(
    "*",
    async (req, res, next) => {
      // initial request, no cache => render it, and decide to cache it or not
      // second request, has cache, has invalidate > 0,
      // will start a setTimeout in order to re-generate after x seconds
      // third request, is the same as second, different user -> will get first user cache,
      // after the timeout of the first request ends, we need to regenerate that page again.
      // for the moment we just clear it from cache, so what we should do is to call the render again

      try {
        const cacheData = await cache.get(req.url);
        const { html, options, createdAt } = cacheData;

        // const lastCacheDateDiff = (Date.now() - createdAt) / 1000; // in seconds
        if (options.revalidate && options.revalidate > 0) {
          cacheRegeneration.addToQueue(req.url, cacheData)
        }

        // Cache exists. Send it.
        console.log("Page was retrieved from cache: ", req.url);
        res.send(`${html} <h1>From cache</h1>`);
      } catch (error) {
        // Cache does not exist. Render a response using the Angular app
        next();
      }
    },
    // Angular SSR rendering
    (req, res) => {
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
          // if revalidate is 0, we will never clear cache automatically
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
    }
  );

  return server;
}

function run(): void {
  const port = process.env["PORT"] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = (mainModule && mainModule.filename) || "";
if (moduleFilename === __filename || moduleFilename.includes("iisnode")) {
  run();
}

export * from "./src/main.server";
