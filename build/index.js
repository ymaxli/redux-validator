/**
 * @fileOverview wrap validator middleware, and handle with options
 * @author Max
 **/

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _validator = require('./validator');

var _validator2 = _interopRequireDefault(_validator);

var defaultOptions = {
    validatorKey: 'meta',
    paramKey: 'payload'
};

exports['default'] = function () {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var realOptions = {};
    for (var i in defaultOptions) {
        realOptions[i] = options[i] || defaultOptions[i];
    }

    return (0, _validator2['default'])(realOptions);
};

module.exports = exports['default'];