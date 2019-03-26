
type bind<T> = <R>(fn: (resVal: T) => Promise<R>) => Promise<R>;
type bindPr<E, T> = <R>(fn: (resVal: T) => Pronad<E, R>) => Pronad<E, R>;

type leftMap<T> = <E>(fn: (rejVal: E | any) => any) => Promise<T>;
type leftMapPr<E, T> = <F>(fn: (rejVal: E | any) => any) => Pronad<F, T>;

type leftBind<T> = <E>(fn: (rejVal: E | any) => Promise<T>) => Promise<T>;
type leftBindPr<E, T> = <F>(fn: (rejVal: E | any) => Pronad<F, T>) => Pronad<F, T>;


interface Promise<T> {
  map: <R>(fn: (resVal: T) => R) => Promise<R>,

  flatMap: bind<T>,
  bind: bind<T>,

  rejMap: leftMap<T>,
  // leftMap: leftMap,

  rejFlatMap: leftBind<T>,
  rejBind: leftBind<T>,
  // leftBind: leftBind,
  // leftFlatMap: leftBind,

  cata: <E, R>(rejFn: (rejVal: E | any) => R, resFn: (resVal: T) => R) => Promise<R>,

  recover: <E, R>(fn: (rejVal: E | any) => R) => Promise<R>, // this would just be an alias for catch
  // we could write an autoRecover but unsure if we can do this with type safety to ensure that the rej type is the same as res

  // bimap
  // tap
  // doubleTap
  // and | or (accumulate - or is this like all/race)
}

interface Pronad<E, T> extends Promise<T> {
  map: <R>(fn: (resVal: T) => R) => Pronad<E, R>,
  
  flatMap: bindPr<E, T>,
  bind: bindPr<E, T>,
  
  rejMap: leftMapPr<E, T>,
  // leftMap: leftMapPr<E, T>,
  
  rejFlatMap: leftBindPr<E, T>,
  rejBind: leftBindPr<E, T>,
  // leftBind: leftBindPr<E>,
  // leftFlatMap: leftBindPr<E>,
  
  cata: <R>(rejFn: (rejVal: E | any) => R, resFn: (resVal: T) => R) => Promise<R>

  recover: <R>(fn: (rejVal: E | any) => R) => Pronad<never, R>,
}
