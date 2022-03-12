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
- FileSystem Cache (for the moment is in broken state)

## How to use it?
To handle Incremental Static Regeneration, we need to configure it from our route data.

For example:
```ts
const routes: Routes = [
  {
    path: "one",
    component: PageOneComponent,
  },
  {
    path: "two",
    component: PageTwoComponent,
    data: { revalidate: 5 },
  },
  {
    path: "three",
    component: PageThreeComponent,
    data: { revalidate: 0 },
  },
];
```

- Path `/one` won't be cached at all, and everytime it is requested it will be server-rendered and then will be server to the user.

- Path `/two` on the first request will be server-rendered and then will be cached. On the second request to it, the user will be served the cache that we got on the first request.
But, now we will start a timer, in order to re-generate _(for the moment we just delete the cache)_ the cache after `5` seconds.
On the third request to the same url, if the timer was finished before the third request, the user would be served with a server-rendered page, and that page will be added to cache. If the timer was not finished, the user would be served with cache of the first request. **Coming soon: after the timer is finished the third request would be servered with a cached page, and the user will not wait for the server to server-render it.**

- Path `/three` after the first request that is server-rendered, the page will be added to cache and the cache will never be deleted automatically as in path `/two`. So after the first request, all the other ones will come from cache.

## What's next?
- Add create cache at production build
- Regenrate page cache after it is deleted in revalidation
- Add Redis implementation to handle cache
- Add an api to invalidate multiple pages at once (using post request with urls in body)