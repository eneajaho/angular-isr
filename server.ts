import "zone.js/dist/zone-node";

import { ngExpressEngine } from "@nguniversal/express-engine";
import * as express from "express";
import { join } from "path";

import { AppServerModule } from "./src/main.server";
import { APP_BASE_HREF } from "@angular/common";
import { existsSync } from "fs";
import { ServerSsrInMemoryCache } from "./server/server-in-memory-cache";

import { handleInvalidation } from "server/server-helpers";
import { CacheHandler } from "server/cache-handler";
import { ServerFileSystemCache } from "server/server-filesystem-cache";

const EXCLUDE_FROM_CACHE = ["/"];

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), "dist/ssr-cache/browser");
  const indexHtml = existsSync(join(distFolder, "index.original.html"))
    ? "index.original.html"
    : "index";

  // const cache: CacheHandler = new ServerSsrInMemoryCache();
  const cache: CacheHandler = new ServerFileSystemCache(`${distFolder}/cache`);

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
      try {
        const cachedHtml = await cache.get(req.url);
        // Cache exists. Send it.
        console.log('Url was retrieved from cache: ', req.url);
        res.send(`${cachedHtml} <h1>From cache</h1>`);
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
          providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
        },
        async (err: Error, html: string) => {
          if (EXCLUDE_FROM_CACHE.includes(req.url)) {
            res.send(html);
            return;
          }
          // Cache the rendered `html` for this request url to use for subsequent requests
          await cache.add(req.url, html);
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
