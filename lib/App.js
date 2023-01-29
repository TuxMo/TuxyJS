import * as dotenv from 'dotenv';
import * as Sentry from "@sentry/node";

import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import pino from 'pino-http';

import ResourceRouter from './ResourceRouter.js';
import FSUtils from './FSUtils';

export default class App {
  static DEFAULT_APP_PORT = 6000;

  constructor(rootDir) {
    dotenv.config();
    Sentry.init({dsn: process.env.SENTRY_DSN || ''});
    this.__httpServer = null;
    this.__expressApp = express();
    this.__expressApp.use(Sentry.Handlers.requestHandler());

    this.__rootDir = rootDir;
    this.__loadedFiles = {};
    this.__controllers = {};
    this.__customRouters = {};
    this.__expressRouterForController = {};
    this.__ready = this.loadFiles()
      .then(_ => this.configureRoutes())
      .then(() => this.configureMiddlewares())
      .then(() => this._configureSentryErrorHandler());
  }

  get raw() {
    return this.__expressApp;
  }

  get ready() {
    return this.__ready;
  }

  async loadFiles() {
    const allFiles = FSUtils.recurseDir(this.__rootDir, 'js');
    const controllers = allFiles.filter(fileName => fileName.endsWith('.controller.js'));
    await Promise.all(controllers.map(this._loadController.bind(this)));

    const routes = allFiles.filter(fileName => fileName.endsWith('.routes.js'));
    await Promise.all(routes.map(this._loadRoutes.bind(this)));
  }

  isLoaded(relativePath) {
    return this.__loadedFiles[relativePath] != null;
  }

  async configureRoutes() {
    await this._configureResourceRoutes();
    await this._configureCustomRoutes();
  }

  configureMiddlewares() {
    this.__expressApp.use(pino);
    this.__expressApp.use(cookieParser(process.env.COOKIE_SECRET));
    this.__expressApp.use(bodyParser.urlencoded({extended: false}));
    this.__expressApp.use(bodyParser.json());
  }

  start() {
    this.__httpServer = this.__expressApp.listen(process.env.APP_PORT || App.DEFAULT_APP_PORT);
    return this.__httpServer;
  }

  stop() {
    if (!this.__httpServer) {
      return;
    }
    this.__httpServer.close(() => {
      this.__httpServer = null;
    });
  }

  async _loadController(controllerFile) {
    await this._loadFile(controllerFile, this.__controllers, '.controller.js');
  }

  async _loadRoutes(routesFile) {
    await this._loadFile(routesFile, this.__customRouters, '.routes.js');
  }

  async _loadFile(fileName, typeCollection, fileExtension) {
    const loadedType = await import(this.__rootDir + '/' + fileName);
    if (!loadedType.default) {
      return;
    }
    this.__loadedFiles[fileName] = loadedType.default;
    const maybeQualifiedTypeName = fileName.replace(fileExtension, '').replaceAll('/', '.');
    typeCollection[maybeQualifiedTypeName] = new (loadedType.default)();
  }


  async _configureResourceRoutes() {
    for (const [qualifiedControllerName, controller] of Object.entries(this.__controllers)) {
      const resourceRouter = new ResourceRouter(this.__expressApp, this._routePathFor(qualifiedControllerName), controller);
      this.__expressRouterForController[qualifiedControllerName] = resourceRouter.route();
    }
    return Promise.resolve(true);
  }

  async _configureCustomRoutes() {
    const controllersWithCustomRouter = Object.keys(this.__controllers).filter(qualifiedControllerName => this.__customRouters[qualifiedControllerName]);
    for (const qualifiedControllerName of controllersWithCustomRouter) {
      const controller = this.__controllers[qualifiedControllerName];
      const router = this.__customRouters[qualifiedControllerName];
      if (router.route) {
        router.route(this.__expressApp, this.__expressRouterForController[qualifiedControllerName], controller);
      }
    }
    return Promise.resolve(true);
  }

  _routePathFor(qualifiedTypeName) {
    return qualifiedTypeName.replaceAll('.', '/').toLowerCase();
  }

  _configureSentryErrorHandler() {
    this.__expressApp.use(Sentry.Handlers.errorHandler());
  }
}
