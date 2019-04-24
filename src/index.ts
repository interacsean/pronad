/**
 * only thing is, awaiting something that hasn't been 'settled', will use then
 * type sig which goes to T, not Pronad<E, T>, which is actually innacurate
 */ 

import { Pronad, PND_LEFT, PND_RIGHT, PronadInner, PND_ID } from './Pronad';
      // omg this doesn't deal with map((): Promise<T>) or does it?

export { Pronad, PND_LEFT, PND_RIGHT };

const isFunction = (mbFn: any): mbFn is Function  => typeof mbFn === 'function';

const isObject = (mbObj: any): mbObj is Object => typeof mbObj === 'object' && mbObj !== null;

const isThennable = (mbProm: any): mbProm is { then: Function } =>
  isObject(mbProm) && mbProm.then !== undefined && typeof mbProm.then === 'function';

const isPronad = <E, T>(mbPronad: any): mbPronad is Pronad<E, T> =>
  isObject(mbPronad) && mbPronad._pndId === PND_ID && (mbPronad.state === PND_LEFT || mbPronad.state === PND_RIGHT);

interface PronadConstructor {
  Left<E, T>(val: E | Promise<E>): Pronad<E, T>,
  Right<E, T>(val: T | Promise<T>): Pronad<E, T>,
  // unit<T>(val: T): Pronad<never, T>,
  fromPromise<E, T>(promise: Promise<T>, catchFn?: (e: any) => E): Pronad<E, T>,
  fromFalsey<E, T>(val: T | undefined | null | false, ifFalsey?: E): Pronad<E, T>,
  fromNull<E, T>(val: T | undefined | null, ifNull?: E): Pronad<E, T>,
  makeCatchGuard: <E>(catchFn: (err: any) => E) => <T, R>(mappedFn: ((val: T) => Promise<R>) | ((val: T) => Pronad<E, R>)) => ((val: T) => Pronad<E, R>),
}

const createLeft = <E, T>(leftVal: E): PronadInner<E, T> => ({
  _pndId: PND_ID,
  state: PND_LEFT,
  left: leftVal,
  right: undefined,
});

const createRight = <E, T>(rightVal: T): PronadInner<E, T> => ({
  _pndId: PND_ID,
  state: PND_RIGHT,
  left: undefined,
  right: rightVal,
});

const Left = <E, T>(err: E | Promise<E>): Pronad<E, T> => {
  const defProm: Promise<E> = isThennable(err) ? err : Promise.resolve(err);
  return defProm.then((leftVal: E): PronadInner<E, T> => ({
    _pndId: PND_ID,
    state: PND_LEFT,
    left: leftVal,
    right: undefined,
  })) as unknown as Pronad<E, T>;
};

const Right = <E, T>(val: T | Promise<T>): Pronad<E, T> => {
  const defProm: Promise<T> = isThennable(val) ? val : Promise.resolve(val);
  return defProm.then((rightVal: T): PronadInner<E, T> => ({
    _pndId: PND_ID,
    state: PND_RIGHT,
    left: undefined,
    right: rightVal,
  })) as unknown as Pronad<E, T>;
}

export const P: PronadConstructor = {
  Left,
  Right,
  // unit: <T>(val: T): Pronad<never, T> => Promise.resolve([PND_RIGHT, undefined, val]),
  fromPromise: <E, T>(promise: Promise<T>, catchFn?: (e: any) => E): Pronad<E, T> => {
    return promise.then(
      Right,
      (e: any) => Left(
        catchFn ? catchFn(e) : e
      ),
    ) as Pronad<E, T>
  },
  fromFalsey: <E, T>(val: T | undefined | null | false, ifFalsey?: E): Pronad<E, T> => {
    return val !== undefined && val !== null && val !== false
      ? Right(val)
      : Left(typeof ifFalsey !== 'undefined' ? ifFalsey : null) as Pronad<E, T>;
  },
  fromNull: <E, T>(val: T | undefined | null, ifNull?: E): Pronad<E, T> => {
    return val !== undefined && val !== null
      ? Right(val)
      : Left(typeof ifNull !== 'undefined' ? ifNull : null) as Pronad<E, T>;
  },
  makeCatchGuard: <E>(catchFn: (err: any) => E) => {
    return <T, R>(mappedFn: ((val: T) => Promise<R>) | ((val: T) => Pronad<E, R>)): ((val: T) => Pronad<E, R>) => {
      return (val: T) => mappedFn(val)
        .then((newVal: R | Pronad<E, R>) => isPronad(newVal) ? newVal : createRight(newVal))
        .catch((e: any) => createLeft(catchFn(e))) as unknown as Pronad<E, R>;
      // not necessarily what we want - if we are mapping then this will be a map of a pronad
    };
  },
}

