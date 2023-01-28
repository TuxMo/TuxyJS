export default class Utils {
  static _commonMembers = Object.getOwnPropertyNames(Object.getPrototypeOf({}));

  static getAllMembers(ofObject) {
    if (!ofObject) {
      return [];
    }

    const members = [...Object.getOwnPropertyNames(ofObject), ...this.getAllMembers(Object.getPrototypeOf(ofObject))];
    return members.filter(member => !this._commonMembers.includes(member)).sort();
  }

  static getAllProperties(ofObject) {
    return this.getAllMembers(ofObject).filter(memberName => typeof ofObject[memberName] != 'function');
  }

  static getAllFunctions(ofObject) {
    return this.getAllMembers(ofObject).filter(memberName => typeof ofObject[memberName] == 'function');
  }
}
