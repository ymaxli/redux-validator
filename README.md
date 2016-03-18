# redux-validator [![Build Status](https://travis-ci.org/MaxLee1994/redux-validator.svg?branch=master)](https://travis-ci.org/MaxLee1994/redux-validator) [![Coverage Status](https://coveralls.io/repos/MaxLee1994/redux-validator/badge.svg?branch=master&service=github)](https://coveralls.io/github/MaxLee1994/redux-validator?branch=master)
Action parameter validator middleware for redux

## Installation
```javascript
npm i redux-validator --save
```

## How to use

### Add middleware to your store


```javascript
import Validator from 'redux-validator';

const validator = Validator();
const createStoreWithMiddleware = applyMiddleware(validator)(createStore);
const store = createStoreWithMiddleware(reducer);
```

If you use other middleware, apply `redux-validator` *first* to prevent unexpected errors.

```javascript
import promise from 'redux-promise';
import Validator from 'redux-validator';

const validator = Validator();
const createStoreWithMiddleware = applyMiddleware(validator, promise)(createStore);
const store = createStoreWithMiddleware(reducer);
```

### Add validators to your actions


```javascript
const validAction = {
    type: ADD_TODO,
    payload: {
        text: 'Sample todo',
        complete: false
    },
    meta: {
        validator: {
            text: {
                func: (text, state, payload) => 0 <= text.length
                msg: 'Cannot add an empty todo'
            },
            complete: {
                func: (complete, state, payload) => typeof(complete) === "boolean"
                msg: 'Complete must be true or false'
            }
        }
    }
}

const result = dispatch(validAction); // validation success and dispatch completes
```

`redux-validator` is [Flux Standard Action](https://github.com/acdlite/flux-standard-action) compatible.

The properties in `action.payload` are validated against the functions provided in the `action.meta.validator` map. If validation of any property fails, the dispatch is aborted and an object containing error information is returned.

```javascript
const invalidAction = {
    type: ADD_TODO,
    payload: {
        text: ''
    },
    meta: {
        validator: {
            text: {
                func: (text, state, payload) => 0 <= text.length
                msg: 'Cannot add an empty todo'
            }
        }
    }
}

const result = dispatch(invalidAction); // dispatch aborted and error returned:
// result = {
//     err: 'validator',
//     msg: 'Cannot add an empty todo',
//     param: 'text',
//     id: 0
// }
```

Multiple validations may be defined for a single property. The property will be checked against all validators in the array in the order they are declared. The dispatch is aborted and the error returned on the first failing validation.


```javascript
const action = {
    type: ADD_TODO,
    payload: {
        text: 'Write an awesome react app'
    },
    meta: {
        validator: {
            text: [
                {
                    func: (text, state, payload) => 0 <= text.length
                    msg: 'Cannot add an empty todo'
                },
                {
                    func: (text, state, payload) => text.length < 500
                    msg: 'Todo too long'
                }
            ]
        }
    }
}
```

## Other Examples

### Usage with redux-actions

It's very easy to integrate `redux-validator` with `createAction` from [redux-actions](https://github.com/acdlite/redux-actions):

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

### Async actions (thunk support)

```javascript
import {createAction} from 'redux-actions';

const actionCreator = createAction('action2', payload => (
    {
        payload, // if you want a param to be validated, then return this param
        thunk: dispatch => {} // thunk would not be validated, and would be dispatched if validator all succeed
    }
), () => ({
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
// result2 would not abort, and it would continue to pass through thunk middleware
// result2 = thunk
```

## API

### Middleware Options

#### validatorKey

Override the default location for the validators in `action` objects (default is `'meta'`).

```javascript
import Validator from 'redux-validator';

const validator = Validator({
    validatorKey: 'val' // validator should be put inside action.val
});
```

### paramKey

Override the default location for the parmas in `action` objects (default is `payload`).

```javascript
import Validator from 'redux-validator';

const validator = Validator({
    paramKey: 'val' // validator should be put inside action.val
});
```
