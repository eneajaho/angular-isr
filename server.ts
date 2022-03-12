import { ngExpressEngine } from "@nguniversal/express-engine";
import * as express from "express";
import { existsSync } from "fs";
import { join } from "path";
import { CacheHandler } from "server/cache-handler";
import { handleInvalidation } from "server/handle-invalidation";
import "zone.js/dist/zone-node";
import { checkCacheHandler } from "./server/check-cache-handler";
import { CacheRegeneration } from "./server/handle-regeneration";
import { renderingHandler } from "./server/rendering-handler";
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
  server.engine("html", ngExpressEngine({ bootstrap: AppServerModule }));

  server.set("view engine", "html");
  server.set("views", distFolder);

  server.get(
    "/api/invalidate",
    async (req, res) => await handleInvalidation(cache, req, res, indexHtml)
  );

  // Serve static files from /browser
  server.get("*.*", express.static(distFolder, { maxAge: "1y" }));

  server.get(
    "*",
    // Request Cache handler
    async (req, res, next) => await checkCacheHandler(req, res, next, indexHtml, cache, cacheRegeneration),
    // Angular SSR rendering
    async (req, res, next) => await renderingHandler(req, res, cache, indexHtml)
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
