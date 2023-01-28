export default class ExpressUtils {
  static routes(expressApp) {
    if (!expressApp._router) {
      return {};
    }
    let results = {};
    const routerLayers = expressApp._router.stack.filter(middleware => middleware.name === 'router');
    for (let i = 0; i < routerLayers.length; i++) {
      const path = this.pathFromRegexp(routerLayers[i].regexp.toString());
      results[path] = this.routerPaths(routerLayers[i].handle.stack);
    }
    return results;
  }

  static routerPaths(routerStack) {
    return routerStack.map(layer => {
      return {
        method: layer.route.stack[0].method.toUpperCase(),
        path: layer.route.path,
      };
    }).sort();
  }

  static pathFromRegexp(regexpPath) {
    return regexpPath.replaceAll('?(?=\\/|$)/i', '')
      .replaceAll('\\', '')
      .replaceAll('^', '')
      .replace('/', '');
  }
}
