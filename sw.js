const CACHE_NAME = "luyen-anh-cache-v2";
const FILES_TO_CACHE = [
  "./index.html",
  "./app.js",
  "./data.js",
  "./manifest.json"
];

self.addEventListener("install", (event)=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache=>cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event)=>{
  event.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: luôn thử lấy bản mới nhất từ mạng/đĩa trước, chỉ dùng
// cache khi không có mạng (offline). Tránh việc app bị "kẹt" ở bản cũ
// sau khi code được cập nhật.
self.addEventListener("fetch", (event)=>{
  event.respondWith(
    fetch(event.request).then(resp=>{
      const respClone = resp.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(event.request, respClone));
      return resp;
    }).catch(()=>caches.match(event.request))
  );
});
