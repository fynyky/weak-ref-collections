// In Node.js this is packaged into a module
// In the browser exports are bound directly to the window namespace
const global =
  typeof exports !== 'undefined' && exports !== null ? exports : this

class WeakRefMap extends Map {
  // Delete the corresponding key when object is collected
  // Need to manually deregister if deleting or setting new value
  // to avoid "finalizing" the new value
  #registry = new FinalizationRegistry(key => {
    super.delete(key)
  })

  // When generating with new iterable, use the modified set
  // so that we generate weakrefs
  // TODO: Allow non object values? Just act as a normal map?
  constructor (iterable) {
    super()
    if (iterable) {
      for (const [key, value] of iterable) {
        this.set(key, value)
      }
    }
  }

  // When setting wrap in a weakref instead
  // Remember to first degister the old ref and
  // register the new one for finalization
  set (key, value) {
    const oldRef = super.get(key)
    if (typeof oldRef !== 'undefined') {
      this.#registry.unregister(oldRef)
    }
    const ref = new WeakRef(value)
    this.#registry.register(value, key, ref)
    return super.set(key, ref)
  }

  get (key) {
    const value = super.get(key)?.deref()
    if (typeof value === 'undefined') {
      return
    }
    return value
  }

  has (key) {
    const value = super.get(key)?.deref()
    if (typeof value === 'undefined') {
      return false
    }
    return true
  }

  delete (key) {
    const ref = super.get(key)
    // Early return if nothing defined
    if (typeof ref === 'undefined') return false
    // If there is a ref then unregister first to avoid
    // finalization deleting any new values later
    this.#registry.unregister(ref)
    super.delete(key)
    // Only return a successful delete if ref was still live
    if (typeof ref.deref() === 'undefined') return false
    return true
  }

  clear () {
    this.#registry = new FinalizationRegistry(key => {
      super.delete(key)
    })
    return super.clear()
  }

  forEach (callback, context) {
    for (const [key, value] of this) { callback.call(context, value, key, this) }
  }

  // Default iterator
  // Iterates but only yields live references
  * [Symbol.iterator] () {
    for (const [key, ref] of super[Symbol.iterator]()) {
      const value = ref.deref()
      if (typeof value !== 'undefined') yield [key, value]
    }
  }

  // Pass through to the default iterator
  * entries () {
    yield * this
  }

  // Use default iterator but only return the value
  * values () {
    for (const keyValuePair of this) {
      yield keyValuePair[1]
    }
  }
}

// Custom Set with weakly held values (WeakSet does something else)
class WeakRefSet extends Set {
  // Used to check existing membership of the underlying target
  // Maps the target to its ref
  #membership = new WeakMap()

  // Delete the corresponding ref when object is collected
  #registry = new FinalizationRegistry(ref => {
    super.delete(ref)
  })

  // When generating with an iterable, use the modified add
  // so that we generate weakrefs
  constructor (iterable) {
    super()
    if (iterable) {
      for (const value of iterable) {
        this.add(value)
      }
    }
  }

  // When add wrap the target in a weakref instead
  add (value) {
    // If it is already contained then skip
    if (this.#membership.has(value)) return this
    // Otherwise mark the membership
    // mark for clean up
    // and store the reference
    const ref = new WeakRef(value)
    this.#membership.set(value, ref)
    this.#registry.register(value, ref, ref)
    return super.add(ref)
  }

  has (value) {
    const ref = this.#membership.get(value)
    if (typeof ref === 'undefined') return false
    if (typeof ref.deref() === 'undefined') return false
    return true
  }

  delete (value) {
    const ref = this.#membership.get(value)
    // Early return if nothing defined
    if (typeof ref === 'undefined') return false
    // Otherwise an entry was found
    this.#membership.delete(value)
    this.#registry.unregister(ref)
    super.delete(ref)
    // Only return a successful delete if ref was still live
    if (typeof ref.deref() === 'undefined') return false
    return true
  }

  clear () {
    this.#membership = new WeakMap()
    this.#registry = new FinalizationRegistry(ref => {
      super.delete(ref)
    })
    return super.clear()
  }

  // Follows the map API convention but passes value twice instead of
  // value and key
  forEach (callback, context) {
    for (const value of this) {
      callback.call(context, value, value, this)
    }
  }

  // Default iterator
  // Iterates but only yields live references
  * [Symbol.iterator] () {
    for (const ref of super[Symbol.iterator]()) {
      const value = ref.deref()
      if (typeof value !== 'undefined') yield value
    }
  }

  // The Set API follows a similar structure to Map despite lack of keys
  // Returns an array of [value, value] pairs
  * entries () {
    for (const value of this) {
      yield [value, value]
    }
  }

  * keys () { yield * this }
  * values () { yield * this }
}

global.WeakRefMap = WeakRefMap
global.WeakRefSet = WeakRefSet
