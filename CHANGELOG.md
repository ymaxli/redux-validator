## 0.1

+ Initial release.

## 0.1.1

+ change validate strategy from read validator map to read payload map.

## 0.1.2

+ change lodash.clone to lodash.clonedeep

## 0.1.3

+ pass action.payload in validator func

## 0.1.4

+ check all validators not all params

## 0.1.5

+ allow validators undefined

## 0.2.0

+ no longer support promise, instead support thunk
+ custom `paramKey` is supported
+ `options.key` changed to `options.validatorKey`

## 0.2.1

+ skip this middleware when `disableValidator: true` in `meta`
