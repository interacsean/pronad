type bindPr<E, V> = <R>(fn: (resVal: V) => Pnd<E, R>) => Pnd<E, R>;
type leftMapPr<E, V> = <F>(fn: (rejVal: E) => F) => Pnd<F, V>;
type leftBindPr<E, V> = <F>(fn: (rejVal: E) => Pnd<F, V>) => Pnd<F, V>;
type cata<E, V> = <R>(rejFn: (rejVal: E) => R, resFn: (resVal: V) => R) => Promise<R>

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
  
  cata: cata<E, V>,
  fold: cata<E, V>,

  bimap: <E, F, R>(rejFn: (rejVal: E) => F, resFn: (resVal: V) => R) => Pnd<F, R>,
  
  tap: (fn: (val: V) => void) => Pnd<E, V>,
  
  doubleTap: (fn: ((rejVal: E | null, resVal: V | null, isRight: boolean) => void) | ((rejVal: E | null, resVal: V | null) => void)) => Pnd<E, V>,

  getOrElseConst: (orElse: V, catchValOrFn?: V | ((err: any) => V), execFn?: boolean) => Promise<V>,

  getOrElse: <E>(fn: (rejVal: E) => V, catchFn?: (err: any) => V) => Promise<V>,
}

export const PND_LEFT = 'LEFT';
export const PND_RIGHT = 'RIGHT';
export const PND_ID = Symbol('Pronad');

export type PndInner<E, T> = {
  _pndId: symbol,
} & {
  state: 'LEFT',
  left: E,
  right: undefined,
} & {
  state: 'RIGHT',
  left: undefined,
  right: T,
}

// export type Pnd<E, T> = Promise<PndInner<E, T>>;