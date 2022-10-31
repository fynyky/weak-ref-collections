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

  // Use this to keep track of weakref wrappers
  // Do it like this instead of checking instanceof to handle the edge case
  // of deliberately setting a weakref as a value
  #weakRefs = new WeakSet()

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
    const oldValue = super.get(key)
    if (this.#weakRefs.has(oldValue)) {
      this.#registry.unregister(oldValue)
      this.#weakRefs.delete(oldValue)
    }
    // If its an object wrap it in a weakref
    if (typeof value === 'object' && value !== null) {
      const ref = new WeakRef(value)
      this.#registry.register(value, key, ref)
      this.#weakRefs.add(ref)
      return super.set(key, ref)
    }
    // If its not an object just set it directly 
    else {
      return super.set(key, value)
    }
  }

  get (key) {
    let value = super.get(key);
    // If its a weakRef then unwrap it first
    // No need to check for GCd stuff because its meant to be undefined anyway
    if (this.#weakRefs.has(value)) value = super.get(key)?.deref()
    return value
  }

  has (key) {
    let value = super.get(key);
    // If its a weakRef then unwrap it first
    if (this.#weakRefs.has(value)) {
      value = super.get(key)?.deref()
      // If its been GC'd then return false
      if (typeof value === 'undefined') return false
      return true
    }
    // If it's a normal object use the super
    // Do this to account for the edge case of setting a key with value undefined
    return super.has(key)
  }

  delete (key) {
    const value = super.get(key)
    // If there is a ref then unregister first to avoid
    // finalization deleting any new values later
    if (this.#weakRefs.has(value)) {
      this.#registry.unregister(value)
      this.#weakRefs.delete(value)
      super.delete(key)
      // Only return a successful delete if ref was still live
      if (typeof value.deref() === 'undefined') return false
      else return true
    } 
    // Getting here means it is a valid primitive
    // return the super.delete call to account for 
    // edge case of valid undefined value
    else {
      return super.delete(key)
    }
  }

  clear () {
    this.#registry = new FinalizationRegistry(key => {
      super.delete(key)
    })
    this.#weakRefs = new WeakSet()
    return super.clear()
  }

  forEach (callback, context) {
    for (const [key, value] of this) { callback.call(context, value, key, this) }
  }

  // Default iterator
  // Iterates but only yields live references
  * [Symbol.iterator] () {
    for (let [key, value] of super[Symbol.iterator]()) {
      if (this.#weakRefs.has(value)) {
        value = value.deref()
        if (typeof value !== 'undefined') yield [key, value]
      } else {
        yield [key, value]
      }
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
  // No need to remove from membership because it would already be gone from there
  // By the time we hit finalization
  #registry = new FinalizationRegistry(ref => {
    super.delete(ref)
  })

  // When generating with an iterable, use the modified add
  // so that we generate weakrefs
  constructor (iterable) {
    super()
    if (iterable) for (const value of iterable) {
      this.add(value)
    }
  }

  // When add wrap the target in a weakref instead
  add (value) {
    // If it is already contained then skip
    if (this.#membership.has(value)) return this
    // Otherwise mark the membership
    // mark for clean up
    // and store the reference
    if (typeof value === 'object' && value !== null) {
      const ref = new WeakRef(value)
      this.#membership.set(value, ref)
      this.#registry.register(value, ref, ref)
      return super.add(ref)
    }
    // For primitives then just process it normally
    else {
      return super.add(value)
    }
  }

  has (value) {
    // If its an object then check the refs
    if (typeof value === 'object' && value !== null) {
      const ref = this.#membership.get(value)
      if (typeof ref === 'undefined') return false
      if (typeof ref.deref() === 'undefined') return false
      return true
    }
    // If it's a primitive then do a normal has check
    else {
      return super.has(value)
    }

  }

  delete (value) {
    if (typeof value === 'object' && value !== null) {
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
    else {
      return super.delete(value)
    }
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
    for (let value of super[Symbol.iterator]()) {
      if (value instanceof WeakRef) {
        value = value.deref()
        if (typeof value !== 'undefined') yield value
      }
      else { yield value }
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
