/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

const worker = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `clubstonbury-${version}`;
const APP_SHELL = [...build, ...files, '/', '/allocate'];

function hasExpectedAssetType(pathname: string, response: Response): boolean {
  const contentType = response.headers.get('content-type') ?? '';
  if (pathname.endsWith('.js')) return /javascript/u.test(contentType);
  if (pathname.endsWith('.css')) return contentType.includes('text/css');
  return true;
}

async function fetchAndValidate(path: string): Promise<Response> {
  const response = await fetch(path, { cache: 'reload' });
  const pathname = new URL(path, worker.location.origin).pathname;
  if (!response.ok || !hasExpectedAssetType(pathname, response)) {
    throw new Error(`Invalid app-shell response for ${pathname}`);
  }
  return response;
}

worker.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.all(
        APP_SHELL.map(async (path) => await cache.put(path, await fetchAndValidate(path))),
      );
    }).then(() => worker.skipWaiting()),
  );
});

worker.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    ).then(() => worker.clients.claim()),
  );
});

worker.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== worker.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          void caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(async () => (await caches.match(request)) ?? (await caches.match('/'))!),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) =>
      cached ?? fetch(request).then((response) => {
        if (response.ok && hasExpectedAssetType(url.pathname, response)) {
          const copy = response.clone();
          void caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(() => {
        throw new Error(`Offline asset was not cached: ${url.pathname}`);
      })
    ),
  );
});
