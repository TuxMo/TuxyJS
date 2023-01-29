import express from 'express';
import pino from 'pino-http';
import E from '../lib/ExpressUtils';

describe('ExpressUtils', () => {
  let app = null;

  beforeEach(() => {
    app = express();
  });

  describe('.routes', () => {
    it('is an empty object when the app has no routers attached', () => {
      expect(E.routes(app)).toEqual({});
    });

    it('is the list of paths with routers attached', () => {
      app.use('/acontroller', express.Router());
      app.use('/acontroller/nestedcontroller', express.Router());
      expect(E.routes(app)).toEqual({'/acontroller/': [], '/acontroller/nestedcontroller/': []});
    });

    it('includes routes of the sub-routers', () => {
      const aControllerRoutes = express.Router();
      const noOp = () => {
      };
      aControllerRoutes.get('/:id', noOp);
      aControllerRoutes.post('/', noOp);
      aControllerRoutes.put('/:id', noOp);
      aControllerRoutes.patch('/:id', noOp);
      aControllerRoutes.delete('/:id', noOp);
      app.use('/acontroller', aControllerRoutes);
      const nestedControllerRoutes = express.Router();
      nestedControllerRoutes.get('/:id', noOp);
      nestedControllerRoutes.post('/', noOp);
      nestedControllerRoutes.put('/:id', noOp);
      nestedControllerRoutes.patch('/:id', noOp);
      nestedControllerRoutes.delete('/:id', noOp);
      app.use('/acontroller/nestedcontroller', nestedControllerRoutes);
      expect(E.routes(app)).toEqual({
        '/acontroller/': [
          {method: 'GET', path: '/:id'},
          {method: 'POST', path: '/'},
          {method: 'PUT', path: '/:id'},
          {method: 'PATCH', path: '/:id'},
          {method: 'DELETE', path: '/:id'},
        ],
        '/acontroller/nestedcontroller/': [
          {method: 'GET', path: '/:id'},
          {method: 'POST', path: '/'},
          {method: 'PUT', path: '/:id'},
          {method: 'PATCH', path: '/:id'},
          {method: 'DELETE', path: '/:id'},
        ]
      });
    });
  });

  describe('.middlewareNames', () => {
    it('is empty when the app has no middlewares', () => {
      expect(E.middlewareNames(app)).toEqual([]);
    });

    it('is the list of all middlewares added to the app', () => {
      app.use(pino);
      app.use('/aroute', express.Router());
      expect(E.middlewareNames(app)).toEqual(['query', 'expressInit', 'pinoLogger', 'router']);
    });
  });

  describe('.hasMiddleware', () => {
    it('is false if no middleware by the specified name has been added', () => {
      expect(E.hasMiddleware(app, 'pinoLogger')).toBeFalsy();
    });

    it('is true if a middleware by the specified name has been added', () => {
      app.use(pino);
      expect(E.hasMiddleware(app, 'pinoLogger')).toBeTruthy();
    });
  });
});
