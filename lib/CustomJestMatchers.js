import {diff} from 'jest-diff';
import E from './ExpressUtils.js';

expect.extend({
  toHaveExactRoutes(expressApp, expectedRoutes) {
    const actualRoutes = E.routes(expressApp);
    if (JSON.stringify(expectedRoutes) !== JSON.stringify(actualRoutes)) {
      return fail("Actual and expected routes do not match: " + diff(expectedRoutes, actualRoutes));
    }
    return pass();
  }
});

function pass() {
  return {pass: true, message: () => 'Expected and actual routes match'};
}

function fail(failureMessage) {
  return {pass: false, message: () => failureMessage};
}
