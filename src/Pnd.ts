type bindPr<E, V> = <R>(fn: (resVal: V) => Pnd<E, R>) => Pnd<E, R>;
type leftMapPr<E, V> = <F>(fn: (rejVal: E) => F) => Pnd<F, V>;
type leftBindPr<E, V> = <F, R>(fn: (rejVal: E) => Pnd<F, V>) => Pnd<F, V>;
type doubleTapPr<E, V> = (fn: (rejVal: E | any | null, resVal: V | null, isResolved?: boolean) => void) => Pnd<E, V>;

export interface Pnd<E, V> {
  map: <R>(fn: (resVal: V) => R) => Pnd<E, R>,
  
  // Unable to extend Promise but need these to satisfy casting
  then: <R>(onfulfilled: (value: any) => R) => Pnd<E, R>,
  catch: <R>(onerror: (err: any) => R) => Pnd<any, R>,

  chain: bindPr<E, V>,
  flatMap: bindPr<E, V>,
  bind: bindPr<E, V>,
  
  rejMap: leftMapPr<E, V>,
  leftMap: leftMapPr<E, V>,
  
  rejChain: leftBindPr<E, V>,
  rejFlatMap: leftBindPr<E, V>,
  rejBind: leftBindPr<E, V>,
  leftChain: leftBindPr<E, V>,
  leftFlatMap: leftBindPr<E, V>,
  leftBind: leftBindPr<E, V>,
  
  // cata: <R>(rejFn: (rejVal: E | any) => R, resFn: (resVal: T) => R) => Promise<R>

  // bimap: <E, F, R>(rejFn: (rejVal: E | any) => F, resFn: (resVal: T) => R) => Pnd<F, R>,

  // recover: (fn: (rejVal: E | any) => T) => Promise<T>,

  // tap: (fn: (val: T) => void) => Pnd<E, V>,
  
  // doubleTap: doubleTapPr<E, V>,
}

export const PND_LEFT = Symbol('LEFT');
export const PND_RIGHT = Symbol('RIGHT');

export type PndInner<E, T> = {
  state: Symbol,
  left: E | undefined,
  right: T | undefined,
}

// export type Pnd<E, T> = Promise<PndInner<E, T>>;