export const monadifyPromises = (cfg: {} = {}) => {
  // todo: Implement convertRejections
  // const useCfg = Object.assign({
  //   convertRejections: false,
  // }, cfg);

  // const mbConvertRej = !useCfg.convertRejections
  //   ? (<T>(p: Promise<T>): Promise<T> => p)
  //   : <T>(p: Promise<T>): Promise<T> => p.catch(P.Left);

  Promise.prototype.anden = Promise.prototype.then;

  Promise.prototype.map = function<E, V, R>(fn: (resVal: V) => R): Pronad<E, R> {
    return this.then((val: PronadInner<E, V>): Pronad<E, R> => {
      if (isPronad(val)) {
        if (val.state === PND_RIGHT) {
          return P.Right(fn(val.right));
        } else {
          return this as Pronad<E, R>;
        }
      } else {
        throw new Error("Cannot map on a Promise that does not contain a Pronad");
        // fallback for raw promise
        // return P.Right(fn(val as unknown as V));
      }
    }) as Pronad<E, R>;
  };

  Promise.prototype.rejMap =
  Promise.prototype.leftMap = function<E, V, F>(fn: (rejVal: E) => F): Pronad<F, V> {
    return this.then((val: PronadInner<E, V>): Pronad<F, V> => {
      if (isPronad(val)) {
        if (val.state === PND_LEFT) {
          return P.Left(fn(val.left));
        } else {
          return this as Pronad<F, V>;
        }
      } else {
        throw new Error("Cannot leftMap on a Promise that does not contain a Pronad");
      }
    }) as Pronad<F, V>;
  };

  Promise.prototype.chain = 
  Promise.prototype.flatMap =
  Promise.prototype.bind = function<E, V, R>(fn: (resVal: V) => Pronad<E, R>): Pronad<E, R> {
    return this.then((val: PronadInner<E, V>): Pronad<E, R> => {
      if (isPronad(val)) {
        if (val.state === PND_RIGHT) {
          return fn(val.right);
        } else {
          return this as Pronad<E, R>;
        }
      } else {
        throw new Error("Cannot bind on a Promise that does not contain a Pronad");
      }
    }) as Pronad<E, R>;
  };
  
  Promise.prototype.rejChain =
  Promise.prototype.rejFlatMap =
  Promise.prototype.rejBind =
  Promise.prototype.leftChain = 
  Promise.prototype.leftFlatMap =
  Promise.prototype.leftBind = function<E, F, V>(fn: (rejVal: E) => Pronad<F, V>): Pronad<F, V> {
    return this.then((val: PronadInner<E, V>): Pronad<F, V> => {
      if (isPronad(val)) {
        if (val.state === PND_LEFT) {
          return fn(val.left);
        } else {
          return this as Pronad<F, V>;
        }
      } else {
        throw new Error("Cannot leftBind on a Promise that does not contain a Pronad");
      }
    }) as Pronad<F, V>;
  };

  Promise.prototype.cata =
  Promise.prototype.fold = function<E, V, R>(
    rejFn: (rejVal: E) => R,
    resFn: (resVal: V) => R,
  ): Promise<R> {
    return this.then((val: PronadInner<E, V>): R => {
      if (isPronad(val)) {
        if (val.state === PND_RIGHT) {
          return resFn(val.right);
        } else if (val.state === PND_LEFT) {
          return rejFn(val.left);
        } else {
          throw new Error("Invalid state - Pronad.state was neither PND_RIGHT nor PND_LEFT");
        }
      } else {
        throw new Error("Cannot cata on a Promise that does not contain a Pronad");
      }
    });
  };

  Promise.prototype.bimap = function<E, V, F, R>(
    rejFn: (rejVal: E) => F,
    resFn: (resVal: V) => R,
  ): Pronad<F, R> {
    return this.then((val: PronadInner<E, V>): Pronad<F, R> => {
      if (isPronad(val)) {
        if (val.state === PND_RIGHT) {
          return P.Right(resFn(val.right));
        } else if (val.state === PND_LEFT) {
          return P.Left(rejFn(val.left));
        } else {
          throw new Error("Invalid state - Pronad.state was neither PND_RIGHT nor PND_LEFT");
        }
      } else {
        throw new Error("Cannot bimap on a Promise that does not contain a Pronad");
      }
    }) as Pronad<F, R>;
  };

  Promise.prototype.tap = function<E, V>(fn: (resVal: V) => void): Pronad<E, V> {
    return this.then((val: PronadInner<E, V>): Pronad<E, V> => {
      if (isPronad(val)) {
        if (val.state === PND_RIGHT) {
          fn(val.right);
          return this as Pronad<E, V>;
        } else {
          return this as Pronad<E, V>;
        }
      } else {
        throw new Error("Cannot tap on a Promise that does not contain a Pronad");
      }
    }) as Pronad<E, V>;
  };

  Promise.prototype.doubleTap = function<E, V>(fn: (rejVal: E | null, resVal: V | null, isRight: boolean) => void): Pronad<E, V> {
    return this.then((val: PronadInner<E, V>): Pronad<E, V> => {
      if (isPronad(val)) {
        if (val.state === PND_RIGHT) {
          fn(null, val.right, true);
        } else if (val.state === PND_LEFT) {
          fn(val.left, null, false);
        } else {
          throw new Error("Invalid state - Pronad.state was neither PND_RIGHT nor PND_LEFT");
        }
        return this as Pronad<E, V>;
      } else {
        throw new Error("Cannot tap on a Promise that does not contain a Pronad");
      }
    }) as Pronad<E, V>;
  };

  Promise.prototype.getOrElse = function<E, V>(fn: (rejVal: E) => V, catchFn?: (err: any) => V): Promise<V> {
    const settledPromise = this.then((val: PronadInner<E, V>): V => {
      if (isPronad(val)) {
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

  Promise.prototype.getOr = function<E, V>(fallback: V, catchValOrFn?: V | ((err: any) => V), execFn: boolean = false): Promise<V> {
    const settledPromise = this.then((val: PronadInner<E, V>): V => {
      if (isPronad(val)) {
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
