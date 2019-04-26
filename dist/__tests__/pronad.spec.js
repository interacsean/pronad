"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
function createPromise(resOrRej, val) {
    return new Promise(function (res, rej) {
        setTimeout(function () { return (resOrRej ? res : rej)(val); }, 50);
    });
}
describe('pronad', function () {
    var fixture = {};
    index_1.monadifyPromises();
    describe('right constructor', function () {
        it('should return Pronad Right', function (done) {
            var result = index_1.P.Right(fixture);
            // I've fixed the .anden for Pronad, but now it thinks it's grabbing T as the result
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_RIGHT);
                expect(r.right).toBe(fixture);
                done();
            });
        });
        it('should resolve value into Pronad Right', function (done) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = index_1.P.Right(createPromise(true, fixture));
                return [2 /*return*/, result.anden(function (r) {
                        expect(r.state).toBe(index_1.PND_RIGHT);
                        expect(r.right).toBe(fixture);
                        done();
                    })];
            });
        }); });
    });
    describe('left constructor', function () {
        it('should return Pronad Left', function (done) {
            var result = index_1.P.Left(fixture);
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
        it('should resolve value into Pronad Left', function (done) {
            var result = index_1.P.Left(createPromise(true, fixture));
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
    });
    describe('fromPromise factory', function () {
        it('should return right on resolved', function (done) {
            var result = index_1.P.fromPromise(createPromise(true, fixture));
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_RIGHT);
                expect(r.right).toBe(fixture);
                done();
            });
        });
        it('should return left on rejected', function (done) {
            var result = index_1.P.fromPromise(createPromise(false, fixture));
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
        it('should run catchFn on rejected', function (done) {
            var catchFn = jest.fn().mockImplementation(function () { return fixture; });
            var result = index_1.P.fromPromise(createPromise(false, 5), catchFn);
            return result.anden(function (r) {
                expect(catchFn).toHaveBeenCalledWith(5);
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
    });
    describe('fromFalsey factory', function () {
        it('should create resolved promise on truthy', function (done) {
            var result = index_1.P.fromFalsey(5, 0);
            return result.anden(function (r) {
                expect(r.state).toEqual(index_1.PND_RIGHT);
                expect(r.right).toEqual(5);
                done();
            });
        });
        it('should create rejected promise on false', function (done) {
            var result = index_1.P.fromFalsey(false, 0);
            return result.anden(function (r) {
                expect(r.state).toEqual(index_1.PND_LEFT);
                expect(r.left).toEqual(0);
                done();
            });
        });
        it('should create rejected promise on null', function (done) {
            var result = index_1.P.fromFalsey(null, 0);
            return result.anden(function (r) {
                expect(r.state).toEqual(index_1.PND_LEFT);
                expect(r.left).toEqual(0);
                done();
            });
        });
        it('should create rejected promise on null', function (done) {
            var result = index_1.P.fromFalsey(undefined, 0);
            return result.anden(function (r) {
                expect(r.state).toEqual(index_1.PND_LEFT);
                expect(r.left).toEqual(0);
                done();
            });
        });
        it('should default to null', function (done) {
            var result = index_1.P.fromFalsey(undefined);
            return result.anden(function (r) {
                expect(r.state).toEqual(index_1.PND_LEFT);
                expect(r.left).toEqual(null);
                done();
            });
        });
    });
    describe('fromNull factory', function () {
        it('should create resolved promise on truthy', function (done) {
            var result = index_1.P.fromNull(5, 0);
            return result.anden(function (r) {
                expect(r.state).toEqual(index_1.PND_RIGHT);
                expect(r.right).toEqual(5);
                done();
            });
        });
        it('should create resolved promise on false', function (done) {
            var result = index_1.P.fromNull(false, 0);
            return result.anden(function (r) {
                expect(r.state).toEqual(index_1.PND_RIGHT);
                expect(r.right).toEqual(false);
                done();
            });
        });
        it('should create rejected promise on null', function (done) {
            var result = index_1.P.fromNull(null, 0);
            return result.anden(function (r) {
                expect(r.state).toEqual(index_1.PND_LEFT);
                expect(r.left).toEqual(0);
                done();
            });
        });
        it('should create rejected promise on null', function (done) {
            var result = index_1.P.fromNull(undefined, 0);
            return result.anden(function (r) {
                expect(r.state).toEqual(index_1.PND_LEFT);
                expect(r.left).toEqual(0);
                done();
            });
        });
        it('should default to null', function (done) {
            var result = index_1.P.fromNull(undefined);
            return result.anden(function (r) {
                expect(r.state).toEqual(index_1.PND_LEFT);
                expect(r.left).toEqual(null);
                done();
            });
        });
    });
    describe('map method', function () {
        it('should throw on unwrapped promise', function (done) {
            var result = createPromise(true, 5)
                .map(function (resVal) { return fixture; });
            result.catch(function (e) {
                expect(e.message).toBe("Cannot map on a Promise that does not contain a Pronad");
                done();
            });
        });
        it('should map on pronad Right', function (done) {
            var result = index_1.P.Right(5)
                .map(function (resVal) { return fixture; });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_RIGHT);
                expect(r.right).toBe(fixture);
                done();
            });
        });
        it('should map on pronad Right and await result', function (done) {
            var result = index_1.P.Right(5)
                .map(function (resVal) { return createPromise(true, fixture); });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_RIGHT);
                expect(r.right).toBe(fixture);
                done();
            });
        });
        it('should skip rejected promises', function (done) {
            var result = createPromise(false, fixture)
                .map(function (resVal) { return 7; });
            return result.catch(function (e) {
                expect(e).toBe(fixture);
                done();
            });
        });
        it('should skip on Pronad Left', function (done) {
            var result = index_1.P.Left(fixture)
                .map(function (resVal) { return 5; });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
    });
    describe('rejMap method', function () {
        it('should throw on unwrapped promise value', function (done) {
            var result = createPromise(true, 5)
                .rejMap(function (resVal) { return fixture; });
            result.catch(function (e) {
                expect(e.message).toBe("Cannot leftMap on a Promise that does not contain a Pronad");
                done();
            });
        });
        it('should skip on pronad Right', function (done) {
            var result = index_1.P.Right(fixture)
                .rejMap(function (resVal) { return 5; });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_RIGHT);
                expect(r.right).toBe(fixture);
                done();
            });
        });
        it('should rejMap on Pronad Left', function (done) {
            var result = index_1.P.Left(5)
                .rejMap(function (resVal) { return fixture; });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
        it('should rejMap on promise Pronad Left', function (done) {
            var result = index_1.P.fromPromise(createPromise(false, 5), function (e) { return e; })
                .rejMap(function (resVal) { return fixture; });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
    });
    describe('bind method', function () {
        it('should throw on unwrapped promise', function (done) {
            var result = createPromise(true, 5)
                .bind(function (resVal) { return index_1.P.Right(fixture); });
            result.catch(function (e) {
                expect(e.message).toBe("Cannot bind on a Promise that does not contain a Pronad");
                done();
            });
        });
        it('should bind on pronad Right to Left', function (done) {
            var result = index_1.P.Right(5)
                .bind(function (resVal) { return index_1.P.Left(fixture); });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
        it('should bind on pronad Right to Right', function (done) {
            var result = index_1.P.Right(5)
                .bind(function (resVal) { return index_1.P.Right(fixture); });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_RIGHT);
                expect(r.right).toBe(fixture);
                done();
            });
        });
        it('should skip rejected promise', function (done) {
            var result = createPromise(false, fixture)
                .bind(function (resVal) { return index_1.P.Right(7); });
            return result.catch(function (e) {
                expect(e).toBe(fixture);
                done();
            });
        });
        it('should skip on Pronad Left', function (done) {
            var result = index_1.P.Left(fixture)
                .bind(function (resVal) { return index_1.P.Right(5); });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
    });
    describe('rejBind method', function () {
        it('should throw on unwrapped promise', function (done) {
            var result = createPromise(true, 5)
                .rejBind(function (rejVal) { return index_1.P.Right(6); });
            result.catch(function (e) {
                expect(e.message).toBe("Cannot leftBind on a Promise that does not contain a Pronad");
                done();
            });
        });
        it('should bind on pronad Right to Left', function (done) {
            var result = index_1.P.Right(5)
                .bind(function (resVal) { return index_1.P.Left(fixture); });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
        it('should bind on pronad Right to Right', function (done) {
            var result = index_1.P.Right(5)
                .bind(function (resVal) { return index_1.P.Right(fixture); });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_RIGHT);
                expect(r.right).toBe(fixture);
                done();
            });
        });
        it('should skip rejected promise', function (done) {
            var result = createPromise(false, fixture)
                .bind(function (resVal) { return index_1.P.Right(7); });
            return result.catch(function (e) {
                expect(e).toBe(fixture);
                done();
            });
        });
        it('should skip on Pronad Left', function (done) {
            var result = index_1.P.Left(fixture)
                .bind(function (resVal) { return index_1.P.Right(5); });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
    });
    describe('cata method', function () {
        it('should throw on unwrapped promise', function (done) {
            var result = createPromise(true, 5)
                .cata(function (rejVal) { return fixture; }, function (resVal) { return ({}); });
            result.catch(function (e) {
                expect(e.message).toBe("Cannot cata on a Promise that does not contain a Pronad");
                done();
            });
        });
        it('should cata on pronad Left', function (done) {
            var result = index_1.P.Left(5)
                .cata(function (rejVal) { return fixture; }, function (resVal) { return ({}); });
            return result.anden(function (r) {
                expect(r).toBe(fixture);
                done();
            });
        });
        it('should cata on pronad Right', function (done) {
            var result = index_1.P.Right(5)
                .cata(function (rejVal) { return ({}); }, function (resVal) { return fixture; });
            return result.anden(function (r) {
                expect(r).toBe(fixture);
                done();
            });
        });
    });
    describe('bimap method', function () {
        it('should throw on unwrapped promise', function (done) {
            var result = createPromise(true, 5)
                .bimap(function (rejVal) { return fixture; }, function (resVal) { return ({}); });
            result.catch(function (e) {
                expect(e.message).toBe("Cannot bimap on a Promise that does not contain a Pronad");
                done();
            });
        });
        it('should bimap on pronad Left', function (done) {
            var result = index_1.P.Left(5)
                .bimap(function (rejVal) { return fixture; }, function (resVal) { return ({}); });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                expect(r.left).toBe(fixture);
                done();
            });
        });
        it('should bimap on pronad Right', function (done) {
            var result = index_1.P.Right(5)
                .bimap(function (rejVal) { return ({}); }, function (resVal) { return fixture; });
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_RIGHT);
                expect(r.right).toBe(fixture);
                done();
            });
        });
    });
    describe('tap method', function () {
        it('should call on Right and return unaffected', function (done) {
            var fn = jest.fn();
            var right = index_1.P.Right(fixture);
            var result = right.tap(fn);
            return result.anden(function (r) {
                expect(result).toEqual(right);
                expect(fn).toHaveBeenCalledWith(fixture);
                done();
            });
        });
        it('should skip rejected and return unaffected', function (done) {
            var fn = jest.fn();
            var left = index_1.P.Left(fixture);
            var result = left.tap(fn);
            return result.anden(function (r) {
                expect(result).toEqual(left);
                expect(fn).not.toHaveBeenCalled();
                done();
            });
        });
    });
    describe('doubleTap method', function () {
        it('should call on resolved and return unaffected', function (done) {
            var fn = jest.fn();
            var right = index_1.P.Right(fixture);
            var result = right.doubleTap(fn);
            return result.anden(function (r) {
                expect(result).toEqual(right);
                expect(fn).toHaveBeenCalledWith(null, fixture, true);
                done();
            });
        });
        it('should skip rejected and return unaffected', function (done) {
            var fn = jest.fn();
            var left = index_1.P.Left(fixture);
            var result = left.doubleTap(fn);
            return result.anden(function () {
                expect(result).toEqual(left);
                expect(fn).toHaveBeenCalledWith(fixture, null, false);
                done();
            });
        });
    });
    describe('getOrElse method', function () {
        it('should getOrElse on Left side', function (done) {
            var result = index_1.P.Left(5)
                .getOrElse(function (rj) { return fixture; });
            return result.anden(function (r) {
                expect(r).toEqual(fixture);
                done();
            });
        });
        it('should pass over getOrElse on Right side', function (done) {
            var result = index_1.P.Right(fixture)
                .getOrElse(function (rejVal) { return ({ not: 'ever' }); });
            return result.anden(function (r) {
                expect(r).toEqual(fixture);
                done();
            });
        });
        it('should catch on rejected promise', function (done) {
            var result = createPromise(false, {})
                .getOrElse(function (rejVal) { return ({ not: 'ever' }); }, function (err) { return fixture; });
            return result.anden(function (r) {
                expect(r).toEqual(fixture);
                done();
            });
        });
    });
    describe('getOr method', function () {
        it('should getOr on Left side', function (done) {
            var result = index_1.P.Left(5)
                .getOr(fixture);
            return result.anden(function (r) {
                expect(r).toEqual(fixture);
                done();
            });
        });
        it('should pass over getOr on Right side', function (done) {
            var result = index_1.P.Right(fixture)
                .getOr(5);
            return result.anden(function (r) {
                expect(r).toEqual(fixture);
                done();
            });
        });
        it('should catch on rejected promise, value', function (done) {
            var result = createPromise(false, {})
                .getOr(5, fixture);
            return result.anden(function (r) {
                expect(r).toEqual(fixture);
                done();
            });
        });
        it('should catch on rejected promise, exec fn', function (done) {
            var result = createPromise(false, {})
                .getOr(5, function (err) { return fixture; }, true);
            return result.anden(function (r) {
                expect(r).toEqual(fixture);
                done();
            });
        });
        it('should catch on rejected promise, returning fn as val', function (done) {
            var fixtureFn = function (a) { return a.toString; };
            var result = createPromise(false, {})
                .getOr(5, fixtureFn);
            return result.anden(function (r) {
                expect(r).toEqual(fixtureFn);
                done();
            });
        });
    });
    describe('catch guard', function () {
        var isError = function (mbErr) { return mbErr.message && mbErr.name; };
        var makeResPromise = function (x) { return createPromise(true, fixture); };
        var makeResPronad = function (x) { return createPromise(true, index_1.P.Right(fixture)); };
        var makeRejPromiseError = function (x) { return createPromise(false, new Error('fixture')); };
        var makeRejPromiseThrows = function (x) { return createPromise(false, fixture); };
        // should this be actual ts guard - or try not to tie to ts functionality too tightly
        var errorGuard = index_1.P.makeCatchGuard(function (err) {
            if (isError(err))
                return err;
            else if (typeof err === 'string')
                return new Error(err);
            else
                throw err;
        });
        it('should pass through resolved promises', function (done) {
            var newMapFn = errorGuard(makeResPromise);
            var result = newMapFn(5);
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_RIGHT);
                expect(r.right).toBe(fixture);
                done();
            });
        });
        it('should autoresolve pronad right returns', function (done) {
            var newMapFn = errorGuard(makeResPronad);
            var result = newMapFn(5);
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_RIGHT);
                expect(r.right).toBe(fixture);
                done();
            });
        });
        it('should pass through rejected promises', function (done) {
            var newMapFn = errorGuard(makeRejPromiseError);
            var result = newMapFn(5);
            return result.anden(function (r) {
                expect(r.state).toBe(index_1.PND_LEFT);
                if (r.state === index_1.PND_LEFT) {
                    expect(r.left.message).toBe('fixture');
                }
                else
                    throw new Error();
                done();
            });
        });
        it('should still throw if catcher fails', function (done) {
            var newMapFn = errorGuard(makeRejPromiseThrows);
            var result = newMapFn(5);
            return result.catch(function (e) {
                expect(e).toBe(fixture);
                done();
            });
        });
    });
});
//# sourceMappingURL=pronad.spec.js.map