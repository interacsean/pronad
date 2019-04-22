import { Pnd, PndInner } from './Pnd';

declare global {
  type bind<T> = <E, R>(fn: (resVal: T) => Pnd<E, R>) => Pnd<E, R>;
  type leftMap<T> = <E, F, R>(fn: (rejVal: E | any) => F) => Pnd<F, T>;
  type leftBind<T> = <E, F>(fn: (rejVal: E | any) => Pnd<F, T>) => Pnd<F, T>;
  type cata<T> = <E, R>(rejFn: (rejVal: E | any) => R, resFn: (resVal: T) => R) => Promise<R>;
  
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
  
    cata: cata<T>,
    fold: cata<T>,
  
    bimap: <E, F, R>(rejFn: (rejVal: E | any) => F, resFn: (resVal: T) => R) => Pnd<F, R>,
  
    tap: <E>(fn: (val: T) => void) => Pnd<E, T>,
    
    doubleTap: <E>(fn: ((rejVal: E | any | null, resVal: T | null, isRight: boolean) => void) | ((rejVal: E | any | null, resVal: T | null) => void)) => Pnd<E, T>,
    
    getOrElseConst: (orElse: T, catchFn?: (err: any) => T) => Promise<T>,

    getOrElse: <E>(fn: (rejVal: E | any) => T, catchFn?: (err: any) => T) => Promise<T>,
  }
}
