import { Pnd, PND_LEFT, PND_RIGHT, PndInner } from './Pnd';

export { Pnd, PND_LEFT, PND_RIGHT };

interface PronadConstructor {
  Left<E>(val: E): Pnd<E, any>,
  Right<T>(val: T): Pnd<any, T>,
  // unit<T>(val: T): Pnd<never, T>,
  fromPromise<E, T>(promise: Promise<T>, catchFn?: (e: any) => E): Pnd<E, T>,
  fromFalsey<E, T>(val: T | undefined | null | false, ifFalsey?: E): Pnd<E, T>,
  fromNull<E, T>(val: T | undefined | null, ifNull?: E): Pnd<E, T>,
}

const Left = <E>(err: E): Pnd<E, any> => {
  const pndVal = {
    state: PND_LEFT,
    left: err,
    right: undefined,
  };
  return Promise.resolve(pndVal) as unknown as Pnd<E, any>;
};

const Right = <T>(val: T): Pnd<any, T> => {
  const pndVal = {
    state: PND_RIGHT,
    left: undefined,
    right: val,
  };
  return Promise.resolve(pndVal) as unknown as Pnd<any, T>;
}

export const Pronad: PronadConstructor = {
  Left,
  Right,
  // unit: <T>(val: T): Pnd<never, T> => Promise.resolve([PND_RIGHT, undefined, val]),
  fromPromise: <E, T>(promise: Promise<T>, catchFn?: (e: any) => E): Pnd<E, T> => {
    return promise.then(
      Right,
      (e: any) => Left(
        catchFn ? catchFn(e) : e
      ),
    ) as Pnd<E, T>
  },
  fromFalsey: <E, T>(val: T | undefined | null | false, ifFalsey?: E): Pnd<E, T> => {
    return val !== undefined && val !== null && val !== false
      ? Right(val)
      : Left(typeof ifFalsey !== 'undefined' ? ifFalsey : null) as Pnd<E, T>;
  },
  fromNull: <E, T>(val: T | undefined | null, ifNull?: E): Pnd<E, T> => {
    return val !== undefined && val !== null
      ? Right(val)
      : Left(typeof ifNull !== 'undefined' ? ifNull : null) as Pnd<E, T>;
  }
}

export const monadifyPromises = (cfg: {} = {}) => {
  // todo: Implement autoConvertPromises
  const useCfg = Object.assign({
    autoConvertPromises: false,
  }, cfg);

  Promise.prototype.map = function<E, V, R>(fn: (resVal: V) => R): Pnd<E, R> {
    return this.then((val: PndInner<E, V>): Pnd<E, R> => {
      if (typeof val === 'object' && val.state === PND_LEFT) {
        return this as Pnd<E, R>;
      } else if (typeof val === 'object' && val.state === PND_RIGHT) {
        return Pronad.Right(fn(val.right as V));
      } else {
        throw new Error("Cannot map on a Promise that does not contain a Pronad");
        // fallback for raw promise
        // return Pronad.Right(fn(val as unknown as V));
      }
    }) as Pnd<E, R>;
  };

  Promise.prototype.rejMap =
  Promise.prototype.leftMap = function<E, V, F>(fn: (rejVal: E) => F): Pnd<F, V> {
    return this.then((val: PndInner<E, V>): Pnd<F, V> => {
      if (typeof val === 'object' && val.state === PND_RIGHT) {
        return this as Pnd<F, V>;
      } else if (typeof val === 'object' && val.state === PND_LEFT) {
        return Pronad.Left(fn(val.left as E));
      } else {
        throw new Error("Cannot leftMap on a Promise that does not contain a Pronad");
      }
    }) as Pnd<F, V>;
  };

  Promise.prototype.chain = 
  Promise.prototype.flatMap =
  Promise.prototype.bind = function<E, V, R>(fn: (resVal: V) => Pnd<E, R>): Pnd<E, R> {
    return this.then((val: PndInner<E, V>): Pnd<E, R> => {
      if (typeof val === 'object' && val.state === PND_LEFT) {
        return this as Pnd<E, R>;
      } else if (typeof val === 'object' && val.state === PND_RIGHT) {
        return fn(val.right as V);
      } else {
        throw new Error("Cannot bind on a Promise that does not contain a Pronad");
        // fallback for raw promise
        // return Pronad.Right(fn(val as V));
      }
    }) as Pnd<E, R>;
  };
  
  Promise.prototype.rejChain =
  Promise.prototype.rejFlatMap =
  Promise.prototype.rejBind =
  Promise.prototype.leftChain = 
  Promise.prototype.leftFlatMap =
  Promise.prototype.leftBind = function<E, F, V>(fn: (rejVal: E) => Pnd<F, V>): Pnd<F, V> {
    return this.then((val: PndInner<E, V>): Pnd<F, V> => {
      if (typeof val === 'object' && val.state === PND_RIGHT) {
        return this as Pnd<F, V>;
      } else if (typeof val === 'object' && val.state === PND_LEFT) {
        return fn(val.left as E);
      } else {
        throw new Error("Cannot leftBind on a Promise that does not contain a Pronad");
        // fallback for raw promise
        // return Pronad.Right(fn(val as V));
      }
    }) as Pnd<F, V>;
  };

  // Promise.prototype.cata = function<T, E, R>(
  //   rejFn: (rejVal: E | any) => R,
  //   resFn: (resVal: T) => R,
  // ): Pnd<never, R> {
  //   return this.then(resFn, rejFn);
  // };

  // Promise.prototype.tap = function<E, T>(fn: (val: T) => void): Pnd<E, T> {
  //   return this.then((val: T): T => {
  //     fn(val);
  //     return val;
  //   });
  // };

  // Promise.prototype.doubleTap = function<E, T>(fn: (rejVal: E | any | null, resVal: T | null, isResolved?: boolean) => void): Pnd<E, T> {
  //   return this.then(
  //     (resVal: T): T => {
  //       fn(null, resVal, true);
  //       return resVal;
  //     },
  //     (rejVal: E): Pnd<E, never> => {
  //       fn(rejVal, null, false);
  //       return Promise.reject(rejVal);
  //     },
  //   );
  // };

  // Promise.prototype.bimap = function<T, E, F, R>(
  //   rejFn: (rejVal: E | any) => F,
  //   resFn: (resVal: T) => R,
  // ): Pnd<F, R> {
  //   return this.then(resFn, (e: E | any): Pnd<F, never> => Promise.reject(rejFn(e)));
  // };

  // Promise.prototype.recover = function<E, T>(fn: (rejVal: E | any) => T): Promise<T> {
  //   return this.catch(fn);
  // };
}
