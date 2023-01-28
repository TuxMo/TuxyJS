import path from 'path';
import {fileURLToPath} from 'url';
import App from '../lib/App';

describe('App', () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  let app = null;

  beforeEach(async () => {
    app = new App(path.join(__dirname, 'fixtures/app'));
    await app.ready;
  });

  describe('#loadFiles', () => {
    beforeEach(async () => {
      await app.loadFiles();
    });

    it('loads all files with correct path names', () => {
      expect(Object.keys(app.__loadedFiles).sort()).toEqual([
        'AController.controller.js',
        'AController.routes.js',
        'ControllerWithoutCustomRoutes.controller.js',
        'nested/Nested.controller.js',
        'nested/Nested.routes.js'
      ]);
    });

    it('loads all controllers with fully qualified type name estimates', () => {
      expect(Object.keys(app.__controllers)).toEqual(['AController', 'ControllerWithoutCustomRoutes', 'nested.Nested']);
    });

    it('does not load controllers without default exports', () => {
      expect(Object.keys(app.__loadedFiles).sort()).not.toContain([
        'Empty.controller.js',
        'nested/Empty.controller.js',
      ]);
    });

    it('loads all custom routers with fully qualified type name estimates', () => {
      expect(Object.keys(app.__customRouters)).toEqual(['AController', 'nested.Nested']);
    });

    it('does not load custom routers without default exports', () => {
      expect(Object.keys(app.__loadedFiles).sort()).not.toContain([
        'Empty.routes.js',
        'nested/Empty.routes.js',
      ]);
    });
  });

  describe('#isLoaded', () => {
    beforeEach(async () => {
      await app.loadFiles();
    });

    it('is true when the specified file has been loaded by the app', () => {
      expect(app.isLoaded('AController.controller.js')).toBeTruthy();
      expect(app.isLoaded('nested/Nested.controller.js')).toBeTruthy();
    });

    it('is false when the app has not loaded the specified file', () => {
      expect(app.isLoaded('NonExistentFile')).toBeFalsy();
    });
  });

  describe('#configureRoutes', () => {
    it('configures standard resource routes, and custom routes for all controllers', () => {
      expect(app.raw).toHaveExactRoutes({
        '/acontroller/': [
          {method: 'DELETE', path: '/:id'},
          {method: 'GET', path: '/:aParameter'},
          {method: 'DELETE', path: '/:anotherParameter'},
        ],
        '/controllerwithoutcustomroutes/': [
          {method: 'GET', path: '/'},
        ],
        '/nested/nested/': [
          {method: 'GET', path: '/:id'},
          {method: 'POST', path: '/:aParameter'},
          {method: 'PUT', path: '/:anotherParameter'},
        ],
      });
    });
  });
});
