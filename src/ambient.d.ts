import { Pronad, PronadInner } from './Pronad';

declare global {
  type bind<T> = <E, R>(fn: (resVal: T) => Pronad<E, R>) => Pronad<E, R>;
  type leftMap<T> = <E, F, R>(fn: (rejVal: E | any) => F) => Pronad<F, T>;
  type leftBind<T> = <E, F>(fn: (rejVal: E | any) => Pronad<F, T>) => Pronad<F, T>;
  type cata<T> = <E, R>(rejFn: (rejVal: E | any) => R, resFn: (resVal: T) => R) => Promise<R>;
  
  interface Promise<T> {
    // resolve: (resVal: T) => Pronad<any, T>,
    map: <E, R>(fn: (resVal: T) => R) => Pronad<E, R>,
    anden: <E, R>(onfulfilled: (value: PronadInner<E, T>) => R) => Pronad<E, R>,
  
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
  
    bimap: <E, F, R>(rejFn: (rejVal: E | any) => F, resFn: (resVal: T) => R) => Pronad<F, R>,
  
    tap: <E>(fn: (val: T) => void) => Pronad<E, T>,
    
    doubleTap: <E>(fn: ((rejVal: E | any | null, resVal: T | null, isRight: boolean) => void) | ((rejVal: E | any | null, resVal: T | null) => void)) => Pronad<E, T>,
    
    getOr: (orElse: T, catchValOrFn?: T | ((err: any) => T), execFn?: boolean) => Promise<T>,

    getOrElse: <E>(fn: (rejVal: E | any) => T, catchFn?: (err: any) => T) => Promise<T>,
  }
}
