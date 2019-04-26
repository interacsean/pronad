"use strict";
/**
 * only thing is, awaiting something that hasn't been 'settled', will use then
 * type sig which goes to T, not Pronad<E, T>, which is actually innacurate
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Pronad_1 = require("./Pronad");
exports.PND_LEFT = Pronad_1.PND_LEFT;
exports.PND_RIGHT = Pronad_1.PND_RIGHT;
var isFunction = function (mbFn) { return typeof mbFn === 'function'; };
var isObject = function (mbObj) { return typeof mbObj === 'object' && mbObj !== null; };
var isThennable = function (mbProm) {
    return isObject(mbProm) && mbProm.then !== undefined && typeof mbProm.then === 'function';
};
var isPronad = function (mbPronad) {
    return isObject(mbPronad) && mbPronad._pndId === Pronad_1.PND_ID && (mbPronad.state === Pronad_1.PND_LEFT || mbPronad.state === Pronad_1.PND_RIGHT);
};
var createLeft = function (leftVal) { return ({
    _pndId: Pronad_1.PND_ID,
    state: Pronad_1.PND_LEFT,
    left: leftVal,
    right: undefined,
}); };
var createRight = function (rightVal) { return ({
    _pndId: Pronad_1.PND_ID,
    state: Pronad_1.PND_RIGHT,
    left: undefined,
    right: rightVal,
}); };
var Left = function (err) {
    var defProm = isThennable(err) ? err : Promise.resolve(err);
    return defProm.then(function (leftVal) { return ({
        _pndId: Pronad_1.PND_ID,
        state: Pronad_1.PND_LEFT,
        left: leftVal,
        right: undefined,
    }); });
};
var Right = function (val) {
    var defProm = isThennable(val) ? val : Promise.resolve(val);
    return defProm.then(function (rightVal) { return ({
        _pndId: Pronad_1.PND_ID,
        state: Pronad_1.PND_RIGHT,
        left: undefined,
        right: rightVal,
    }); });
};
exports.P = {
    Left: Left,
    Right: Right,
    // unit: <T>(val: T): Pronad<never, T> => Promise.resolve([PND_RIGHT, undefined, val]),
    fromPromise: function (promise, catchFn) {
        return promise.then(Right, function (e) { return Left(catchFn ? catchFn(e) : e); });
    },
    fromFalsey: function (val, ifFalsey) {
        return val !== undefined && val !== null && val !== false
            ? Right(val)
            : Left(typeof ifFalsey !== 'undefined' ? ifFalsey : null);
    },
    fromNull: function (val, ifNull) {
        return val !== undefined && val !== null
            ? Right(val)
            : Left(typeof ifNull !== 'undefined' ? ifNull : null);
    },
    makeCatchGuard: function (catchFn) {
        return function (mappedFn) {
            return function (val) { return mappedFn(val)
                .then(function (newVal) { return isPronad(newVal) ? newVal : createRight(newVal); })
                .catch(function (e) { return createLeft(catchFn(e)); }); };
            // not necessarily what we want - if we are mapping then this will be a map of a pronad
        };
    },
};
exports.monadifyPromises = function (cfg) {
    // todo: Implement convertRejections
    // const useCfg = Object.assign({
    //   convertRejections: false,
    // }, cfg);
    if (cfg === void 0) { cfg = {}; }
    // const mbConvertRej = !useCfg.convertRejections
    //   ? (<T>(p: Promise<T>): Promise<T> => p)
    //   : <T>(p: Promise<T>): Promise<T> => p.catch(P.Left);
    Promise.prototype.anden = Promise.prototype.then;
    Promise.prototype.map = function (fn) {
        var _this = this;
        return this.then(function (val) {
            if (isPronad(val)) {
                if (val.state === Pronad_1.PND_RIGHT) {
                    return exports.P.Right(fn(val.right));
                }
                else {
                    return _this;
                }
            }
            else {
                throw new Error("Cannot map on a Promise that does not contain a Pronad");
                // fallback for raw promise
                // return P.Right(fn(val as unknown as V));
            }
        });
    };
    Promise.prototype.rejMap =
        Promise.prototype.leftMap = function (fn) {
            var _this = this;
            return this.then(function (val) {
                if (isPronad(val)) {
                    if (val.state === Pronad_1.PND_LEFT) {
                        return exports.P.Left(fn(val.left));
                    }
                    else {
                        return _this;
                    }
                }
                else {
                    throw new Error("Cannot leftMap on a Promise that does not contain a Pronad");
                }
            });
        };
    Promise.prototype.chain =
        Promise.prototype.flatMap =
            Promise.prototype.bind = function (fn) {
                var _this = this;
                return this.then(function (val) {
                    if (isPronad(val)) {
                        if (val.state === Pronad_1.PND_RIGHT) {
                            return fn(val.right);
                        }
                        else {
                            return _this;
                        }
                    }
                    else {
                        throw new Error("Cannot bind on a Promise that does not contain a Pronad");
                    }
                });
            };
    Promise.prototype.rejChain =
        Promise.prototype.rejFlatMap =
            Promise.prototype.rejBind =
                Promise.prototype.leftChain =
                    Promise.prototype.leftFlatMap =
                        Promise.prototype.leftBind = function (fn) {
                            var _this = this;
                            return this.then(function (val) {
                                if (isPronad(val)) {
                                    if (val.state === Pronad_1.PND_LEFT) {
                                        return fn(val.left);
                                    }
                                    else {
                                        return _this;
                                    }
                                }
                                else {
                                    throw new Error("Cannot leftBind on a Promise that does not contain a Pronad");
                                }
                            });
                        };
    Promise.prototype.cata =
        Promise.prototype.fold = function (rejFn, resFn) {
            return this.then(function (val) {
                if (isPronad(val)) {
                    if (val.state === Pronad_1.PND_RIGHT) {
                        return resFn(val.right);
                    }
                    else if (val.state === Pronad_1.PND_LEFT) {
                        return rejFn(val.left);
                    }
                    else {
                        throw new Error("Invalid state - Pronad.state was neither PND_RIGHT nor PND_LEFT");
                    }
                }
                else {
                    throw new Error("Cannot cata on a Promise that does not contain a Pronad");
                }
            });
        };
    Promise.prototype.bimap = function (rejFn, resFn) {
        return this.then(function (val) {
            if (isPronad(val)) {
                if (val.state === Pronad_1.PND_RIGHT) {
                    return exports.P.Right(resFn(val.right));
                }
                else if (val.state === Pronad_1.PND_LEFT) {
                    return exports.P.Left(rejFn(val.left));
                }
                else {
                    throw new Error("Invalid state - Pronad.state was neither PND_RIGHT nor PND_LEFT");
                }
            }
            else {
                throw new Error("Cannot bimap on a Promise that does not contain a Pronad");
            }
        });
    };
    Promise.prototype.tap = function (fn) {
        var _this = this;
        return this.then(function (val) {
            if (isPronad(val)) {
                if (val.state === Pronad_1.PND_RIGHT) {
                    fn(val.right);
                    return _this;
                }
                else {
                    return _this;
                }
            }
            else {
                throw new Error("Cannot tap on a Promise that does not contain a Pronad");
            }
        });
    };
    Promise.prototype.doubleTap = function (fn) {
        var _this = this;
        return this.then(function (val) {
            if (isPronad(val)) {
                if (val.state === Pronad_1.PND_RIGHT) {
                    fn(null, val.right, true);
                }
                else if (val.state === Pronad_1.PND_LEFT) {
                    fn(val.left, null, false);
                }
                else {
                    throw new Error("Invalid state - Pronad.state was neither PND_RIGHT nor PND_LEFT");
                }
                return _this;
            }
            else {
                throw new Error("Cannot tap on a Promise that does not contain a Pronad");
            }
        });
    };
    Promise.prototype.getOrElse = function (fn, catchFn) {
        var settledPromise = this.then(function (val) {
            if (isPronad(val)) {
                if (val.state === Pronad_1.PND_RIGHT) {
                    return val.right;
                }
                else if (val.state === Pronad_1.PND_LEFT) {
                    return fn(val.left);
                }
                else {
                    throw new Error("Invalid state - Pronad.state was neither PND_RIGHT nor PND_LEFT");
                }
            }
            else {
                throw new Error("Cannot getOrElse on a Promise that does not contain a Pronad");
            }
        });
        return (typeof catchFn !== 'undefined')
            ? settledPromise.catch(catchFn)
            : settledPromise;
    };
    Promise.prototype.getOr = function (fallback, catchValOrFn, execFn) {
        if (execFn === void 0) { execFn = false; }
        var settledPromise = this.then(function (val) {
            if (isPronad(val)) {
                if (val.state === Pronad_1.PND_RIGHT) {
                    return val.right;
                }
                else if (val.state === Pronad_1.PND_LEFT) {
                    return fallback;
                }
                else {
                    throw new Error("Invalid state - Pronad.state was neither PND_RIGHT nor PND_LEFT");
                }
            }
            else {
                throw new Error("Cannot getOrElse on a Promise that does not contain a Pronad");
            }
        });
        return (typeof catchValOrFn !== 'undefined')
            ? settledPromise.catch(function (err) {
                return (execFn && isFunction(catchValOrFn))
                    ? catchValOrFn(err)
                    : catchValOrFn;
            })
            : settledPromise;
    };
};
//# sourceMappingURL=index.js.map