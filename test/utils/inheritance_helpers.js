var MutableObject = require("../../lib/_base/utils/Utils.js").MutableObject;

export class A {
  constructor() {
  }
  test() {
    return "A";
  }
}

export class B extends A {
  constructor() {
    super();
  }
  test() {
    return "B";
  }
  copy() {
    return MutableObject.mutableCopy(this);
  }
}
