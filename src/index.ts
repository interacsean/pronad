import { Pnd, PND_LEFT, PND_RIGHT, PndInner, PND_ID } from './Pnd';

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
    _pndId: PND_ID,
    state: PND_LEFT,
    left: err,
    right: undefined,
  };
  return Promise.resolve(pndVal) as unknown as Pnd<E, any>;
};

const Right = <T>(val: T): Pnd<any, T> => {
  const pndVal = {
    _pndId: PND_ID,
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
  // todo: Implement convertRejections
  const useCfg = Object.assign({
    convertRejections: false,
  }, cfg);

  Promise.prototype.map = function<E, V, R>(fn: (resVal: V) => R): Pnd<E, R> {
    return this.then((val: PndInner<E, V>): Pnd<E, R> => {
      if (typeof val === 'object' && val._pndId === PND_ID) {
        if (val.state === PND_RIGHT) {
          return Pronad.Right(fn(val.right));
        } else {
          return this as Pnd<E, R>;
        }
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
      if (typeof val === 'object' && val._pndId === PND_ID) {
        if (val.state === PND_LEFT) {
          return Pronad.Left(fn(val.left));
        } else {
          return this as Pnd<F, V>;
        }
      } else {
        throw new Error("Cannot leftMap on a Promise that does not contain a Pronad");
      }
    }) as Pnd<F, V>;
  };

  Promise.prototype.chain = 
  Promise.prototype.flatMap =
  Promise.prototype.bind = function<E, V, R>(fn: (resVal: V) => Pnd<E, R>): Pnd<E, R> {
    return this.then((val: PndInner<E, V>): Pnd<E, R> => {
      if (typeof val === 'object' && val._pndId === PND_ID) {
        if (val.state === PND_RIGHT) {
          return fn(val.right);
        } else {
          return this as Pnd<E, R>;
        }
      } else {
        throw new Error("Cannot bind on a Promise that does not contain a Pronad");
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
      if (typeof val === 'object' && val._pndId === PND_ID) {
        if (val.state === PND_LEFT) {
          return fn(val.left);
        } else {
          return this as Pnd<F, V>;
        }
      } else {
        throw new Error("Cannot leftBind on a Promise that does not contain a Pronad");
      }
    }) as Pnd<F, V>;
  };

  Promise.prototype.cata =
  Promise.prototype.fold = function<E, V, R>(
    rejFn: (rejVal: E) => R,
    resFn: (resVal: V) => R,
  ): Promise<R> {
    return this.then((val: PndInner<E, V>): R => {
      if (typeof val === 'object' && val._pndId === PND_ID) {
        if (val.state === PND_RIGHT) {
          return resFn(val.right);
        } else if (val.state === PND_LEFT) {
          return rejFn(val.left);
        } else {
          // should not happen
          return (val.right || val.left || val) as unknown as R;
        }
      } else {
        throw new Error("Cannot cata on a Promise that does not contain a Pronad");
      }
    });
  };

  Promise.prototype.bimap = function<E, V, F, R>(
    rejFn: (rejVal: E) => F,
    resFn: (resVal: V) => R,
  ): Pnd<F, R> {
    return this.then((val: PndInner<E, V>): Pnd<F, R> => {
      if (typeof val === 'object' && val._pndId === PND_ID) {
        if (val.state === PND_RIGHT) {
          return Pronad.Right(resFn(val.right));
        } else if (val.state === PND_LEFT) {
          return Pronad.Left(rejFn(val.left));
        } else {
          // should not happen
          return val as unknown as Pnd<F, R>;
        }
      } else {
        throw new Error("Cannot bimap on a Promise that does not contain a Pronad");
      }
    }) as Pnd<F, R>;
  };

  Promise.prototype.tap = function<E, V>(fn: (resVal: V) => void): Pnd<E, V> {
    return this.then((val: PndInner<E, V>): Pnd<E, V> => {
      if (typeof val === 'object' && val._pndId === PND_ID) {
        if (val.state === PND_RIGHT) {
          fn(val.right);
          return this as Pnd<E, V>;
        } else {
          return this as Pnd<E, V>;
        }
      } else {
        throw new Error("Cannot tap on a Promise that does not contain a Pronad");
      }
    }) as Pnd<E, V>;
  };

  Promise.prototype.doubleTap = function<E, V>(fn: (rejVal: E | null, resVal: V | null, isRight: boolean) => void): Pnd<E, V> {
    return this.then((val: PndInner<E, V>): Pnd<E, V> => {
      if (typeof val === 'object' && val._pndId === PND_ID) {
        if (val.state === PND_RIGHT) {
          fn(null, val.right, true);
        } else if (val.state === PND_LEFT) {
          fn(val.left, null, false);
        } else {
          fn(null, null, false);
        }
        return this as Pnd<E, V>;
      } else {
        throw new Error("Cannot tap on a Promise that does not contain a Pronad");
      }
    }) as Pnd<E, V>;
  };

  // Promise.prototype.recover = function<E, T>(fn: (rejVal: E | any) => T): Promise<T> {
  //   return this.catch(fn);
  // };
}
