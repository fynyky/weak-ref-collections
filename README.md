# Weak Ref Collections
Iterable WeakMaps and WeakSets. Provides WeakRefMap and WeakRefSet which store object values using WeakRefs and clean themselves up when garbage collected. Supports both objects and primitives simultaneously. Behaves like normal Map and Set for primitives.

## Installation
```bash
npm install weak-ref-collections
```

## Usage
Unlike WeakMap which stores keys weakly, WeakRefMap stores keys strongly but stores values using WeakRefs. Is fully iterable. Works just like a normal Map object but holds its values weakly and cleans itself up when its values are garbage collected. Follows the [Map API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

```javascript
const { WeakRefMap } = require("weak-ref-collections");

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

Similarly for WeakRefSet is fully iterable unlike WeakSet. Works just like a normal Set object but holds its values weakly and cleans itself up when its values are garbage collected. Follows the [Set API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
```javascript
const { WeakRefSet } = require("weak-ref-set");

weakRefSet = new WeakRefSet();
const element = {"bar": 1};
weakRefSet.add(element);
weakRefSet.has(element);    // true
weakRefSet.delete(element); // true
weakRefSet.clear();         // undefined
weakRefSet.forEach((value, alsoValue, set) => {});
// Supports iteration
for (const [value, alsoValue] of weakRefSet) {}
for (const [value, alsoValue] of weakRefSet.entries()) {}
for (const value of weakRefSet.keys()) {}
for (const value of weakRefSet.values()) {}
```
