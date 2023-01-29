import ResourceRouter from '../lib/ResourceRouter';
import express from 'express';

describe('ResourceRouter', () => {
  const noOp = () => {
  };
  const testApp = express();

  describe('#route', () => {
    it('creates and returns a new express router', () => {
      const router = new ResourceRouter(testApp, 'AController', {});
      const routes = router.route();
      expect(routes).not.toBeNull();
      expect(routes.stack).toBeDefined();
    });

    it('attaches router as a middleware to the controller path', () => {
      new ResourceRouter(testApp, 'AController', {}).route();
      expect(testApp._router.stack[2].regexp.toString()).toContain('/acontroller');
    });

    it('configures standard routes for handlers that are present', () => {
      const testController = {
        index: noOp, count: noOp, show: noOp, create: noOp, update: noOp, destroy: noOp
      };
      new ResourceRouter(testApp, 'AController', testController).route();
      let expectedRoutes = {
        '/acontroller/': [
          {method: 'GET', path: '/count'},
          {method: 'POST', path: '/'},
          {method: 'DELETE', path: '/:id'},
          {method: 'GET', path: '/'},
          {method: 'GET', path: '/:id'},
          {method: 'PUT', path: '/:id'},
          {method: 'PATCH', path: '/:id'},
        ]
      };
      expect(testApp).toHaveExactRoutes(expectedRoutes);
    });

    it('does not configure routes for non-standard handlers', () => {
      const testController = {update: noOp, aHandler: noOp, anotherHandler: noOp};
      new ResourceRouter(testApp, 'AController', testController).route();
      let expectedRoutes = {
        '/acontroller/': [
          {method: 'PUT', path: '/:id'},
          {method: 'PATCH', path: '/:id'}
        ]
      };
      expect(testApp).toHaveExactRoutes(expectedRoutes);
    });
  })
});
