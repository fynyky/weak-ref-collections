const assert = require("assert");
const WeakRefMap = require("./index.js");

describe("WeakValueMap", () => {

  let weakRefMap, regularMap;
  let normalizeMap = (a) => JSON.stringify(Array.from(a));

  it("can be created", () => {
    weakRefMap = new WeakRefMap();
    regularMap = new Map();
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap));
  });

  it("can be created from an existing iterable", () => {
    const iterableSeed = [
      ["foo", {"qoo": 1}],
      ["bar", {"qar": 2}]
    ]
    weakRefMap = new WeakRefMap(iterableSeed);
    regularMap = new Map(iterableSeed);
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap));
  });

  it("can set a value", () => {
    weakRefMap.set("baz", {"qux": 3 });
    regularMap.set("baz", {"qux": 3 });
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap));
  });

  it("can have a value gotten", () => {
    const weakValueResult = weakRefMap.get("foo");
    const regularResult = regularMap.get("foo");
    assert(JSON.stringify(weakValueResult) === '{"qoo":1}');
    assert(JSON.stringify(weakValueResult) === JSON.stringify(regularResult));
  });

  it("can fails to get a nonexistent value", () => {
    const weakValueResult = weakRefMap.get("food");
    const regularResult = regularMap.get("food");
    assert(typeof weakValueResult === 'undefined');
    assert(JSON.stringify(weakValueResult) === JSON.stringify(regularResult));
  });

  it("can check if it has a value", () => {
    assert(weakRefMap.has("foo") === true);
    assert(weakRefMap.has("foo") === regularMap.has("foo"));
  });

  it("can check if it does not have a value", () => {
    assert(weakRefMap.has("food") === false);
    assert(weakRefMap.has("food") === regularMap.has("food"));
  });

  it("can delete a value", () => {
    weakRefMap.delete("foo");
    regularMap.delete("foo"); 
    assert(normalizeMap(weakRefMap) === '[["bar",{"qar":2}],["baz",{"qux":3}]]');
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap));
  });

  it("can clear all values", () => {
    weakRefMap.clear();
    regularMap.clear()
    assert(normalizeMap(weakRefMap) === '[]');
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap));
  });

  it("can be iterated over", () => {
    const seedData = [
      ["foo", {"qoo": 1}],
      ["bar", {"qar": 2}]
    ];
    let weakValueResult = "";
    let regularResult = "";
    weakRefMap = new WeakRefMap(seedData);
    regularMap = new Map(seedData);
    for (const [key, value] of weakRefMap) {
      weakValueResult += JSON.stringify([key, value]);
    }
    for (const [key, value] of regularMap) {
      regularResult += JSON.stringify([key, value]);
    }
    assert(weakValueResult === '["foo",{"qoo":1}]["bar",{"qar":2}]');
    assert(weakValueResult === regularResult);
  });

  it("can use forEach", () => {
    let weakValueResult = "";
    let regularResult = "";
    weakRefMap.forEach((value, key) => {
      weakValueResult += JSON.stringify([key, value]);
    });
    regularMap.forEach((value, key) => {
      regularResult += JSON.stringify([key, value]);
    });
    assert(weakValueResult === '["foo",{"qoo":1}]["bar",{"qar":2}]');
    assert(weakValueResult === regularResult);
  });

  it("can iterate over entries", () => {
    let weakValueResult = "";
    let regularResult = "";
    for (const [key, value] of weakRefMap.entries()) {
      weakValueResult += JSON.stringify([key, value]);
    }
    for (const [key, value] of regularMap) {
      regularResult += JSON.stringify([key, value]);
    }
    assert(weakValueResult === '["foo",{"qoo":1}]["bar",{"qar":2}]');
    assert(weakValueResult === regularResult);
  });

  it("can iterate over keys", () => {
    let weakValueResult = "";
    let regularResult = "";
    for (const key of weakRefMap.keys()) {
      weakValueResult += JSON.stringify(key);
    }
    for (const key of regularMap.keys()) {
      regularResult += JSON.stringify(key);
    }
    assert(weakValueResult === '"foo""bar"');
    assert(weakValueResult === regularResult);
  });


  it("can iterate over values", () => {
    let weakValueResult = "";
    let regularResult = "";
    for (const value of weakRefMap.values()) {
      weakValueResult += JSON.stringify(value);
    }
    for (const value of regularMap.values()) {
      regularResult += JSON.stringify(value);
    }
    assert(weakValueResult === '{"qoo":1}{"qar":2}');
    assert(weakValueResult === regularResult);
  });

});