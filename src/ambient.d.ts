import { Pnd, PndInner } from './Pnd';

declare global {
  type bind<T> = <E, R>(fn: (resVal: T) => Pnd<E, R>) => Pnd<E, R>;
  type leftMap<T> = <E, F, R>(fn: (rejVal: E | any) => F) => Pnd<F, T>;
  type leftBind<T> = <E, F>(fn: (rejVal: E | any) => Pnd<F, T>) => Pnd<F, T>;
  type doubleTap<T> = <E>(fn: (rejVal: E | any | null, resVal: T | null, isResolved?: boolean) => void) => Pnd<E, T>;
  
  interface Promise<T> {
    // resolve: (resVal: T) => Pnd<any, T>,
    map: <E, R>(fn: (resVal: T) => R) => Pnd<E, R>,
  
    chain: bind<T>,
    flatMap: bind<T>,
    bind: bind<T>,
  
    rejMap: leftMap<T>,
    leftMap: leftMap<T>,
  
    rejChain: leftBind<T>,
    rejFlatMap: leftBind<T>,
    rejBind: leftBind<T>,
    leftChain: leftBind<T>,
    leftFlatMap: leftBind<T>,
    leftBind: leftBind<T>,
  
    // cata: <E, R>(rejFn: (rejVal: E | any) => R, resFn: (resVal: T) => R) => Promise<R>,
  
    // bimap: <E, F, R>(rejFn: (rejVal: E | any) => F, resFn: (resVal: T) => R) => Promise<R>,
  
    // recover: <E>(fn: (rejVal: E | any) => T) => Promise<T>,
    
    // tap: (fn: (val: T) => void) => Promise<T>,
    
    // doubleTap: doubleTap<T>,
  }
}
