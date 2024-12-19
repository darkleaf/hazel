export async function loader(address) {
  const url = "/segment/" + address;
  const resp = await fetch(url);
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
