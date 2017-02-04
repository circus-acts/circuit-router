import {Match} from 'circuit-js'

const STR = 0
const VAR = 1
const ENDS_WITH = 2
const STARTS_WITH = 3

function parts(url) {
  return url.split('/').map(p => {
    if (p[0] === ':') return {part: p.substr(1), type: VAR}
    if (p.lastIndexOf('*') === p.length-1) return {part: p.substr(0, p.length-1), type: STARTS_WITH}
    if (p[0] === '*') return {part: p.substr(1), type: ENDS_WITH}
    return {part: p, type: STR}
  })
}

function match(routes) {
  return (idx, value) => {
    const url = (typeof value === 'string'? value : value.$path).split('?')
    const state = value.hasOwnProperty('$state') ? value.$state : null
    const vv = url[0].split('/')
    const rr = routes[idx]
    if (rr.length <= vv.length) {
      const args = {
        path: url[0]
      }
      let params
      let query
      if (url[1]) {
        query = url[1].split('&').reduce((q, p) => {
          const qp = p.split('=')
          q[qp[0].trim()] = qp.length === 2 ? qp[1].trim() : true
          return q
        },{})
      }

      for(let i = 0; i < rr.length; i ++ ) {
        const v = vv[i]
        const r = rr[i]
        if (r.type === VAR) {
          params = params || {}
          params[r.part] = v
          continue
        }
        if (r.part !== v) {
          if (r.type === STARTS_WITH && v.indexOf(r.part) === 0) continue
          if (r.type === ENDS_WITH && v.indexOf(r.part) + r.part.length === v.length) continue
          return undefined
        }
      }
      if (params) args.params = params
      if (query) args.query = query
      if (state !== null) args.state = state
      return args
    }
  }
}

function Router({channel}) {
  if (!channel.switch) channel.import(Match)
  const _switch = channel.switch.bind(channel)

  if (window.history) {
    window.onpopstate = event => {
      channel.signal({$path: window.location.pathname, $state: event.state || event.detail})
    }
  }

  channel.switch = routes => {
    const routeIdx = Object.keys(routes).reduce( (r, k, i) => {
      r[i + 1] = routes[k]
      return r
    }, {})

    const routeMap = Object.keys(routes)
      .map(k => parts(k))
      .sort((r1, r2) => r1.length > r2.length)
      .reduce( (r, p, i) => {
        r[i + 1] = p
        return r
      }, {})
    return _switch(routeIdx, match(routeMap))
  }
}

export const push = (location, state) => {
  // by convention - push the history then pop it to establish the new location
  history.pushState(state, null, location)
  window.dispatchEvent(new CustomEvent('popstate', {detail: state}))
}

export const replace = (state) => {
  history.replaceState(state)
  window.dispatchEvent(new CustomEvent('popstate', {detail: state}))
}

export default Router
