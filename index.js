class WeakRefMap extends Map {

  // Delete the corresponding key when object is collected
  // Need to manually deregister if deleting or setting new value
  // to avoid "finalizing" the new value
  #registry = new FinalizationRegistry(key => {
    super.delete(key);
  });

  // When generating with new iterable, use the modified set
  // so that we generate weakrefs
  // TODO: Allow non object values? Just act as a normal map?
  constructor(iterable) {
    super();
    if (iterable) {
      for (const [key, value] of iterable) {
        this.set(key, value);
      }
    }
  }

  // When setting wrap in a weakref instead
  // Remember to first degister the old ref and
  // register the new one for finalization
  set(key, value) {
    const oldRef = super.get(key);
    if (typeof oldRef !== "undefined") {
      this.#registry.unregister(oldRef);
    }
    const ref = new WeakRef(value);
    this.#registry.register(value, key, ref);
    return super.set(key, ref);
  }

  get(key) {
    const value = super.get(key)?.deref();
    if (typeof value === "undefined") {
      return;
    }
    return value;
  }

  has(key) {
    const value = super.get(key)?.deref();
    if (typeof value === "undefined") {
      return false;
    }
    return true;
  }

  delete(key) {
    const ref = super.get(key);
    // Early return if nothing defined
    if (typeof ref === 'undefined') return false;
    // If there is a ref then unregister first to avoid
    // finalization deleting any new values later
    this.#registry.unregister(ref);
    super.delete(key);
    // Only return a successful delete if ref was still live
    if (typeof ref.deref() === "undefined") return false;
    return true;
  }

  clear() {
    for (const [key, ref] of super[Symbol.iterator]()) {
      this.#registry.unregister(ref);
    }
    return super.clear();
  }

  forEach(callback, context) {
    for (const [key, value] of this)
      callback.call(context, value, key, this);
  }

  // Default iterator
  // Iterates but only yields live references
  *[Symbol.iterator]() {
    for (const [key, ref] of super[Symbol.iterator]()) {
      const value = ref.deref();
      if (typeof value !== "undefined") yield [key, value];
    }
  }

  // Pass through to the default iterator
  *entries() {
    yield *this;
  }

  // Use default iterator but only return the value
  *values() {
    for (const [key, value] of this) {
      yield value;
    }
  }

}
module.exports = WeakRefMap;