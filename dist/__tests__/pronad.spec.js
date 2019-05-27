"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var P = __importStar(require("../index"));
// monadifyPromises();
function createPromise(resOrRej, val) {
    return new Promise(function (res, rej) {
        setTimeout(function () { return (resOrRej ? res : rej)(val); }, 50);
    });
}
describe('pronad', function () {
    var fixture = {};
    describe('right', function () {
        it('should be recognised by isRight', function () {
            var result = P.right(fixture);
            expect(P.isRight(result)).toBe(true);
            expect(P.isLeft(result)).toBe(false);
        });
        it('should be not recognised by isLeft', function () {
            var result = P.right(fixture);
            expect(P.isLeft(result)).toBe(false);
            expect(P.isRight(result)).toBe(true);
        });
        it('has aliases', function () {
            expect(P.right).toBe(P.val);
            expect(P.isRight).toBe(P.isVal);
        });
    });
    describe('left', function () {
        it('should be recognised by isLeft', function () {
            var result = P.left(fixture);
            expect(P.isLeft(result)).toBe(true);
            expect(P.isRight(result)).toBe(false);
        });
        it('should be not recognised by isRight', function () {
            var result = P.left(fixture);
            expect(P.isRight(result)).toBe(false);
            expect(P.isLeft(result)).toBe(true);
        });
        it('has aliases', function () {
            expect(P.left).toBe(P.err);
            expect(P.isLeft).toBe(P.isErr);
        });
    });
    describe('map', function () {
        it('should map a Right', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var right = P.right(valFix);
            var result = P.map(fn, right);
            expect(P.isRight(result)).toBe(true);
            expect(P.getRight(result)).toBe(fixture);
            expect(fn).toHaveBeenCalledWith(valFix);
        });
        it('should skip a Left', function () {
            var fn = jest.fn().mockImplementation(function () { return fixture; });
            var valFix = {};
            var right = P.left(valFix);
            var result = P.map(fn, right);
            expect(P.isRight(result)).toBe(false);
            expect(P.getRight(result)).toBeUndefined();
            expect(fn).not.toHaveBeenCalled();
        });
    });
    // describe('map function', () => {
    //   it('should map a right', () => {
    //     result.then(() => {
    //       expect(result).resolves.toBe(10);
    //       done();
    //     });
    //   });
    //   it('should skip rejected promises', (done) => {
    //     const result = createPromise(false, 5)
    //       .map((resVal: number) => resVal * 2);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(5);
    //       done();
    //     });
    //   });
    // });
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
    // describe('fromFalsey factory', () => {
    //   it('should create resolved promise on truthy', (done) => {
    //     const result = Pronad.fromFalsey(5, 0);
    //     result.then(() => {
    //       expect(result).resolves.toBe(5);
    //       done();
    //     });
    //   });
    //   it('should create rejected promise on false', (done) => {
    //     const result = Pronad.fromFalsey(false, 0);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(0);
    //       done();
    //     });
    //   });
    //   it('should create rejected promise on null', (done) => {
    //     const result = Pronad.fromFalsey(null, 0);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(0);
    //       done();
    //     });
    //   });
    //   it('should create rejected promise on null', (done) => {
    //     const result = Pronad.fromFalsey(undefined, 0);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(0);
    //       done();
    //     });
    //   });
    //   it('should default to null', (done) => {
    //     const result = Pronad.fromFalsey(undefined);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(null);
    //       done();
    //     });
    //   });
    // });
    // describe('fromNull factory', () => {
    //   it('should create resolved promise on truthy', (done) => {
    //     const result = Pronad.fromNull(5, 0);
    //     result.then(() => {
    //       expect(result).resolves.toBe(5);
    //       done();
    //     });
    //   });
    //   it('should create resolved promise on false', (done) => {
    //     const result = Pronad.fromNull(false, 0);
    //     result.then(() => {
    //       expect(result).resolves.toBe(false);
    //       done();
    //     });
    //   });
    //   it('should create rejected promise on null', (done) => {
    //     const result = Pronad.fromNull(null, 0);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(0);
    //       done();
    //     });
    //   });
    //   it('should create rejected promise on null', (done) => {
    //     const result = Pronad.fromNull(undefined, 0);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(0);
    //       done();
    //     });
    //   });
    //   it('should default to null', (done) => {
    //     const result = Pronad.fromNull(undefined);
    //     result.catch(() => {
    //       expect(result).rejects.toBe(null);
    //       done();
    //     });
    //   });
    // });
});
//# sourceMappingURL=pronad.spec.js.map