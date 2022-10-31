/* global describe, it */
const assert = require('assert')
const { WeakRefMap, WeakRefSet } = require('./index.js')

describe('WeakRefMap', () => {
  let weakRefMap, regularMap
  const normalizeMap = (a) => JSON.stringify(Array.from(a))

  it('can be created', () => {
    weakRefMap = new WeakRefMap()
    regularMap = new Map()
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap))
  })

  it('can be created from an existing iterable', () => {
    const iterableSeed = [
      ['foo', { qoo: 1 }],
      ['bar', { qar: 2 }],
      ['box', 'boop']
    ]
    weakRefMap = new WeakRefMap(iterableSeed)
    regularMap = new Map(iterableSeed)
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap))
  })

  it('can set a value', () => {
    weakRefMap.set('baz', { qux: 3 })
    regularMap.set('baz', { qux: 3 })
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap))
  })

  it('can set an existing key', () => {
    weakRefMap.set('bar', 'bark')
    regularMap.set('bar', 'bark')
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap))
  })

  it('can set an existing non-object value', () => {
    weakRefMap.set('bar', 'bonk')
    regularMap.set('bar', 'bonk')
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap))
  })

  if('can set a value to undefined', () => {
    weakRefMap.set('beep', undefined)
    regularMap.set('beep', undefined)
    assert(weakRefMap.has('beep'))
    assert(weakRefMap.has('beep') === regularMap.has('beep'))
    let weakRefDeleteReturn = weakRefMap.delete('beep')
    let regularDeleteReturn = regularMap.delete('beep')
    assert(weakRefDeleteReturn)
    assert(weakRefDeleteReturn === regularDeleteReturn)
    weakRefDeleteReturn = weakRefMap.delete('beep')
    regularDeleteReturn = regularMap.delete('beep')
    assert(weakRefDeleteReturn === false)
    assert(weakRefDeleteReturn === regularDeleteReturn)
  });

  it('can have a value gotten', () => {
    const weakRefResult = weakRefMap.get('foo')
    const regularResult = regularMap.get('foo')
    assert(JSON.stringify(weakRefResult) === '{"qoo":1}')
    assert(JSON.stringify(weakRefResult) === JSON.stringify(regularResult))
  })

  it('can fails to get a nonexistent value', () => {
    const weakRefResult = weakRefMap.get('food')
    const regularResult = regularMap.get('food')
    assert(typeof weakRefResult === 'undefined')
    assert(JSON.stringify(weakRefResult) === JSON.stringify(regularResult))
  })

  it('can check if it has a value', () => {
    assert(weakRefMap.has('foo') === true)
    assert(weakRefMap.has('foo') === regularMap.has('foo'))
  })

  it('can check if it does not have a value', () => {
    assert(weakRefMap.has('food') === false)
    assert(weakRefMap.has('food') === regularMap.has('food'))
  })

  it('can delete a value', () => {
    weakRefMap.delete('foo')
    regularMap.delete('foo')
    assert(normalizeMap(weakRefMap) === '[["bar","bonk"],["box","boop"],["baz",{"qux":3}]]')
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap))
  })

  it('can clear all values', () => {
    weakRefMap.clear()
    regularMap.clear()
    assert(normalizeMap(weakRefMap) === '[]')
    assert(normalizeMap(weakRefMap) === normalizeMap(regularMap))
  })

  it('can set a value to a WeakRef', () => {
    const dummyWeakRef = new WeakRef({})
    weakRefMap.set('weakRef', dummyWeakRef)
    regularMap.set('weakRef', dummyWeakRef)
    const weakRefResult = weakRefMap.get('weakRef');
    const regularResult = regularMap.get('weakRef');
    assert(weakRefResult instanceof WeakRef)
    assert(weakRefResult === regularResult)
  });

  it('can be iterated over', () => {
    const seedData = [
      ['foo', { qoo: 1 }],
      ['bar', { qar: 2 }],
      ['boop', 'beep'],
      ['oops', undefined]
    ]
    let weakRefResult = ''
    let regularResult = ''
    weakRefMap = new WeakRefMap(seedData)
    regularMap = new Map(seedData)
    for (const [key, value] of weakRefMap) {
      weakRefResult += JSON.stringify([key, value])
    }
    for (const [key, value] of regularMap) {
      regularResult += JSON.stringify([key, value])
    }
    assert(weakRefResult === '["foo",{"qoo":1}]["bar",{"qar":2}]["boop","beep"]["oops",null]')
    assert(weakRefResult === regularResult)
  })

  it('can use forEach', () => {
    let weakRefResult = ''
    let regularResult = ''
    weakRefMap.forEach((value, key) => {
      weakRefResult += JSON.stringify([key, value])
    })
    regularMap.forEach((value, key) => {
      regularResult += JSON.stringify([key, value])
    })
    assert(weakRefResult === '["foo",{"qoo":1}]["bar",{"qar":2}]["boop","beep"]["oops",null]')
    assert(weakRefResult === regularResult)
  })

  it('can iterate over entries', () => {
    let weakRefResult = ''
    let regularResult = ''
    for (const [key, value] of weakRefMap.entries()) {
      weakRefResult += JSON.stringify([key, value])
    }
    for (const [key, value] of regularMap) {
      regularResult += JSON.stringify([key, value])
    }
    assert(weakRefResult === '["foo",{"qoo":1}]["bar",{"qar":2}]["boop","beep"]["oops",null]')
    assert(weakRefResult === regularResult)
  })

  it('can iterate over keys', () => {
    let weakRefResult = ''
    let regularResult = ''
    for (const key of weakRefMap.keys()) {
      weakRefResult += JSON.stringify(key)
    }
    for (const key of regularMap.keys()) {
      regularResult += JSON.stringify(key)
    }
    assert(weakRefResult === '"foo""bar""boop""oops"')
    assert(weakRefResult === regularResult)
  })

  it('can iterate over values', () => {
    let weakRefResult = ''
    let regularResult = ''
    for (const value of weakRefMap.values()) {
      weakRefResult += JSON.stringify(value)
    }
    for (const value of regularMap.values()) {
      regularResult += JSON.stringify(value)
    }
    assert(weakRefResult === '{"qoo":1}{"qar":2}"beep"undefined')
    assert(weakRefResult === regularResult)
  })

})

