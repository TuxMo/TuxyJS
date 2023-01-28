export default class AControllerRoutes {
  route(expressApp, expressRouter, controller) {
    expressRouter.get('/:aParameter', controller.customAction);
    expressRouter.delete('/:anotherParameter', controller.customAction);
  }
}
