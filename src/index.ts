export type Pronad<E, T> = Promise<T>;

export const monadifyPromises = () => {
  Promise.prototype.map = function<E, T, R>(fn: (resVal: T) => R): Pronad<E, R> {
    return this.then(fn);
  };
  Promise.prototype.rejMap =
  Promise.prototype.leftMap = function<E, T, F>(fn: (rejVal: E | any) => F): Pronad<F, T> {
    return this.catch((e: E | any): Pronad<F, never> => Promise.reject(fn(e)));
  };

  Promise.prototype.chain = 
  Promise.prototype.flatMap =
  Promise.prototype.bind = function<E, T, R>(fn: (resVal: T) => Pronad<E, R>): Pronad<E, R> {
    return this.then(fn);
  };
  
  Promise.prototype.rejChain =
  Promise.prototype.rejFlatMap =
  Promise.prototype.rejBind =
  Promise.prototype.leftChain = 
  Promise.prototype.leftFlatMap =
  Promise.prototype.leftBind = function<E, T, F>(fn: (rejVal: E | any) => Pronad<F, T>): Pronad<F, T> {
    return this.catch((e: E | any): Pronad<F, T> => fn(e));
  };

  Promise.prototype.cata = function<T, E, R>(
    rejFn: (rejVal: E | any) => R,
    resFn: (resVal: T) => R,
  ): Pronad<never, R> {
    return this.then(resFn, rejFn);
  };

  Promise.prototype.tap = function<E, T>(fn: (val: T) => void): Pronad<E, T> {
    return this.then((val: T): T => {
      fn(val);
      return val;
    });
  };

  Promise.prototype.doubleTap = function<E, T>(fn: (rejVal: E | any | null, resVal: T | null, isResolved?: boolean) => void): Pronad<E, T> {
    return this.then(
      (resVal: T): T => {
        fn(null, resVal, true);
        return resVal;
      },
      (rejVal: E): Pronad<E, never> => {
        fn(rejVal, null, false);
        return Promise.reject(rejVal);
      },
    );
  };

  Promise.prototype.bimap = function<T, E, F, R>(
    rejFn: (rejVal: E | any) => F,
    resFn: (resVal: T) => R,
  ): Pronad<F, R> {
    return this.then(resFn, (e: E | any): Pronad<F, never> => {
      console.log('rejecting now****');
      return Promise.reject(rejFn(e));
    });
  };

  Promise.prototype.recover = function<E, T>(fn: (rejVal: E | any) => T): Promise<T> {
    return this.catch(fn);
  };

  Promise.fromFalsey = <E, T>(val: T | undefined | null | false, ifFalsey?: E): Pronad<E, T> => {
    return val !== undefined && val !== null && val !== false ? Promise.resolve(val) : Promise.reject(typeof ifFalsey !== 'undefined' ? ifFalsey : null);
  }

  Promise.fromNull = <E, T>(val: T | undefined | null, ifNull?: E): Pronad<E, T> => {
    return val !== undefined && val !== null ? Promise.resolve(val) : Promise.reject(typeof ifNull !== 'undefined' ? ifNull : null);
  }
}
