interface Promise<T> {
  map: <R>(fn: (resolvedVal: T) => R) => Promise<R>,
  bind: <R>(fn: (resolvedVal: T) => Promise<R>) => Promise<R>,
  leftMap: <E>(fn: (rejectedVal: E | any) => any) => Promise<T>,
  leftBind: <E>(fn: (rejectedVal: E | any) => Promise<any>) => Promise<T>,
  cata: <E, R>(rejFn: (rejectedVal: E | any) => R, resFn: (resolvedVal: T) => R) => Promise<R>,
  // bimap
  // tap
  // doubleTap
  // and | or (accumulate - or is this like all/race)
}
