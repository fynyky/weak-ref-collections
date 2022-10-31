# WeakRefMap
A Map of WeakRefs. Unlike WeakMap which stores keys weakly, this stores keys strongly but stores values using WeakRefs. Is fully iterable. Works just like a normal Map object but holds its values weakly and cleans itself up when its values are garbage collected.

Follows the (Map API)[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map]

```javascript
const { WeakRefMap } = require("weak-ref-map");

weakRefMap = new WeakRefMap();
weakRefMap.set("foo", {"bar": 1});
weakRefMap.get("foo");    // {"bar":1}
weakRefMap.has("foo");    // true
weakRefMap.delete("foo"); // true
weakRefMap.clear();       // undefined
weakRefMap.forEach((value, key, map) => {});

// Supports iteration
for (const [key, value] of weakRefMap) {}
for (const [key, value] of weakRefMap.entries()) {}
for (const key of weakRefMap.keys()) {}
for (const value of weakRefMap.values()) {}
```