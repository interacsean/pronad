"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * todo:
 *  - Update README propers
 *  - errMap / ifErr
 *  - fromPromise
 *  - compat with left() [option]
 *  - chain – class that aliases all functions to
 *  - include config option to change mode from L/R to E | {}
 *  - fork (like cata but must returns void)
 *  - cata / recover (takes (fn: (err: E) => R) and unwraps the val)
 *     - the function for a val would be optional - if omitted, is `id`
 *     - this may make overloads complex as 2nd arg could be function or monax
 *  - test for getLeft
 *  - + tap/dblTap
 */
var curry = function (fn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return (fn.length <= args.length)
        ? fn.apply(void 0, args) : function () {
        var more = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            more[_i] = arguments[_i];
        }
        return curry.apply(void 0, [fn].concat(args, more));
    };
};
/*************************
 *** Monax constructors **
 ************************/
function right(v) {
    return [true, undefined, v];
}
exports.right = right;
exports.val = right;
function isRight(m) {
    return m[0];
}
exports.isRight = isRight;
exports.isVal = isRight;
exports.getRight = function (r) { return r[2]; };
exports.getVal = exports.getRight;
function left(e) {
    return [false, e, undefined];
}
exports.left = left;
exports.err = left;
function isLeft(m) {
    return !m[0];
}
exports.isLeft = isLeft;
exports.isErr = isLeft;
exports.getLeft = function (l) { return l[1]; };
exports.getErr = exports.getLeft;
function fromFalsey(val, ifFalsey) {
    return val !== undefined && val !== null && val !== false
        ? right(val)
        : left(ifFalsey);
}
exports.fromFalsey = fromFalsey;
function fromNull(val, ifNully) {
    return val !== undefined && val !== null
        ? right(val)
        : left(ifNully);
}
exports.fromNull = fromNull;
/**************************************
 *** Monax transformation functions  **
 *************************************/
/**
 * FlatMap
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function _flatMap(fn, m) {
    return isRight(m) ? fn(m[2]) : m;
}
function flatMap(fn, m) {
    return curry(_flatMap).apply(this, arguments);
}
exports.flatMap = flatMap;
exports.ifVal = flatMap;
exports.bind = flatMap;
/**
 * Map
 *
 * @param fn Function to map if a Right/Val
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function _map(fn, m) {
    return isRight(m) ? right(fn(m[2])) : m;
}
function map(fn, m) {
    return curry(_map).apply(this, arguments);
}
exports.map = map;
exports.withVal = map;
/**
 * awaitMap
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */
function _awaitMap(fn, m) {
    return isRight(m)
        ? fn(m[2]).then(right)
        : Promise.resolve(m);
}
function awaitMap(fn, m) {
    return curry(_awaitMap).apply(this, arguments);
}
exports.awaitMap = awaitMap;
exports.withAwaitedVal = awaitMap;
/**
 * LeftMap
 *
 * @param fn Function to map if a Left/Err
 * @param m Monad to evaluate for execution
 * @return Monad
 */
function _leftMap(fn, m) {
    return isLeft(m) ? left(fn(m[1])) : m;
}
function leftMap(fn, m) {
    return curry(_leftMap).apply(this, arguments);
}
exports.leftMap = leftMap;
exports.withErr = leftMap;
exports.errMap = leftMap;
/**
 * AwaitLeftMap
 * @param fn Promise-returning-function to map if a Right/Val
 * @param m  Monad to evaluate for execution
 * @return Promise<Monad>
 */
function _awaitLeftMap(fn, m) {
    return isLeft(m)
        ? fn(m[1]).then(left)
        : Promise.resolve(m);
}
function awaitLeftMap(fn, m) {
    return curry(_awaitLeftMap).apply(this, arguments);
}
exports.awaitLeftMap = awaitLeftMap;
exports.withAwaitedErr = awaitLeftMap;
exports.awaitErrMap = awaitLeftMap;
// interface PronadConstructor {
//   unit<T>(val: T): Pnd<never, T>,
//   fromFalsey<E, T>(val: T | undefined | null | false, ifFalsey?: E): Pnd<E, T>,
//   fromNull<E, T>(val: T | undefined | null, ifNull?: E): Pnd<E, T>,
// }
// export const Pronad: PronadConstructor = {
//   unit: <T>(val: T): Pnd<any, T> => Promise.resolve(val),
//   fromFalsey: <E, T>(val: T | undefined | null | false, ifFalsey?: E): Pnd<E, T> => {
//     return val !== undefined && val !== null && val !== false
//       ? Promise.resolve(val)
//       : Promise.reject(typeof ifFalsey !== 'undefined' ? ifFalsey : null);
//   },
//   fromNull: <E, T>(val: T | undefined | null, ifNull?: E): Pnd<E, T> => {
//     return val !== undefined && val !== null
//       ? Promise.resolve(val)
//       : Promise.reject(typeof ifNull !== 'undefined' ? ifNull : null);
//   }
// }
// export const monadifyPromises = () => {
//   Promise.prototype.map = function<E, T, R>(fn: (resVal: T) => R): Pnd<E, R> {
//     return this.then(fn);
//   };
//   Promise.prototype.rejMap =
//   Promise.prototype.leftMap = function<E, T, F>(fn: (rejVal: E | any) => F): Pnd<F, T> {
//     return this.catch((e: E | any): Pnd<F, never> => Promise.reject(fn(e)));
//   };
//   Promise.prototype.chain =
//   Promise.prototype.flatMap =
//   Promise.prototype.bind = function<E, T, R>(fn: (resVal: T) => Pnd<E, R>): Pnd<E, R> {
//     return this.then(fn);
//   };
//   Promise.prototype.rejChain =
//   Promise.prototype.rejFlatMap =
//   Promise.prototype.rejBind =
//   Promise.prototype.leftChain =
//   Promise.prototype.leftFlatMap =
//   Promise.prototype.leftBind = function<E, T, F>(fn: (rejVal: E | any) => Pnd<F, T>): Pnd<F, T> {
//     return this.catch((e: E | any): Pnd<F, T> => fn(e));
//   };
//   Promise.prototype.cata = function<T, E, R>(
//     rejFn: (rejVal: E | any) => R,
//     resFn: (resVal: T) => R,
//   ): Pnd<never, R> {
//     return this.then(resFn, rejFn);
//   };
//   Promise.prototype.tap = function<E, T>(fn: (val: T) => void): Pnd<E, T> {
//     return this.then((val: T): T => {
//       fn(val);
//       return val;
//     });
//   };
//   Promise.prototype.doubleTap = function<E, T>(fn: (rejVal: E | any | null, resVal: T | null, isResolved?: boolean) => void): Pnd<E, T> {
//     return this.then(
//       (resVal: T): T => {
//         fn(null, resVal, true);
//         return resVal;
//       },
//       (rejVal: E): Pnd<E, never> => {
//         fn(rejVal, null, false);
//         return Promise.reject(rejVal);
//       },
//     );
//   };
//   Promise.prototype.bimap = function<T, E, F, R>(
//     rejFn: (rejVal: E | any) => F,
//     resFn: (resVal: T) => R,
//   ): Pnd<F, R> {
//     return this.then(resFn, (e: E | any): Pnd<F, never> => Promise.reject(rejFn(e)));
//   };
//   Promise.prototype.recover = function<E, T>(fn: (rejVal: E | any) => T): Promise<T> {
//     return this.catch(fn);
//   };
// }
//# sourceMappingURL=index.js.map