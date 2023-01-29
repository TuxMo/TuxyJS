import {diff} from 'jest-diff';
import E from './ExpressUtils.js';

expect.extend({
  toHaveExactRoutes(expressApp, expectedRoutes) {
    const actualRoutes = E.routes(expressApp);
    if (JSON.stringify(expectedRoutes) !== JSON.stringify(actualRoutes)) {
      return fail('Actual and expected routes do not match: ' + diff(expectedRoutes, actualRoutes));
    }
    return pass('Expected and actual routes match');
  },

  toHaveMiddleware(expressApp, middlewareName) {
    if (!E.hasMiddleware(expressApp, middlewareName)) {
      return fail(`Did not find middleware ${middlewareName} in the list of configured middlewares: [${E.middlewareNames(expressApp).join(', ')}]`);
    }
    return pass(`The middleware ${middlewareName} is present on the express app`);
  }
});

function pass(successMessage) {
  return {pass: true, message: () => successMessage};
}

function fail(failureMessage) {
  return {pass: false, message: () => failureMessage};
}
