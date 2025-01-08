export async function loader(address) {
  const url = "/segment/" + address;
  const resp = await fetch(url);
  // todo: check response code
  const json = await resp.json();
  return json;
}

export function wrapInMemoryCache(loader) {
  const cache = new Map();
  return async function(address) {
    if (cache.has(address))
      return await cache.get(address);
    const promise = loader(address);
    cache.set(address, promise);
    return await promise;
  }
}

// todo: check for HTTPS requirement
export async function wrapStorageCache(loader) {
  const name = 'hazel/' + window.cache_busting_key + '/segments';
  const cache = await window.caches.open(name);

  return async function(address) {
    const cached = await cache.match(address);
    if (cached !== undefined) {
      const j = await cached.json();
      //console.log("cached:", j);
      return j
    } else {
      const data = await loader(address);
      const resp = Response.json(data);
      await cache.put(address, resp);
      const resp2 = await cache.match(address);
      const j = await resp2.json();
      //console.log("now cached:", j);
      return j
    }
  }
}
