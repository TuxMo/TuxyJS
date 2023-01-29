import FS from '../lib/FSUtils';
import {fileURLToPath} from 'url';
import path from 'path';
import fs from 'fs';

describe('FSUtils', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  describe('.exists', () => {
    it('is true when the specified path exists', () => {
      expect(FS.exists(path.join(__dirname, 'fixtures/fsutils'))).toBeTruthy();
      expect(FS.exists(path.join(__dirname, 'fixtures/fsutils/test-file'))).toBeTruthy();
    });

    it('is false when the specified path does not exist', () => {
      expect(FS.exists(path.join(__dirname, 'fixtures/nonexistent'))).toBeFalsy();
      expect(FS.exists(path.join(__dirname, 'fixtures/fsutils/nonexistent'))).toBeFalsy();
    });
  });

  describe('.isHidden', () => {
    it('is true for filenames starting with a dot', () => {
      expect(FS.isHidden(path.join(__dirname, 'fixtures/fsutils/.hidden-file'))).toBeTruthy();
    });

    it('is false for filenames not starting with a dot', () => {
      expect(FS.isHidden(path.join(__dirname, 'fixtures/fsutils/test-file'))).toBeFalsy();
      expect(FS.isHidden(path.join(__dirname, 'fixtures/fsutils/test.file'))).toBeFalsy();
    });
  });

  describe('.hasExtension', () => {
    it('is true for filenames ending with the specified extension name', () => {
      expect(FS.hasExtension('foo.bar.baz', 'baz')).toBeTruthy();
    });

    it('is true for filenames not ending with the specified extension name', () => {
      expect(FS.hasExtension('foo.bar.baz', 'bar')).toBeFalsy();
      expect(FS.hasExtension('foo.bar.baz', 'ba')).toBeFalsy();
    });
  });

  describe('.mkdirp', () => {
    it('does not affect existing directories', () => {
      expect(FS.exists(path.join(__dirname, 'fixtures/fsutils'))).toBeTruthy();
      FS.mkdirp(path.join(__dirname, 'fixtures/fsutils'))
      expect(FS.exists(path.join(__dirname, 'fixtures/fsutils'))).toBeTruthy();
    });

    it('creates the specified directory tree if it does not exist', () => {
      FS.mkdirp(path.join(__dirname, 'fixtures/fsutils/new/directory'));
      expect(FS.exists(path.join(__dirname, 'fixtures/fsutils/new/'))).toBeTruthy();
      expect(FS.exists(path.join(__dirname, 'fixtures/fsutils/new/directory'))).toBeTruthy();
      fs.rmdirSync((path.join(__dirname, 'fixtures/fsutils/new/directory/')));
      fs.rmdirSync((path.join(__dirname, 'fixtures/fsutils/new/')));
    });
  });

  describe('.dir', () => {
    it('is the list of all files matching the specified extension under the specified directory', () => {
      expect(FS.dir(path.join(__dirname, 'fixtures/fsutils'), '.file')).toEqual(['test.file']);
      expect(FS.dir(path.join(__dirname, 'fixtures/fsutils/a-directory'), '.fixture')).toEqual(['test.fixture']);
    });

    it('is an empty list when the specified directory does not have any files matching the specified extension', () => {
      expect(FS.dir(path.join(__dirname, 'fixtures/fsutils'), '.fixture')).toEqual([]);
      expect(FS.dir(path.join(__dirname, 'fixtures/fsutils/a-directory'), '.file')).toEqual([]);
    });
  });

  describe('.recurseDir', () => {
    it('is the list of all files matching the specified extension under the specified directory and subdirectories', () => {
      expect(FS.recurseDir(path.join(__dirname, 'fixtures/fsutils'), '.file')).toEqual(['test.file']);
      expect(FS.recurseDir(path.join(__dirname, 'fixtures/fsutils'), '.fixture')).toEqual(['a-directory/test.fixture']);
      expect(FS.recurseDir(path.join(__dirname, 'fixtures/fsutils'), '.nonexistent')).toEqual([]);
    });
  });
});
