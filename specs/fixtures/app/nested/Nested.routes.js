export default class NestedControllerRoutes {
  route(expressApp, expressRouter, controller) {
    expressRouter.post('/:aParameter', controller.nestedCustomAction);
    expressRouter.put('/:anotherParameter', controller.nestedCustomAction);
  }
}
