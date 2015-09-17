/**
 * @fileOverview redux validator middleware
 * @author Max
 **/

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashClone = require('lodash.clone');

var _lodashClone2 = _interopRequireDefault(_lodashClone);

exports['default'] = function (options) {
    var validatorMiddleware = function validatorMiddleware(store) {
        return function (next) {
            return function (action) {
                if (!action[options.key] || !action[options.key].validator) {
                    return next(action);
                }

                var flag = true;
                var errorParam = undefined,
                    errorId = undefined,
                    errorMsg = undefined;
                var nextAction = undefined;

                var validators = action[options.key].validator;

                var nextPayload = undefined;
                try {
                    nextPayload = action.payload.nextPayload;
                } catch (e) {}
                if (nextPayload !== undefined) {
                    nextAction = (0, _lodashClone2['default'])(action);
                    nextAction.payload = nextPayload;
                }

                var runValidator = function runValidator(func, msg, id, key) {
                    var flag = undefined;
                    if (func) {
                        var param = undefined;
                        if (key === 'payload') {
                            param = action.payload;
                        } else {
                            try {
                                param = action.payload[key];
                            } catch (e) {}
                        }
                        flag = func(param, store.getState());
                    }
                    if (typeof flag !== 'boolean') {
                        throw new Error('validator func must return boolean type');
                    }
                    if (!flag) {
                        errorParam = key;
                        errorId = id;
                        errorMsg = msg || '';
                    }

                    return flag;
                };

                validation: for (var i in validators) {
                    var validator = validators[i];

                    if (Array.prototype.isPrototypeOf(validator)) {
                        for (var j in validator) {
                            var item = validator[j];
                            flag = runValidator(item.func, item.msg, j, i);
                            if (!flag) {
                                break validation;
                            }
                        }
                    } else {
                        flag = runValidator(validator.func, validator.msg, 0, i);
                        if (!flag) {
                            break validation;
                        }
                    }
                }

                if (flag) {
                    action = nextAction || action;
                    return next(action);
                } else {
                    return {
                        err: 'validator',
                        msg: errorMsg,
                        param: errorParam,
                        id: errorId
                    };
                }
            };
        };
    };

    return validatorMiddleware;
};

module.exports = exports['default'];