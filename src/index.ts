import { Pnd, PND_LEFT, PND_RIGHT, PndInner, PND_ID } from './Pnd';
      // omg this doesn't deal with map((): Promise<T>) or does it?

export { Pnd, PND_LEFT, PND_RIGHT };

const isFunction = (mbFn: any): mbFn is Function  => typeof mbFn === 'function';

const isObject = (mbObj: any): mbObj is Object => typeof mbObj === 'object' && mbObj !== null;

const isThennable = (mbProm: any): mbProm is { then: Function } =>
  isObject(mbProm) && mbProm.then !== undefined && typeof mbProm.then === 'function';

interface PronadConstructor {
  Left<E, T>(val: E | Promise<E>): Pnd<E, T>,
  Right<E, T>(val: T | Promise<T>): Pnd<E, T>,
  // unit<T>(val: T): Pnd<never, T>,
  fromPromise<E, T>(promise: Promise<T>, catchFn?: (e: any) => E): Pnd<E, T>,
  fromFalsey<E, T>(val: T | undefined | null | false, ifFalsey?: E): Pnd<E, T>,
  fromNull<E, T>(val: T | undefined | null, ifNull?: E): Pnd<E, T>,
  makeCatchGuard: <E>(catcherFn: (err: any) => E) => <T, R>(mapFn: (val: T) => Promise<R>) => ((val: T) => Pnd<E, T>),
}

const Left = <E, T>(err: E | Promise<E>): Pnd<E, T> => {
  const defProm: Promise<E> = isThennable(err) ? err : Promise.resolve(err);
  return defProm.then((resVal: E) => ({
    _pndId: PND_ID,
    state: PND_LEFT,
    left: resVal,
    right: undefined,
  })) as unknown as Pnd<E, T>;
};

const Right = <E, T>(val: T | Promise<T>): Pnd<E, T> => {
  const defProm: Promise<T> = isThennable(val) ? val : Promise.resolve(val);
  return defProm.then((resVal: T) => ({
    _pndId: PND_ID,
    state: PND_RIGHT,
    left: undefined,
    right: resVal,
  })) as unknown as Pnd<E, T>;
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
  },
  // makeSafeCatcher: <E>(catcherFn: (err: any) => E) => {
  //   return <T>(mappedFn: (...args: any[]) => Promise<T>) => (...args: any[]): Pnd<E, T> => {
  //     return mappedFn(...args).catch(catcherFn);
  //     // not necessarily what we want - if we are mapping then this will be a map of a pronad
  //   };
  // },
}

export const monadifyPromises = (cfg: {} = {}) => {
  // todo: Implement convertRejections
  const useCfg = Object.assign({
    convertRejections: false,
  }, cfg);

  const mbConvertRej = !useCfg.convertRejections
    ? (<T>(p: Promise<T>): Promise<T> => p)
    : <T>(p: Promise<T>): Promise<T> => p.catch(Pronad.Left)
  ;

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

  Promise.prototype.getOrElse = function<E, V>(fn: (rejVal: E) => V, catchFn?: (err: any) => V): Promise<V> {
    const settledPromise = this.then((val: PndInner<E, V>): V => {
      if (typeof val === 'object' && val._pndId === PND_ID) {
        if (val.state === PND_RIGHT) {
          return val.right;
        } else if (val.state === PND_LEFT) {
          return fn(val.left);
        } else {
          throw new Error("Invalid state - Pronad.state was neither PND_RIGHT nor PND_LEFT");
        }
      } else {
        throw new Error("Cannot getOrElse on a Promise that does not contain a Pronad");
      }
    });
    return (typeof catchFn !== 'undefined')
      ? settledPromise.catch(catchFn)
      : settledPromise;
  }

  Promise.prototype.getOrElseConst = function<E, V>(fallback: V, catchValOrFn?: V | ((err: any) => V), execFn: boolean = false): Promise<V> {
    const settledPromise = this.then((val: PndInner<E, V>): V => {
      if (typeof val === 'object' && val._pndId === PND_ID) {
        if (val.state === PND_RIGHT) {
          return val.right;
        } else if (val.state === PND_LEFT) {
          return fallback;
        } else {
          throw new Error("Invalid state - Pronad.state was neither PND_RIGHT nor PND_LEFT");
        }
      } else {
        throw new Error("Cannot getOrElse on a Promise that does not contain a Pronad");
      }
    });
    return (typeof catchValOrFn !== 'undefined')
      ? settledPromise.catch((err: any): V => {
        return (execFn && isFunction(catchValOrFn))
          ? catchValOrFn(err)
          : catchValOrFn as V
      })
      : settledPromise;
  }
}
