'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function (graphqlHTTPMiddleware) {
  return function (req, res) {
    var subResponses = [];
    return _promise2.default.all(req.body.map(function (data) {
      return new _promise2.default(function (resolve) {
        var subRequest = (0, _extends3.default)({
          __proto__: req.__proto__ }, req, {
          body: data
        });
        var subResponse = {
          status: function status(st) {
            this.statusCode = st;return this;
          },
          set: function set() {
            return this;
          },
          send: function send(payload) {
            resolve({ status: this.statusCode, id: data.id, payload: payload });
          },


          // support express-graphql@0.5.2
          setHeader: function setHeader() {
            return this;
          },
          header: function header() {},
          write: function write(payload) {
            this.payload = payload;
          },
          end: function end(payload) {
            // support express-graphql@0.5.4
            if (payload) {
              this.payload = payload;
            }
            resolve({ status: this.statusCode, id: data.id, payload: this.payload });
          }
        };
        subResponses.push(subResponse);
        graphqlHTTPMiddleware(subRequest, subResponse);
      });
    })).then(function (responses) {
      var response = '';
      responses.forEach(function (_ref, idx) {
        var status = _ref.status,
            id = _ref.id,
            payload = _ref.payload;

        if (status) {
          res.status(status);
        }
        var comma = responses.length - 1 > idx ? ',' : '';
        response += '{ "id":"' + id + '", "payload":' + payload + ' }' + comma;
      });
      res.set('Content-Type', 'application/json');
      res.send('[' + response + ']');
    }).catch(function (err) {
      res.status(500).send({ error: err.message });
    });
  };
};

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }