/**
 * @author Zes Minkey Young
 * This file is an alternative for those users whose browsers don't support ESnext.Collection
 */


Set.prototype.union = Set.prototype.union ?? function(other) {
    const it = other.keys()
  return new Set([...this, ...{[Symbol.iterator]() {return it}}]);
}

Set.prototype.intersection = Set.prototype.intersection ?? function(other) {
  return new Set([...this].filter(x => other.has(x)));
}

Set.prototype.difference = Set.prototype.difference ?? function(other) {
  return new Set([...this].filter(x => !other.has(x)));
}





