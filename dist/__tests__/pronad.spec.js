"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Mx = __importStar(require("../index"));
function createPromise(resOrRej, val) {
    return new Promise(function (res, rej) {
        setTimeout(function () { return (resOrRej ? res : rej)(val); }, 50);
    });
}
describe('monax', function () {
    var fixture = {};
    describe('right', function () {
        it('should be recognised by isRight', function () {
            var result = Mx.right(fixture);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.isLeft(result)).toBe(false);
        });
        it('should be not recognised by isLeft', function () {
            var result = Mx.right(fixture);
            expect(Mx.isLeft(result)).toBe(false);
            expect(Mx.isRight(result)).toBe(true);
        });
        it('has aliases', function () {
            expect(Mx.val).toBe(Mx.right);
            expect(Mx.isVal).toBe(Mx.isRight);
        });
    });
    describe('left', function () {
        it('should be recognised by isLeft', function () {
            var result = Mx.left(fixture);
            expect(Mx.isLeft(result)).toBe(true);
            expect(Mx.isRight(result)).toBe(false);
        });
        it('should be not recognised by isRight', function () {
            var result = Mx.left(fixture);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.isLeft(result)).toBe(true);
        });
        it('has aliases', function () {
            expect(Mx.err).toBe(Mx.left);
            expect(Mx.isErr).toBe(Mx.isLeft);
        });
    });
    describe('fromFalsey factory', function () {
        it('should create right on truthy', function () {
            var result = Mx.fromFalsey(5, 0);
            expect(Mx.isRight(result)).toBe(true);
        });
        it('should create left on false', function () {
            var result = Mx.fromFalsey(false, 0);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should create left on null', function () {
            var result = Mx.fromFalsey(null, 0);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should create left on undefined', function () {
            var result = Mx.fromFalsey(undefined, 0);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
    });
    describe('fromNull factory', function () {
        it('should create right on truthy', function () {
            var result = Mx.fromNull(fixture, 0);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(fixture);
        });
        it('should create right on false', function () {
            var result = Mx.fromNull(false, 0);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getVal(result)).toBe(false);
        });
        it('should create left on null', function () {
            var result = Mx.fromNull(null, 0);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getErr(result)).toBe(0);
        });
        it('should create left on undefined', function () {
            var result = Mx.fromNull(undefined, 0);
            expect(Mx.isRight(result)).toBe(false);
        });
    });
    describe('map', function () {
        it('should map a Right', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var right = Mx.right(valFix);
            var result = Mx.map(fn, right);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getRight(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Left', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var left = Mx.left(valFix);
            var result = Mx.map(fn, left);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getRight(result)).toBeUndefined();
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var right = Mx.right(valFix);
            var exec = Mx.map(fn);
            var result = exec(right);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getRight(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('has aliases', function () {
            expect(Mx.withVal).toBe(Mx.map);
        });
    });
    describe('awaitMap', function () {
        it('should wait for promises value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(fixture); });
            var valFix = {};
            var right = Mx.right(valFix);
            var exec = Mx.awaitMap(fn);
            var prom = exec(right);
            prom.then(function (result) {
                expect(Mx.isRight(result)).toBe(true);
                expect(Mx.getRight(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            });
        });
        it('has aliases', function () {
            // expect(Mx.map).toBe(Mx.awaitMap);
            expect(Mx.withAwaitedVal).toBe(Mx.awaitMap);
        });
    });
    describe('leftMap', function () {
        it('should leftMap a Left', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var left = Mx.left(valFix);
            var result = Mx.leftMap(fn, left);
            expect(Mx.isLeft(result)).toBe(true);
            expect(Mx.getLeft(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Right', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var right = Mx.right(valFix);
            var result = Mx.leftMap(fn, right);
            expect(Mx.isLeft(result)).toBe(false);
            expect(Mx.getLeft(result)).toBeUndefined();
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var left = Mx.left(valFix);
            var exec = Mx.leftMap(fn);
            var result = exec(left);
            expect(Mx.isLeft(result)).toBe(true);
            expect(Mx.getLeft(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('has aliases', function () {
            expect(Mx.errMap).toBe(Mx.leftMap);
            expect(Mx.withErr).toBe(Mx.leftMap);
        });
    });
    describe('awaitLeftMap', function () {
        it('should wait for promises value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(fixture); });
            var valFix = {};
            var left = Mx.left(valFix);
            var exec = Mx.awaitLeftMap(fn);
            var prom = exec(left);
            prom.then(function (result) {
                expect(Mx.isLeft(result)).toBe(true);
                expect(Mx.getLeft(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            });
        });
        it('has aliases', function () {
            expect(Mx.withAwaitedErr).toBe(Mx.awaitLeftMap);
            expect(Mx.awaitErrMap).toBe(Mx.awaitLeftMap);
        });
    });
    describe('flatMap', function () {
        it('should flatMap a Right', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.right(fixture); });
            var valFix = {};
            var right = Mx.right(valFix);
            var result = Mx.flatMap(fn, right);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getRight(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should flatMap a Right and return left', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.left(fixture); });
            var valFix = {};
            var right = Mx.right(valFix);
            var result = Mx.flatMap(fn, right);
            expect(Mx.isLeft(result)).toBe(true);
            if (Mx.isLeft(result))
                expect(Mx.getLeft(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Left', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.right(fixture); });
            var valFix = {};
            var right = Mx.left(valFix);
            var result = Mx.flatMap(fn, right);
            expect(Mx.isRight(result)).toBe(false);
            expect(Mx.getRight(result)).toBeUndefined();
            expect(fn).not.toHaveBeenCalled();
        });
        it('should be curried', function () {
            var fn = jest.fn().mockImplementation(function () { return Mx.right(fixture); });
            var valFix = {};
            var right = Mx.right(valFix);
            var exec = Mx.flatMap(fn);
            var result = exec(right);
            expect(Mx.isRight(result)).toBe(true);
            expect(Mx.getRight(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should work for promise return value', function (done) {
            var fn = jest.fn().mockImplementation(function () { return Promise.resolve(Mx.right(fixture)); });
            var valFix = {};
            var right = Mx.right(valFix);
            var exec = Mx.flatMap(fn);
            var prom = exec(right);
            prom.then(function (result) {
                expect(Mx.isRight(result)).toBe(true);
                expect(Mx.getRight(result)).toBe(fixture);
                expect(fn).toHaveBeenCalledWith(valFix);
                done();
            });
        });
        it('has aliases', function () {
            expect(Mx.bind).toBe(Mx.flatMap);
            expect(Mx.ifVal).toBe(Mx.flatMap);
        });
    });
    // describe('rejMap method', () => {
    //   it('should map on rejected promises', (done) => {
    //     const result = createPromise(false, 5)
    //       .rejMap((rejVal: number) => rejVal * 2);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(10);
    //       done();
    //     })
    //   });
    //   it('should skip resolved promises', (done) => {
    //     const result = createPromise(true, 5)
    //       .rejMap((rejVal: number) => rejVal * 2);
    //     result.then(() => {
    //       expect(result).resolves.toBe(5);
    //       done();
    //     });
    //   });
    // });
    // describe('bind method', () => {
    //   it('should bind on resolved promises', (done) => {
    //     const result = createPromise(true, 5)
    //       .bind((resVal: number) => Promise.resolve(resVal * 2));
    //     result.then(() => {
    //       expect(result).resolves.toBe(10);
    //       done();
    //     });
    //   });
    //   it('should skip rejected promises', (done) => {
    //     const result = createPromise(false, 5)
    //       .bind((resVal: number) => Promise.resolve(resVal * 2));
    //     result.catch(() => {
    //       expect(result).rejects.toBe(5);
    //       done();
    //     });
    //   });
    //   it('should return rejected promise', (done) => {
    //     const result = createPromise(true, 5)
    //       .bind((resVal: number) => Promise.reject(resVal * 2));
    //     result.catch(() => {
    //       expect(result).rejects.toBe(10);
    //       done();
    //     });
    //   });
    // });
    // describe('rej bind method', () => {
    //   it('should bind on rejected promises', (done) => {
    //     const result = createPromise(false, 5)
    //       .rejFlatMap((resVal: number) => Promise.resolve(resVal * 2));
    //     result.then(() => {
    //       expect(result).resolves.toBe(10);
    //       done();
    //     });
    //   });
    //   it('should skip resolved promises', (done) => {
    //     const result = createPromise(true, 5)
    //       .rejFlatMap((resVal: number) => Promise.resolve(resVal * 2));
    //     result.then(() => {
    //       expect(result).resolves.toBe(5);
    //       done();
    //     });
    //   });
    //   it('should return rejected promise', (done) => {
    //     const result = createPromise(false, 5)
    //       .rejFlatMap((resVal: number) => Promise.reject(resVal * 2));
    //     result.catch(() => {
    //       expect(result).rejects.toBe(10);
    //       done();
    //     });
    //   });
    // });
    // describe('cata method', () => {
    //   it('should cata on resolved side', (done) => {
    //     const result = createPromise(true, 5)
    //       .cata(
    //         (rejVal: number) => rejVal * 2,
    //         (resVal: number) => resVal * 3,
    //       );
    //     result.then(() => {
    //       expect(result).resolves.toBe(15);
    //       done();
    //     });
    //   });
    //   it('should cata on rejected side', (done) => {
    //     const result = createPromise(false, 5)
    //       .cata(
    //         (rejVal: number) => rejVal * 2,
    //         (resVal: number) => resVal * 3,
    //       );
    //     result.then(() => {
    //       expect(result).resolves.toBe(10);
    //       done();
    //     });
    //   });
    // });
    // describe('bimap method', () => {
    //   it('should bimap on resolved side', (done) => {
    //     const result = createPromise(true, 5)
    //       .bimap(
    //         (rejVal: number) => rejVal * 2,
    //         (resVal: number) => resVal * 3,
    //       );
    //     result.then(() => {
    //       expect(result).resolves.toBe(15);
    //       done();
    //     });
    //   });
    //   it('should bimap on rejected side', (done) => {
    //     const result = createPromise(false, 5)
    //       .bimap(
    //         (rejVal: number) => rejVal * 2,
    //         (resVal: number) => resVal * 3,
    //       );
    //     result.catch(() => {
    //       expect(result).rejects.toBe(10);
    //       done();
    //     });
    //   });
    // });
    // describe('recover method', () => {
    //   it('should recover on rejected side', (done) => {
    //     const result = createPromise(false, 5)
    //       .recover((rj: number | any): number => typeof rj === 'number' ? rj * 2 : 0);
    //     result.then(() => {
    //       expect(result).resolves.toBe(10);
    //       done();
    //     });
    //   });
    //   it('should pass over recover on rejesolved side', (done) => {
    //     const result = createPromise(true, 5)
    //       .recover((rj: number | any): number => typeof rj === 'number' ? rj * 2 : 0);
    //     result.then(() => {
    //       expect(result).resolves.toBe(5);
    //       done();
    //     });
    //   });
    // });
    // describe('tap method', () => {
    //   it('should call on resolved and return unaffected', (done) => {
    //     const fn = jest.fn();
    //     const result = createPromise(true, 5)
    //       .tap(fn);
    //     result.then(() => {
    //       expect(result).resolves.toBe(5);
    //       expect(fn).toHaveBeenCalledWith(5);
    //       done();
    //     });
    //   });
    //   it('should skip rejected and return unaffected', (done) => {
    //     const fn = jest.fn();
    //     const result = createPromise(false, 5)
    //       .tap(fn);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(5);
    //       expect(fn).not.toHaveBeenCalled();
    //       done();
    //     });
    //   });
    // });
    // describe('doubleTap method', () => {
    //   it('should call on resolved and return unaffected', (done) => {
    //     const fn = jest.fn();
    //     const result = createPromise(true, 5)
    //       .doubleTap(fn);
    //     result.then(() => {
    //       expect(result).resolves.toBe(5);
    //       expect(fn).toHaveBeenCalledWith(null, 5, true);
    //       done();
    //     });
    //   });
    //   it('should skip rejected and return unaffected', (done) => {
    //     const fn = jest.fn();
    //     const result = createPromise(false, 5)
    //       .doubleTap(fn);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(5);
    //       expect(fn).toHaveBeenCalledWith(5, null, false);
    //       done();
    //     });
    //   });
    // });
});
//# sourceMappingURL=pronad.spec.js.map