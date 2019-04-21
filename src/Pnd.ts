type bindPr<E, T> = <R>(fn: (resVal: T) => Pnd<E, R>) => Pnd<E, R>;
type leftMapPr<E, T> = <F>(fn: (rejVal: E | any) => F) => Pnd<F, T>;
type leftBindPr<E, T> = <F>(fn: (rejVal: E | any) => Pnd<F, T>) => Pnd<F, T>;
type doubleTapPr<E, T> = (fn: (rejVal: E | any | null, resVal: T | null, isResolved?: boolean) => void) => Pnd<E, T>;

export interface Pnd<E, V> {
  map: <R>(fn: (resVal: V) => R) => Pnd<E, R>,
  
  // Unable to extend Promise but need these to satisfy casting
  then: <R>(onfulfilled: (value: any) => R) => Pnd<E, R>,
  catch: <R>(onerror: (err: any) => R) => Pnd<E, R>,

  // chain: bindPr<E, T>,
  // flatMap: bindPr<E, T>,
  // bind: bindPr<E, T>,
  
  // rejMap: leftMapPr<E, T>,
  // leftMap: leftMapPr<E, T>,
  
  // rejChain: leftBindPr<E, T>,
  // rejFlatMap: leftBindPr<E, T>,
  // rejBind: leftBindPr<E, T>,
  // leftChain: leftBindPr<E, T>,
  // leftFlatMap: leftBindPr<E, T>,
  // leftBind: leftBindPr<E, T>,
  
  // cata: <R>(rejFn: (rejVal: E | any) => R, resFn: (resVal: T) => R) => Promise<R>

  // bimap: <E, F, R>(rejFn: (rejVal: E | any) => F, resFn: (resVal: T) => R) => Pnd<F, R>,

  // recover: (fn: (rejVal: E | any) => T) => Promise<T>,

  // tap: (fn: (val: T) => void) => Pnd<E, T>,
  
  // doubleTap: doubleTapPr<E, T>,
}

export const PND_LEFT = Symbol('LEFT');
export const PND_RIGHT = Symbol('RIGHT');

export type PndInner<E, T> = {
  state: Symbol,
  left: E | undefined,
  right: T | undefined,
}

// export type Pnd<E, T> = Promise<PndInner<E, T>>;