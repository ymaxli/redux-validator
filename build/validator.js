/**
 * @fileOverview redux validator middleware
 * @author Max
 **/

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

exports['default'] = function (options) {
    var validatorMiddleware = function validatorMiddleware(store) {
        return function (next) {
            return function (action) {
                if (!action[options.validatorKey] || !action[options.validatorKey].validator || action[options.validatorKey].disableValidate) {
                    // thunk compatible
                    if (action[options.paramKey] && action[options.paramKey].thunk) {
                        return next(action[options.paramKey].thunk);
                    } else {
                        return next(action);
                    }
                }

                var flag = true;
                var errorParam = undefined,
                    errorId = undefined,
                    errorMsg = undefined;

                var validators = action[options.validatorKey].validator || {};

                var runValidator = function runValidator(param, func, msg, id, key) {
                    var flag = undefined;
                    if (func) {
                        flag = func(param, store.getState(), action.payload);
                    } else {
                        throw new Error('validator func is needed');
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

                var runValidatorContainer = function runValidatorContainer(validator, param, key) {
                    var flag = undefined;
                    if (Array.prototype.isPrototypeOf(validator)) {
                        for (var j in validator) {
                            if (validator.hasOwnProperty(j)) {
                                var item = validator[j];
                                flag = runValidator(param, item.func, item.msg, j, key);
                                if (!flag) break;
                            }
                        }
                    } else {
                        flag = runValidator(param, validator.func, validator.msg, 0, key);
                    }
                    return flag;
                };

                var params = action[options.paramKey] || {};
                for (var i in validators) {
                    if (validators.hasOwnProperty(i)) {
                        if (i === options.paramKey || i === 'thunk') continue;
                        var validator = validators[i];

                        flag = runValidatorContainer(validator, params[i], i);
                        if (!flag) break;
                    }
                }

                // param object itself
                var paramObjValidator = validators[options.paramKey];
                if (paramObjValidator && flag) {
                    flag = runValidatorContainer(paramObjValidator, action[options.paramKey], options.paramKey);
                }
                // -------

                if (flag) {
                    // thunk compatible
                    if (action[options.paramKey] && action[options.paramKey].thunk) {
                        return next(action[options.paramKey].thunk);
                    } else {
                        return next(action);
                    }
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