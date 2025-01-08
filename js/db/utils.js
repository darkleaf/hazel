// todo: should asm.js hints be used here?
// int: x|0
export function searchFirst(keys, key, cmp) {
  let low = 0;
  let high = keys.length; // а норм ли постоянно ее спрашивать?
  while (low < high) {
    let mid = (high + low) >>> 1;
    let d = cmp(keys[mid], key);
    if (d < 0)
      low = mid + 1;
    else
      high = mid;
  }
  return low;
}

export function searchLast(keys, key, cmp) {
  let low = 0;
  let high = keys.length;
  while (low < high) {
    let mid = (high + low) >>> 1;
    let d = cmp(keys[mid], key);
    if (d <= 0)
      low = mid + 1;
    else
      high = mid;
  }
  return low - 1;
}
