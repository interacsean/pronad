"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
index_1.monadifyPromises();
function createPromise(resOrRej, val) {
    return new Promise(function (res, rej) {
        setTimeout(function () { return (resOrRej ? res : rej)(val); }, 50);
    });
}
describe('pronad', function () {
    describe('map method', function () {
        it('should map on resolved promises', function (done) {
            var result = createPromise(true, 5)
                .map(function (resVal) { return resVal * 2; });
            result.then(function () {
                expect(result).resolves.toBe(10);
                done();
            });
        });
        it('should skip rejected promises', function (done) {
            var result = createPromise(false, 5)
                .map(function (resVal) { return resVal * 2; });
            result.catch(function () {
                expect(result).rejects.toBe(5);
                done();
            });
        });
    });
    describe('rejMap method', function () {
        it('should map on rejected promises', function (done) {
            var result = createPromise(false, 5)
                .rejMap(function (rejVal) { return rejVal * 2; });
            result.catch(function () {
                expect(result).rejects.toBe(10);
                done();
            });
        });
        it('should skip resolved promises', function (done) {
            var result = createPromise(true, 5)
                .rejMap(function (rejVal) { return rejVal * 2; });
            result.then(function () {
                expect(result).resolves.toBe(5);
                done();
            });
        });
    });
    describe('bind method', function () {
        it('should bind on resolved promises', function (done) {
            var result = createPromise(true, 5)
                .bind(function (resVal) { return Promise.resolve(resVal * 2); });
            result.then(function () {
                expect(result).resolves.toBe(10);
                done();
            });
        });
        it('should skip rejected promises', function (done) {
            var result = createPromise(false, 5)
                .bind(function (resVal) { return Promise.resolve(resVal * 2); });
            result.catch(function () {
                expect(result).rejects.toBe(5);
                done();
            });
        });
        it('should return rejected promise', function (done) {
            var result = createPromise(true, 5)
                .bind(function (resVal) { return Promise.reject(resVal * 2); });
            result.catch(function () {
                expect(result).rejects.toBe(10);
                done();
            });
        });
    });
    describe('rej bind method', function () {
        it('should bind on rejected promises', function (done) {
            var result = createPromise(false, 5)
                .rejFlatMap(function (resVal) { return Promise.resolve(resVal * 2); });
            result.then(function () {
                expect(result).resolves.toBe(10);
                done();
            });
        });
        it('should skip resolved promises', function (done) {
            var result = createPromise(true, 5)
                .rejFlatMap(function (resVal) { return Promise.resolve(resVal * 2); });
            result.then(function () {
                expect(result).resolves.toBe(5);
                done();
            });
        });
        it('should return rejected promise', function (done) {
            var result = createPromise(false, 5)
                .rejFlatMap(function (resVal) { return Promise.reject(resVal * 2); });
            result.catch(function () {
                expect(result).rejects.toBe(10);
                done();
            });
        });
    });
    describe('cata method', function () {
        it('should cata on resolved side', function (done) {
            var result = createPromise(true, 5)
                .cata(function (rejVal) { return rejVal * 2; }, function (resVal) { return resVal * 3; });
            result.then(function () {
                expect(result).resolves.toBe(15);
                done();
            });
        });
        it('should cata on rejected side', function (done) {
            var result = createPromise(false, 5)
                .cata(function (rejVal) { return rejVal * 2; }, function (resVal) { return resVal * 3; });
            result.then(function () {
                expect(result).resolves.toBe(10);
                done();
            });
        });
    });
    describe('bimap method', function () {
        it('should bimap on resolved side', function (done) {
            var result = createPromise(true, 5)
                .bimap(function (rejVal) { return rejVal * 2; }, function (resVal) { return resVal * 3; });
            result.then(function () {
                expect(result).resolves.toBe(15);
                done();
            });
        });
        it('should bimap on rejected side', function (done) {
            var result = createPromise(false, 5)
                .bimap(function (rejVal) { return rejVal * 2; }, function (resVal) { return resVal * 3; });
            result.catch(function () {
                expect(result).rejects.toBe(10);
                done();
            });
        });
    });
    describe('recover method', function () {
        it('should recover on rejected side', function (done) {
            var result = createPromise(false, 5)
                .recover(function (rj) { return typeof rj === 'number' ? rj * 2 : 0; });
            result.then(function () {
                expect(result).resolves.toBe(10);
                done();
            });
        });
        it('should pass over recover on rejesolved side', function (done) {
            var result = createPromise(true, 5)
                .recover(function (rj) { return typeof rj === 'number' ? rj * 2 : 0; });
            result.then(function () {
                expect(result).resolves.toBe(5);
                done();
            });
        });
    });
    describe('tap method', function () {
        it('should call on resolved and return unaffected', function (done) {
            var fn = jest.fn();
            var result = createPromise(true, 5)
                .tap(fn);
            result.then(function () {
                expect(result).resolves.toBe(5);
                expect(fn).toHaveBeenCalledWith(5);
                done();
            });
        });
        it('should skip rejected and return unaffected', function (done) {
            var fn = jest.fn();
            var result = createPromise(false, 5)
                .tap(fn);
            result.catch(function () {
                expect(result).rejects.toBe(5);
                expect(fn).not.toHaveBeenCalled();
                done();
            });
        });
    });
    describe('doubleTap method', function () {
        it('should call on resolved and return unaffected', function (done) {
            var fn = jest.fn();
            var result = createPromise(true, 5)
                .doubleTap(fn);
            result.then(function () {
                expect(result).resolves.toBe(5);
                expect(fn).toHaveBeenCalledWith(null, 5, true);
                done();
            });
        });
        it('should skip rejected and return unaffected', function (done) {
            var fn = jest.fn();
            var result = createPromise(false, 5)
                .doubleTap(fn);
            result.catch(function () {
                expect(result).rejects.toBe(5);
                expect(fn).toHaveBeenCalledWith(5, null, false);
                done();
            });
        });
    });
    describe('fromFalsey factory', function () {
        it('should create resolved promise on truthy', function (done) {
            var result = index_1.Pronad.fromFalsey(5, 0);
            result.then(function () {
                expect(result).resolves.toBe(5);
                done();
            });
        });
        it('should create rejected promise on false', function (done) {
            var result = index_1.Pronad.fromFalsey(false, 0);
            result.catch(function () {
                expect(result).rejects.toBe(0);
                done();
            });
        });
        it('should create rejected promise on null', function (done) {
            var result = index_1.Pronad.fromFalsey(null, 0);
            result.catch(function () {
                expect(result).rejects.toBe(0);
                done();
            });
        });
        it('should create rejected promise on null', function (done) {
            var result = index_1.Pronad.fromFalsey(undefined, 0);
            result.catch(function () {
                expect(result).rejects.toBe(0);
                done();
            });
        });
        it('should default to null', function (done) {
            var result = index_1.Pronad.fromFalsey(undefined);
            result.catch(function () {
                expect(result).rejects.toBe(null);
                done();
            });
        });
    });
    describe('fromNull factory', function () {
        it('should create resolved promise on truthy', function (done) {
            var result = index_1.Pronad.fromNull(5, 0);
            result.then(function () {
                expect(result).resolves.toBe(5);
                done();
            });
        });
        it('should create resolved promise on false', function (done) {
            var result = index_1.Pronad.fromNull(false, 0);
            result.then(function () {
                expect(result).resolves.toBe(false);
                done();
            });
        });
        it('should create rejected promise on null', function (done) {
            var result = index_1.Pronad.fromNull(null, 0);
            result.catch(function () {
                expect(result).rejects.toBe(0);
                done();
            });
        });
        it('should create rejected promise on null', function (done) {
            var result = index_1.Pronad.fromNull(undefined, 0);
            result.catch(function () {
                expect(result).rejects.toBe(0);
                done();
            });
        });
        it('should default to null', function (done) {
            var result = index_1.Pronad.fromNull(undefined);
            result.catch(function () {
                expect(result).rejects.toBe(null);
                done();
            });
        });
    });
});
//# sourceMappingURL=pronad.spec.js.map