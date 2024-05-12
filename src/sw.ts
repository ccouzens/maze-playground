/// <reference lib="WebWorker" />

// export empty type because of tsc --isolatedModules flag
export type {};
declare const self: ServiceWorkerGlobalScope;
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  console.log("fetch requested", url.href);
  event.respondWith(fetch(url));
});
