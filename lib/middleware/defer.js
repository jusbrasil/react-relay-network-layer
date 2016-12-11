'use strict';

exports.__esModule = true;
exports.default = deferMiddleware;
function deferMiddleware() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var middleware = function middleware(next) {
    return function (req) {
      return next(req);
    };
  };

  middleware.supports = ['defer'];

  return middleware;
}
module.exports = exports['default'];