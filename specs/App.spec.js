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

  describe('construction', () => {
    it('is not allowed if a root directory is not supplied', () => {
      const expectedErrorMessage = 'A root directory containing source files is required';
      expect(() => new App()).toThrow(expectedErrorMessage);
      expect(() => new App(null)).toThrow(expectedErrorMessage);
      expect(() => new App(undefined)).toThrow(expectedErrorMessage);
    });

    it('is not allowed if the supplied root directory does not exist', () => {
      expect(() => new App('invalid-directory')).toThrow('The specified directory - invalid-directory - does not exist or is not accessible')
    });

    it('succeeds when a valid root directory is supplied', () => {
      expect(() => new App(path.join(__dirname))).not.toThrowError();
    });
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

  describe('#configureMiddleware', () => {
    it('adds Sentry handlers to capture errors', () => {
      expect(app.raw).toHaveMiddleware('sentryRequestMiddleware');
      expect(app.raw).toHaveMiddleware('sentryErrorMiddleware');
    });

    it('adds Pino for logging', () => {
      expect(app.raw).toHaveMiddleware('pinoLogger');
    });

    it('adds cookie-parser for parsing cookies', () => {
      expect(app.raw).toHaveMiddleware('cookieParser');
    });

    it('adds body-parser for parsing url-encoded forms and JSON bodies', () => {
      expect(app.raw).toHaveMiddleware('urlencodedParser');
      expect(app.raw).toHaveMiddleware('jsonParser');
    });
  });

  describe('#start', () => {
    let httpServer = null;

    afterEach((done) => {
      if (httpServer && httpServer.close) {
        httpServer.close();
        httpServer = null;
        done();
      }
    });

    it('starts express server at the specified PORT number', () => {
      process.env.APP_PORT = 54321;
      httpServer = app.start();
      expect(httpServer).not.toBeNull();
      expect(httpServer.listening).toBeTruthy();
      expect(httpServer.address().port).toEqual(54321);
    });

    it('starts express server at the default app port when an explicit port is not specified', () => {
      delete process.env.APP_PORT;
      httpServer = app.start();
      expect(httpServer.address().port).toEqual(App.DEFAULT_APP_PORT);
    });
  });

  describe('#stop', () => {
    let httpServer = null;

    afterEach(() => {
      if (httpServer && httpServer.close) {
        httpServer.close();
        httpServer = null;
      }
    });

    it('does nothing when there is no server to stop', () => {
      expect(app.__httpServer).toBeNull();
      app.stop();
      expect(app.__httpServer).toBeNull();
    });

    it('stops the currently running server', () => {
      httpServer = app.start();
      expect(httpServer).not.toBeNull();
      expect(httpServer.listening).toBeTruthy();

      app.stop();
      expect(httpServer.listening).toBeFalsy();
    });
  });
});
