"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pnd_1 = require("./Pnd");
exports.PND_LEFT = Pnd_1.PND_LEFT;
exports.PND_RIGHT = Pnd_1.PND_RIGHT;
exports.Pronad = {
    Left: function (err) {
        var pndVal = {
            state: Pnd_1.PND_LEFT,
            left: err,
            right: undefined,
        };
        return Promise.resolve(pndVal);
    },
    Right: function (val) {
        var pndVal = {
            state: Pnd_1.PND_RIGHT,
            left: undefined,
            right: val,
        };
        return Promise.resolve(pndVal);
    },
};
exports.monadifyPromises = function () {
    Promise.prototype.map = function (fn) {
        return this.then(function (val) {
            if (typeof val === 'object' && val.state === Pnd_1.PND_LEFT) {
                return exports.Pronad.Left(val.left);
            }
            else if (typeof val === 'object' && val.state === Pnd_1.PND_RIGHT && val.right !== undefined) {
                return exports.Pronad.Right(fn(val.right));
            }
            else {
                // fallback for raw promise
                return exports.Pronad.Right(fn(val));
            }
        });
    };
    // Promise.prototype.rejMap =
    // Promise.prototype.leftMap = function<E, Pr, F, R>(fn: (rejVal: E) => F): Pnd<F, R> {
    //   return this.then((val: Pr) => {
    //     if (Array.isArray(val) && val[0] === PND_RIGHT) {
    //       return [
    //         PND_RIGHT,
    //         undefined,
    //         val[1],
    //       ] as [symbol, undefined, R]
    //     } else {
    //       return [
    //         PND_LEFT,
    //         fn(Array.isArray(val) && val[0] === PND_LEFT ? val[1] : val),
    //         undefined, 
    //       ] as [symbol, F, undefined];
    //     }
    //   });
    // };
    // Promise.prototype.chain = 
    // Promise.prototype.flatMap =
    // Promise.prototype.bind = function<E, T, R>(fn: (resVal: T) => Pnd<E, R>): Pnd<E, R> {
    //   return this.then(fn);
    // };
    // Promise.prototype.rejChain =
    // Promise.prototype.rejFlatMap =
    // Promise.prototype.rejBind =
    // Promise.prototype.leftChain = 
    // Promise.prototype.leftFlatMap =
    // Promise.prototype.leftBind = function<E, T, F>(fn: (rejVal: E | any) => Pnd<F, T>): Pnd<F, T> {
    //   return this.catch((e: E | any): Pnd<F, T> => fn(e));
    // };
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
};
//# sourceMappingURL=index.js.map