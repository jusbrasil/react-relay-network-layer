'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.default = queriesBatch;

var _query = require('./_query');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function queriesBatch(relayRequestList, fetchWithMiddleware) {
  var requestMap = {};
  relayRequestList.forEach(function (req) {
    var reqId = req.getID();
    if (reqId in requestMap) {
      requestMap[reqId].push(req);
    } else {
      requestMap[reqId] = [req];
    }
  });

  var req = {
    relayReqId: 'BATCH_QUERY:' + (0, _keys2.default)(requestMap).join(':'),
    relayReqObj: relayRequestList,
    relayReqType: 'batch-query',
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json'
    }
  };

  req.body = (0, _stringify2.default)((0, _keys2.default)(requestMap).map(function (id) {
    return {
      id: id,
      query: requestMap[id][0].getQueryString(),
      variables: requestMap[id][0].getVariables()
    };
  }));

  return fetchWithMiddleware(req).then(function (payloadList) {
    payloadList.forEach(function (_ref) {
      var id = _ref.id,
          payload = _ref.payload;

      var relayRequests = requestMap[id];
      if (relayRequests) {
        relayRequests.forEach(function (relayRequest) {
          (0, _query.queryPost)(relayRequest, new _promise2.default(function (resolve) {
            resolve(payload);
          }));
        });
      }
    });
  }).catch(function (e) {
    return _promise2.default.all(relayRequestList.map(function (relayRequest) {
      return relayRequest.reject(e);
    }));
  });
}