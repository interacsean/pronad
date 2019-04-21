import { Pnd, PndInner } from './Pnd';

declare global {
  type bind<T> = <R>(fn: (resVal: T) => Promise<R>) => Promise<R>;
  type leftMap<T> = <E, R>(fn: (rejVal: E | any) => any) => Pnd<E, never>;
  type leftBind<T> = <E>(fn: (rejVal: E | any) => Promise<T>) => Promise<T>;
  type doubleTap<T> = <E>(fn: (rejVal: E | any | null, resVal: T | null, isResolved?: boolean) => void) => Promise<T>;
  
  interface Promise<T> {
    // resolve: (resVal: T) => Pnd<any, T>,
    map: <V, R>(fn: (resVal: V) => R) => Pnd<never, R>,
  
    // chain: bind<T>,
    // flatMap: bind<T>,
    // bind: bind<T>,
  
    rejMap: leftMap<T>,
    leftMap: leftMap<T>,
  
    // rejChain: leftBind<T>,
    // rejFlatMap: leftBind<T>,
    // rejBind: leftBind<T>,
    // leftChain: leftBind<T>,
    // leftFlatMap: leftBind<T>,
    // leftBind: leftBind<T>,
  
    // cata: <E, R>(rejFn: (rejVal: E | any) => R, resFn: (resVal: T) => R) => Promise<R>,
  
    // bimap: <E, F, R>(rejFn: (rejVal: E | any) => F, resFn: (resVal: T) => R) => Promise<R>,
  
    // recover: <E>(fn: (rejVal: E | any) => T) => Promise<T>,
    
    // tap: (fn: (val: T) => void) => Promise<T>,
    
    // doubleTap: doubleTap<T>,
  }
}
