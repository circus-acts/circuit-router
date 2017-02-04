import Circuit from 'circuit-js'
import Router from '../'

Object.defineProperty(window.location, 'pathname', {
  writable: true,
  value: '/'
})

describe('router', () => {
  let cct, x, y, spy

  beforeEach(() => {
    spy = jest.fn()
    cct = Circuit().bind(Router)
    x = cct.channel().tap(spy)
    y = cct.channel().tap(spy)
  })

  describe('logic', () => {
    it('should reduce signal and route', () => {
      cct.switch({x}).signal('x')
      expect(spy).toHaveBeenCalledWith('x', {'path': 'x'}, '1')
    })

    it('should route simple', () => {
      cct.switch({x}).signal('x')
      expect(spy.mock.calls[0][1]).toEqual({path: 'x'})
    })

    it('should block simple', () => {
      cct.switch({x}).signal('y')
      expect(spy).not.toHaveBeenCalled()
    })

    it('should route multiple', () => {
      cct.switch({x, y}).signal('y')
      expect(spy.mock.calls[0][1]).toEqual({path: 'y'})
    })

    it('should route starts with', () => {
      cct.switch({'x*': x}).signal('x123')
      expect(spy.mock.calls[0][1]).toEqual({path: 'x123'})
    })

    it('should route starts with parts', () => {
      cct.switch({'x*': x}).signal('x123/y/z')
      expect(spy.mock.calls[0][1]).toEqual({path: 'x123/y/z'})
    })

    it('should route starts with exact', () => {
      cct.switch({'x*': x}).signal('x')
      expect(spy.mock.calls[0][1]).toEqual({path: 'x'})
    })

    it('should not route starts with inexact', () => {
      cct.switch({'ax*': x}).signal('x123')
      expect(spy).not.toHaveBeenCalled()
    })

    it('should route ends with', () => {
      cct.switch({'*x': x}).signal('123x')
      expect(spy.mock.calls[0][1]).toEqual({path: '123x'})
    })

    it('should route ends with exact', () => {
      cct.switch({'*x': x}).signal('x')
      expect(spy.mock.calls[0][1]).toEqual({path: 'x'})
    })

    it('should not route ends with inexact', () => {
      cct.switch({'*x': x}).signal('x123')
      expect(spy).not.toHaveBeenCalled()
    })

    it('should route params', () => {
      cct.switch({':x': x}).signal('y123')
      expect(spy.mock.calls[0][1]).toEqual({path: 'y123', params: {x: 'y123'}})
    })

    it('should route query', () => {
      cct.switch({':x': x}).signal('y123?a=456')
      expect(spy.mock.calls[0][1]).toEqual({path: 'y123', params: {x: 'y123'}, query: {a: '456'}})
    })

    it('should route boolean query', () => {
      cct.switch({':x': x}).signal('y123?a')
      expect(spy.mock.calls[0][1]).toEqual({path: 'y123', params: {x: 'y123'}, query: {a: true}})
    })

    it('should route composite query', () => {
      cct.switch({':x': x}).signal('y123?a=456&b=789&c')
      expect(spy.mock.calls[0][1]).toEqual({path: 'y123', params: {x: 'y123'}, query: {a: '456', b: '789', c: true}})
    })

    it('should route parts', () => {
      cct.switch({'x/y/z': x}).signal('x/y/z')
      expect(spy.mock.calls[0][1]).toEqual({path: 'x/y/z'})
    })

    it('should block parts', () => {
      cct.switch({'x/y/z': x}).signal('x/z/z')
      expect(spy).not.toHaveBeenCalled()
    })

    it('should route part params', () => {
      cct.switch({'x/:y/z': x}).signal('x/y/z')
      expect(spy.mock.calls[0][1]).toEqual({path: 'x/y/z', params: {y: 'y'}})
    })

    it('should route complex', () => {
      cct.switch({'x/:y/*z/a*': x}).signal('x/y/z/a?123')
      expect(spy.mock.calls[0][1]).toEqual({path: 'x/y/z/a', params: {y: 'y'}, query: {123: true}})
    })
  })

  describe('routing', () => {
    it('should signal string pattern', () => {
      cct.switch({x}).signal('x')
      expect(spy.mock.calls[0][1]).toEqual({path: 'x'})
    });

    it('should signal state pattern', () => {
      cct.switch({x}).signal({$path: 'x', $state: 123})
      expect(spy.mock.calls[0][1]).toEqual({path: 'x', state: 123})
    });

    it('should signal history state change', () => {
      cct.switch({x})
      window.location.pathname = 'x'
      window.onpopstate({state: {x: 123}})
      expect(spy.mock.calls[0][1]).toEqual({path: 'x', state: {x: 123}})
    })
  })
})
