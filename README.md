# Angular Incremental Static Regeneration [Stackblitz](https://stackblitz.com/edit/node-wnd7rs?file=server.ts)
This project tries to add a way to generate static pages in runtime and also gives an api to invalidate cached pages.

## How it works?
The first time a user opens a pages, we server-side render that page, and save its result in cache.

Next time when a user requests the same page he will be served the first cached response.

There are cases when we don't want to cache pages, and that's why **EXCLUDE_FROM_CACHE** array is used.
For every url we don't want to serve as static page, we need to add it in the array.
_By default `/` path is excluded._

If we want to invalidate the cache for a specific page we need to do a get request like this:
```bash
curl /api/invalidate?secret=<token-here>&urlToInvalidate=<url-here>
```
Example:
```bash
curl /api/invalidate?secret=MY_TOKEN&urlToInvalidate=/one
```

**CacheHandler** has two implementations:
- InMemory Cache
- FileSystem Cache

## What's next?
- Cache pages based on routing data
- Add cache timeout
- Add Redis implementation to handle cache
- Add an api to invalidate multiple pages at once (using post request with urls in body)