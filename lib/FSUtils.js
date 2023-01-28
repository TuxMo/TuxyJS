import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';

export default class FSUtils {
  static exists(pathName) {
    return fs.existsSync(pathName);
  }

  static isHidden(fileName) {
    return !!fileName && path.basename(fileName).indexOf('.') === 0;
  }

  static hasExtension(fileName, extension) {
    return !!fileName && !!extension && fileName.slice(-extension.length) === extension;
  }

  static mkdirp(pathName) {
    return mkdirp.sync(pathName);
  }

  static dir(directory, extension, excludeFileNames = []) {
    return fs.readdirSync(directory)
      .filter(fileName => !FSUtils.isHidden(fileName)
        && FSUtils.hasExtension(fileName, extension)
        && !excludeFileNames.includes(fileName));
  }

  static recurseDir(directory, extension, excludeFileNames = []) {
    let allEntries = this._recurseDir(directory, extension, excludeFileNames);
    return allEntries.map(entry => entry.replace(directory + '/', ''));
  }

  static _recurseDir(directory, extension, excludeFileNames = []) {
    let allEntries = [];
    const entries = fs.readdirSync(directory);
    entries.forEach((entry) => {
      const file = directory + "/" + entry;
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        allEntries = allEntries.concat(this._recurseDir(file, extension, excludeFileNames));
      } else {
        allEntries.push(file);
      }
    })

    return allEntries.filter(fileName => !FSUtils.isHidden(fileName)
      && FSUtils.hasExtension(fileName, extension)
      && !excludeFileNames.includes(fileName));
  }
}