describe('WeakRefSet', () => {
  let weakRefSet, regularSet
  const normalizeSet = (a) => JSON.stringify(Array.from(a))

  it('can be created', () => {
    weakRefSet = new WeakRefSet()
    regularSet = new Set()
    assert(normalizeSet(weakRefSet) === normalizeSet(regularSet))
  })

  it('can be created with iterable', () => {
    const seedData = [{ foo: 1 }, { bar: 2 }, { baz: 3 }]
    weakRefSet = new WeakRefSet(seedData)
    regularSet = new Set(seedData)
    assert(normalizeSet(weakRefSet) === normalizeSet(regularSet))
  })

  it('can have a value added', () => {
    weakRefSet.add({ qaz: 4 })
    regularSet.add({ qaz: 4 })
    assert(normalizeSet(weakRefSet) === '[{"foo":1},{"bar":2},{"baz":3},{"qaz":4}]')
    assert(normalizeSet(weakRefSet) === normalizeSet(regularSet))
  })

  const newElement = { qux: 5 }
  it('can have a value added only once', () => {
    weakRefSet.add(newElement)
    weakRefSet.add(newElement)
    regularSet.add(newElement)
    regularSet.add(newElement)
    assert(normalizeSet(weakRefSet) === '[{"foo":1},{"bar":2},{"baz":3},{"qaz":4},{"qux":5}]')
    assert(normalizeSet(weakRefSet) === normalizeSet(regularSet))
  })

  it('can check if it has element', () => {
    assert(weakRefSet.has(newElement) === true)
  })

  it('can check if it does not have element', () => {
    assert(weakRefSet.has({}) === false)
  })

  it('can delete an element', () => {
    let weakDidDelete = weakRefSet.delete(newElement)
    let regularDidDelete = regularSet.delete(newElement)
    assert(normalizeSet(weakRefSet) === '[{"foo":1},{"bar":2},{"baz":3},{"qaz":4}]')
    assert(normalizeSet(weakRefSet) === normalizeSet(regularSet))
    assert(weakDidDelete === true)
    weakDidDelete = weakRefSet.delete(newElement)
    regularDidDelete = regularSet.delete(newElement)
    assert(weakDidDelete === false)
    assert(weakDidDelete === regularDidDelete)
  })

  it('can clear itself', () => {
    weakRefSet.clear()
    regularSet.clear()
    assert(normalizeSet(weakRefSet) === '[]')
    assert(normalizeSet(weakRefSet) === normalizeSet(regularSet))
  })

  it('can forEach', () => {
    const seedData = [{ foo: 1 }, { bar: 2 }, { baz: 3 }]
    weakRefSet = new WeakRefSet(seedData)
    regularSet = new Set(seedData)
    let weakRefResult = ''
    let regularResult = ''
    weakRefSet.forEach((value, key, set) => {
      weakRefResult += (JSON.stringify(value) + JSON.stringify(key))
      assert(set === weakRefSet)
    })
    regularSet.forEach((value, key, set) => {
      regularResult += (JSON.stringify(value) + JSON.stringify(key))
      assert(set === regularSet)
    })
    assert(weakRefResult === '{"foo":1}{"foo":1}{"bar":2}{"bar":2}{"baz":3}{"baz":3}')
    assert(weakRefResult === regularResult)
  })

  it('can iterate normally', () => {
    let weakRefResult = ''
    let regularResult = ''
    for (const value of weakRefSet) {
      weakRefResult += JSON.stringify(value)
    }
    for (const value of regularSet) {
      regularResult += JSON.stringify(value)
    }
    assert(weakRefResult === '{"foo":1}{"bar":2}{"baz":3}')
    assert(weakRefResult === regularResult)
  })

  it('can iterate over entries', () => {
    let weakRefResult = ''
    let regularResult = ''
    for (const value of weakRefSet.entries()) {
      weakRefResult += JSON.stringify(value)
    }
    for (const value of regularSet.entries()) {
      regularResult += JSON.stringify(value)
    }
    assert(weakRefResult === '[{"foo":1},{"foo":1}][{"bar":2},{"bar":2}][{"baz":3},{"baz":3}]')
    assert(weakRefResult === regularResult)
  })

  it('can iterate over keys', () => {
    let weakRefResult = ''
    let regularResult = ''
    for (const value of weakRefSet.keys()) {
      weakRefResult += JSON.stringify(value)
    }
    for (const value of regularSet.keys()) {
      regularResult += JSON.stringify(value)
    }
    assert(weakRefResult === '{"foo":1}{"bar":2}{"baz":3}')
    assert(weakRefResult === regularResult)
  })

  it('can iterate over values', () => {
    let weakRefResult = ''
    let regularResult = ''
    for (const value of weakRefSet.values()) {
      weakRefResult += JSON.stringify(value)
    }
    for (const value of regularSet.values()) {
      regularResult += JSON.stringify(value)
    }
    assert(weakRefResult === '{"foo":1}{"bar":2}{"baz":3}')
    assert(weakRefResult === regularResult)
  })
})
