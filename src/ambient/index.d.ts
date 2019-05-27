
type bind<T> = <R>(fn: (resVal: T) => Promise<R>) => Promise<R>;
type bindPr<E, T> = <R>(fn: (resVal: T) => Pronad<E, R>) => Pronad<E, R>;

type leftMap<T> = <E>(fn: (rejVal: E | any) => any) => Promise<T>;
type leftMapPr<E, T> = <F>(fn: (rejVal: E | any) => any) => Pronad<F, T>;

type leftBind<T> = <E>(fn: (rejVal: E | any) => Promise<T>) => Promise<T>;
type leftBindPr<E, T> = <F>(fn: (rejVal: E | any) => Pronad<F, T>) => Pronad<F, T>;

type doubleTap<T> = <E>(fn: (rejVal: E | any | null, resVal: T | null, isResolved?: boolean) => void) => Promise<T>;
type doubleTapPr<E, T> = (fn: (rejVal: E | any | null, resVal: T | null, isResolved?: boolean) => void) => Pronad<E, T>;

interface Promise<T> {
  map: <R>(fn: (resVal: T) => R) => Promise<R>,

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

  cata: <E, R>(rejFn: (rejVal: E | any) => R, resFn: (resVal: T) => R) => Promise<R>,

  bimap: <E, F, R>(rejFn: (rejVal: E | any) => F, resFn: (resVal: T) => R) => Promise<R>,

  recover: <E>(fn: (rejVal: E | any) => T) => Promise<T>,
  
  tap: (fn: (val: T) => void) => Promise<T>,
  
  doubleTap: doubleTap<T>,
}

interface PromiseConstructor {
  unit<T>(val: T): Promise<T>,
  fromFalsey<T, E>(val: T | undefined | null | false, ifFalsey?: E): Pronad<E, T>,
  fromNull<T, E>(val: T | undefined | null, ifNull?: E): Pronad<E, T>,
}

declare var Pronad: PromiseConstructor;

interface Pronad<E, T> extends Promise<T> {
  map: <R>(fn: (resVal: T) => R) => Pronad<E, R>,
  
  chain: bindPr<E, T>,
  flatMap: bindPr<E, T>,
  bind: bindPr<E, T>,
  
  rejMap: leftMapPr<E, T>,
  leftMap: leftMapPr<E, T>,
  
  rejChain: leftBindPr<E, T>,
  rejFlatMap: leftBindPr<E, T>,
  rejBind: leftBindPr<E, T>,
  leftChain: leftBindPr<E, T>,
  leftFlatMap: leftBindPr<E, T>,
  leftBind: leftBindPr<E, T>,
  
  cata: <R>(rejFn: (rejVal: E | any) => R, resFn: (resVal: T) => R) => Promise<R>

  bimap: <E, F, R>(rejFn: (rejVal: E | any) => F, resFn: (resVal: T) => R) => Pronad<F, R>,

  recover: (fn: (rejVal: E | any) => T) => Promise<T>,

  tap: (fn: (val: T) => void) => Pronad<E, T>,
  
  doubleTap: doubleTapPr<E, T>,
}
