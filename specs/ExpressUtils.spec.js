import express from 'express';
import E from '../lib/ExpressUtils';

describe('ExpressUtils', () => {
  describe('.routes', () => {
    it('is an empty object when the app has no routers attached', () => {
      const app = express();
      expect(E.routes(app)).toEqual({});
    });

    it('is the list of paths with routers attached', () => {
      const app = express();
      app.use('/acontroller', express.Router());
      app.use('/acontroller/nestedcontroller', express.Router());
      expect(E.routes(app)).toEqual({'/acontroller/': [], '/acontroller/nestedcontroller/': []});
    });

    it('includes routes of the sub-routers', () => {
      const app = express();
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
});
