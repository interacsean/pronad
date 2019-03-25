interface Promise<T> {
  map: <R>(fn: (resolvedVal: T) => R) => Promise<R>,
}
