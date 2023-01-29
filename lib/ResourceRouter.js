import express from 'express';
import U from './Utils.js';

export default class ResourceRouter {
  static restfulActionMappings = {
    'index': [['get', '/']],
    'count': [['get', '/count']],
    'show': [['get', '/:id']],
    'create': [['post', '/']],
    'update': [['put', '/:id'], ['patch', '/:id']],
    'destroy': [['delete', '/:id']]
  }

  constructor(app, controllerPath, controller) {
    this._app = app;
    this._routeName = `/${controllerPath.toLowerCase()}`;
    this._controller = controller;
  }

  route() {
    const router = express.Router();
    const controllerActions = U.getAllFunctions(this._controller);
    const routableActions = controllerActions.filter(action => Object.keys(ResourceRouter.restfulActionMappings).includes(action));
    const routeMappings = routableActions.flatMap(action => ResourceRouter.restfulActionMappings[action].map(routeMap => [routeMap[0], routeMap[1], action]));
    routeMappings.forEach(routeMap => router[routeMap[0]].call(router, routeMap[1], this._controller[routeMap[2]]));

    this._app.use(this._routeName, router);
    return router;
  }
}
