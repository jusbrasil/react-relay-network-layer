'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _queries = require('./relay/queries');

var _queries2 = _interopRequireDefault(_queries);

var _queriesBatch = require('./relay/queriesBatch');

var _queriesBatch2 = _interopRequireDefault(_queriesBatch);

var _mutation = require('./relay/mutation');

var _mutation2 = _interopRequireDefault(_mutation);

var _fetchWrapper = require('./fetchWrapper');

var _fetchWrapper2 = _interopRequireDefault(_fetchWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable arrow-body-style, no-unused-vars */

var RelayNetworkLayer = function RelayNetworkLayer(middlewares, options) {
  var _this = this;

  (0, _classCallCheck3.default)(this, RelayNetworkLayer);

  _initialiseProps.call(this);

  this._options = options;
  this._middlewares = Array.isArray(middlewares) ? middlewares : [middlewares];
  this._supportedOptions = [];

  this._middlewares.forEach(function (mw) {
    if (mw && mw.supports) {
      if (Array.isArray(mw.supports)) {
        var _supportedOptions;

        (_supportedOptions = _this._supportedOptions).push.apply(_supportedOptions, mw.supports);
      } else {
        _this._supportedOptions.push(mw.supports);
      }
    }
  });
};

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.supports = function () {
    for (var _len = arguments.length, options = Array(_len), _key = 0; _key < _len; _key++) {
      options[_key] = arguments[_key];
    }

    return options.every(function (option) {
      return _this2._supportedOptions.indexOf(option) !== -1;
    });
  };

  this.sendQueries = function (requests) {
    if (requests.length > 1 && !_this2._isBatchQueriesDisabled()) {
      return (0, _queriesBatch2.default)(requests, _this2._fetchWithMiddleware);
    }

    return (0, _queries2.default)(requests, _this2._fetchWithMiddleware);
  };

  this.sendMutation = function (request) {
    return (0, _mutation2.default)(request, _this2._fetchWithMiddleware);
  };

  this._fetchWithMiddleware = function (req) {
    return (0, _fetchWrapper2.default)(req, _this2._middlewares);
  };

  this._isBatchQueriesDisabled = function () {
    return _this2._options && _this2._options.disableBatchQuery;
  };
};

exports.default = RelayNetworkLayer;
module.exports = exports['default'];