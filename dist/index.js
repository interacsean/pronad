"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pronad = {
    unit: function (val) { return Promise.resolve(val); },
    fromFalsey: function (val, ifFalsey) {
        return val !== undefined && val !== null && val !== false
            ? Promise.resolve(val)
            : Promise.reject(typeof ifFalsey !== 'undefined' ? ifFalsey : null);
    },
    fromNull: function (val, ifNull) {
        return val !== undefined && val !== null
            ? Promise.resolve(val)
            : Promise.reject(typeof ifNull !== 'undefined' ? ifNull : null);
    }
};
exports.monadifyPromises = function () {
    Promise.prototype.map = function (fn) {
        return this.then(fn);
    };
    Promise.prototype.rejMap =
        Promise.prototype.leftMap = function (fn) {
            return this.catch(function (e) { return Promise.reject(fn(e)); });
        };
    Promise.prototype.chain =
        Promise.prototype.flatMap =
            Promise.prototype.bind = function (fn) {
                return this.then(fn);
            };
    Promise.prototype.rejChain =
        Promise.prototype.rejFlatMap =
            Promise.prototype.rejBind =
                Promise.prototype.leftChain =
                    Promise.prototype.leftFlatMap =
                        Promise.prototype.leftBind = function (fn) {
                            return this.catch(function (e) { return fn(e); });
                        };
    Promise.prototype.cata = function (rejFn, resFn) {
        return this.then(resFn, rejFn);
    };
    Promise.prototype.tap = function (fn) {
        return this.then(function (val) {
            fn(val);
            return val;
        });
    };
    Promise.prototype.doubleTap = function (fn) {
        return this.then(function (resVal) {
            fn(null, resVal, true);
            return resVal;
        }, function (rejVal) {
            fn(rejVal, null, false);
            return Promise.reject(rejVal);
        });
    };
    Promise.prototype.bimap = function (rejFn, resFn) {
        return this.then(resFn, function (e) { return Promise.reject(rejFn(e)); });
    };
    Promise.prototype.recover = function (fn) {
        return this.catch(fn);
    };
};
//# sourceMappingURL=index.js.map