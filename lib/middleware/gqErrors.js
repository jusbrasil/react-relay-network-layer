'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

exports.default = gqErrorsMiddleware;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console no-use-before-define */

function gqErrorsMiddleware() {
  var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var logger = opts.logger || console.error.bind(console);
  var prefix = opts.prefix || '[RELAY-NETWORK] GRAPHQL SERVER ERROR:\n\n';
  var disableServerMiddlewareTip = opts.disableServerMiddlewareTip || false;

  function displayErrors(errors, nlData) {
    return errors.forEach(function (error) {
      var message = error.message,
          stack = error.stack,
          rest = (0, _objectWithoutProperties3.default)(error, ['message', 'stack']);


      var msg = '' + prefix;
      var fmt = [];

      if (stack && Array.isArray(stack)) {
        msg = msg + '%c' + stack.shift() + '\n%c' + stack.join('\n');
        fmt.push('font-weight: bold;', 'font-weight: normal;');
      } else {
        msg = msg + '%c' + message + ' %c';
        fmt.push('font-weight: bold;', 'font-weight: normal;');
      }

      if (rest && (0, _keys2.default)(rest).length) {
        msg = msg + '\n  %O';
        fmt.push(rest);
      }

      msg = msg + '\n\n%cRequest Response data:\n  %c%O';
      fmt.push('font-weight: bold;', 'font-weight: normal;', nlData);

      if (!stack && !disableServerMiddlewareTip) {
        msg = msg + '\n\n%cNotice:%c' + noticeAbsentStack();
        fmt.push('font-weight: bold;', 'font-weight: normal;');
      }

      logger.apply(undefined, [msg + '\n\n'].concat(fmt));
    });
  }

  return function (next) {
    return function (req) {
      var query = req.relayReqType + ' ' + req.relayReqId;

      return next(req).then(function (res) {
        if (res.json) {
          if (Array.isArray(res.json)) {
            res.json.forEach(function (batchItem) {
              if (batchItem.payload.errors) {
                displayErrors(batchItem.payload.errors, { query: query, req: req, res: res });
              }
            });
          } else {
            if (res.json.errors) {
              displayErrors(res.json.errors, { query: query, req: req, res: res });
            }
          }
        }
        return res;
      });
    };
  };
}

function noticeAbsentStack() {
  return '\n    If you using \'express-graphql\', you may get server stack-trace for error.\n    Just tune \'formatError\' to return \'stack\' with stack-trace:\n\n    import graphqlHTTP from \'express-graphql\';\n\n    const graphQLMiddleware = graphqlHTTP({\n      schema: myGraphQLSchema,\n      formatError: (error) => ({\n        message: error.message,\n        stack: process.env.NODE_ENV === \'development\' ? error.stack.split(\'\\n\') : null,\n      })\n    });\n\n    app.use(\'/graphql\', graphQLMiddleware);';
}
module.exports = exports['default'];