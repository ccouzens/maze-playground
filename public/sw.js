addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  console.log("fetch requested", url);
  event.respondWith(fetch(url));
});
