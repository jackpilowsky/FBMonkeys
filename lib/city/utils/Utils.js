import UUIDjs from 'uuid-js';

export class ImmutableObjectError extends Error {

}
export class MutableObject {
  static checkIsMutable(object) {
    if (!object.isMutable) {
      throw new ImmutableObjectError();
    }
  }
  static mutableCopy(obj) {
    if (!obj) {
      return obj;
    }
    let a = Object.create(Object.getPrototypeOf(obj))
    a = Object.assign(a, obj);
    a.isMutable = true;
    a.id = UUIDjs.create().toString();
    a.originalId = a.originalId || obj.id;
    return a;
  }
  static copy(obj) {
    if (!obj) {
      return obj;
    }
    let a = Object.create(Object.getPrototypeOf(obj))
    a = Object.assign(a, obj);
    return a;
  }
}