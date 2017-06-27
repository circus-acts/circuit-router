# circuit-router

A signal based router for circuit-js applications.

```
import Circuit from 'circuit-js'
import Router from 'circuit-router'
import {home, ALL, ACTIVE, COMPLETED} from './app'

new Circuit().bind(Router).switch({
  '/': home,
  '/all': ALL,
  '/active': ACTIVE
  '/completed': COMPLETED
})
```

## Install

`npm install -S circuit-router`


## Description
circuit-router signals location state changes and binds the Match.switch operation to a routing context. 
A signal is generated on a matching channel whenever a location state change is detected. The signal will 
be the current location (plus any history state), and a routing context holding any routing parameters or 
search query values.

### Routing syntax

Pattern `/x/y/z` matches `/x/y/z`, `/x/y/z?a=1`, `/x/y/z?b=2`

Pattern `/x/:y/z` matches `/x/y1/z`, `/x/y2/z`, `/x/ABC/z`

Pattern `/x/*Y/z` matches `/x/Y/z`, `/x/abcY/z`, but not `/x/abcy/z` or `/x/abcY123/z`

Pattern `/x/Y*/z` matches `/x/Y/z`, `/x/Yabc/z`, but not `/x/yabc/z` or `/x/aY/z`

### Parameter and query signal values

Pattern `/x/:y/:z` matches `/x/abc/z` and signals `'/x/abc/z', {path: '/x/abc/z', params: {y: 'abc'}}`

Pattern `/x/y/z` matches `/x/y/z?a=1&b=2` and signals `/x/y/z?a=1&b=2`, `{path: '/x/y/z', {query: {a: 1, b: 2}}`


### History operations

For convenience, circuit-router exports push and replace operations. These helpers simply push and replace history 
state respectively, causing the router to explicitly signal the location state.

```
import {push, replace} from 'circuit-router'

// current location = /abc
push('/def') // => current location = /def, history = /abc, signal '/def'
push('/ghi', 123) // => current location = /ghi, history = /def, signal '/def', {state: 123}
replace('/abc') // current location = /abc, history = /def, signal '/abc'
```

## Test

`npm test` or `npm test -- --watch`

### Copyright

Source code is licensed under the ISC License (ISC). See [LICENSE](./LICENSE)
file in the project root. Documentation to the project is licensed under the
[CC BY 4.0](http://creativecommons.org/licenses/by/4.0/) license.

