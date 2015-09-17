# redux-validator [![Build Status](https://travis-ci.org/MaxLee1994/redux-validator.svg?branch=master)](https://travis-ci.org/MaxLee1994/redux-validator)
Action parameter validator middleware for redux

## Installation
```javascript
npm i redux-validator --save
```

## How to use

apply `redux-validator` *before any middleware*, otherwise there would be unexpected errors!
```javascript
import promise from 'redux-promise';
import Validator from 'redux-validator';

const validator = Validator();
const createStoreWithMiddleware = applyMiddleware(validator, promise)(createStore);
const store = createStoreWithMiddleware(reducer);
```

## Example
`redux-validator` is compatible with [FSA](https://github.com/acdlite/flux-standard-action)  
it receives `validator` map in `action.meta`(which can be dicided by you), and uses validator functions in `validator` to validate param in `action.payload`  
if validating failed, `redux-validator` would return an error object containing error information, and stop the dispatch process.

### example with two params
```javascript
const action = {
    type: 'action1',
    payload: {
        foo: 1,
        bar: 2
    },
    meta: {
        validator: {
            foo: {// apply to param payload.foo
                func: (foo, state) => foo > 0, // state is your app's state tree
                msg: 'foo param error'
            },
            bar: {
                func: (bar, state) => bar < 0,
                msg: 'bar param error'
            }
        }
    }
};

const result = dispatch(action);
// dispatch would abort!
// result = {
//     err: 'validator',
//     msg: 'bar param error',
//     param: 'bar',
//     id: 0
// }
```

if you're using [redux-actions](https://github.com/acdlite/redux-actions), it's very easy to integrate with `createAction`
### example with redux-actions
```javascript
import {createAction} from 'redux-actions';

const actionCreator = createAction('action2', payload => payload, () => ({
    validator: {
        payload: [ // if action.payload is not a map, use payload key to validate action.payload itself
            {
                func: (payload, state) => payload >= 0,
                msg: 'payload is less than 0'
            },
            {
                func: (payload, state) => payload < 100
            }
        ]
    }
}));

const result1 = dispath(actionCreator(-1));
const result2 = dispath(actionCreator(200));
// dispatchs would abort!
// result1 = {
//     err: 'validator',
//     msg: 'payload is less than 0',
//     param: 'payload',
//     id: 0
// }
// result2 = {
//     err: 'validator',
//     msg: '',
//     param: 'payload',
//     id: 1
// }
```

### example with async actions, such as promise
```javascript
import {createAction} from 'redux-actions';

const actionCreator = createAction('action2', payload => {
    const promise = new Promise((resolve, reject) {
        resolve(payload);    
    });

    return {
        payload, // if you want a param to be validated, then return this param
        nextPayload: promise // nextPayload would not be validated, and would be dispatched as next action's payload if validator all succeed
    };
}, () => ({
    validator: {
        payload: [
            {
                func: (payload, state) => payload >= 0,
                msg: 'payload is less than 0'
            },
            {
                func: (payload, state) => payload < 100
            }
        ]
    }
}));
const result1 = dispath(actionCreator(-1));
const result2 = dispath(actionCreator(10));
// result1 would abort!
// result1 = {
//     err: 'validator',
//     msg: 'payload is less than 0',
//     param: 'payload',
//     id: 0
// }
// result2 would not abort, and it would continue to pass through next middleware
// result2 = {
//     type: 'action2',
//     payload: promise,
//     meta: ...
// }
```

## API

### Options
#### key
decide where to put your own validator in `action` object, default to `'meta'`

example:
```javascript
import Validator from 'redux-validator';

const validator = Validator({
    key: 'val'// validator should be put inside action.val
});
```

### validator with no param
if you want to validate an action without any param, you can use `default` to trigger a validation

example:
```javascript
import {createAction} from 'redux-actions';

const action = createAction('action3', () => {}, () => ({
    validator: {
        default: {
            func: (default, state) => state.foo > 0,
            msg: 'this is a validation without any param'
        }
    }
}));
```
