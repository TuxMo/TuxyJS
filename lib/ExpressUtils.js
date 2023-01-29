export default class ExpressUtils {
  static routes(expressApp) {
    if (!expressApp._router) {
      return {};
    }
    let results = {};
    const routerLayers = expressApp._router.stack.filter(middleware => middleware.name === 'router');
    for (let i = 0; i < routerLayers.length; i++) {
      const path = this._pathFromRegexp(routerLayers[i].regexp.toString());
      results[path] = this._routerPaths(routerLayers[i].handle.stack);
    }
    return results;
  }

  static middlewareNames(expressApp) {
    if (!expressApp._router || !expressApp._router.stack) {
      return [];
    }
    return expressApp._router.stack.map(layer => layer.name);
  }

  static hasMiddleware(expressApp, middlewareName) {
    return ExpressUtils.middlewareNames(expressApp).includes(middlewareName);
  }

  static _routerPaths(routerStack) {
    return routerStack.map(layer => {
      return {
        method: layer.route.stack[0].method.toUpperCase(),
        path: layer.route.path,
      };
    }).sort();
  }

  static _pathFromRegexp(regexpPath) {
    return regexpPath.replaceAll('?(?=\\/|$)/i', '')
      .replaceAll('\\', '')
      .replaceAll('^', '')
      .replace('/', '');
  }
}
