import { monadifyPromises, P, Pronad, PND_LEFT, PND_RIGHT } from '../index';

function createPromise<T>(resOrRej: boolean, val: T): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(() => (resOrRej ? res : rej)(val), 50);
  });
}

describe('pronad', () => {
  const fixture = {};

  monadifyPromises();

  describe('right constructor', () => {
    it('should return Pronad Right', (done) => {
      const result = P.Right(fixture);

      // I've fixed the .anden for Pronad, but now it thinks it's grabbing T as the result
      return result.anden((r) => {
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should resolve value into Pronad Right', async (done) => {
      const result = P.Right(createPromise(true, fixture));

      return result.anden((r) => {
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });
  });

  describe('left constructor', () => {
    it('should return Pronad Left', (done) => {
      const result = P.Left(fixture);

      return result.anden((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });

    it('should resolve value into Pronad Left', (done) => {
      const result = P.Left(createPromise(true, fixture));

      return result.anden((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  });
  
  describe('fromPromise factory', () => {
    it('should return right on resolved', (done) => {
      const result = P.fromPromise(createPromise(true, fixture));

      return result.anden((r) => {
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should return left on rejected', (done) => {
      const result = P.fromPromise(createPromise(false, fixture));

      return result.anden((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });

    it('should run catchFn on rejected', (done) => {
      const catchFn = jest.fn().mockImplementation(() => fixture);
      const result = P.fromPromise(createPromise(false, 5), catchFn);

      return result.anden((r) => {
        expect(catchFn).toHaveBeenCalledWith(5);
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  })
  
  describe('fromFalsey factory', () => {
    it('should create resolved promise on truthy', (done) => {
      const result = P.fromFalsey(5, 0);

      return result.anden((r) => {
        expect(r.state).toEqual(PND_RIGHT);
        expect(r.right).toEqual(5);
        done();
      });
    });

    it('should create rejected promise on false', (done) => {
      const result = P.fromFalsey(false, 0);

      return result.anden((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(0);
        done();
      });
    });

    it('should create rejected promise on null', (done) => {
      const result = P.fromFalsey(null, 0);

      return result.anden((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(0);
        done();
      });
    });

    it('should create rejected promise on null', (done) => {
      const result = P.fromFalsey(undefined, 0);

      return result.anden((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(0);
        done();
      });
    });

    it('should default to null', (done) => {
      const result = P.fromFalsey(undefined);

      return result.anden((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(null);
        done();
      });
    });
  });

  describe('fromNull factory', () => {
    it('should create resolved promise on truthy', (done) => {
      const result = P.fromNull(5, 0);

      return result.anden((r) => {
        expect(r.state).toEqual(PND_RIGHT);
        expect(r.right).toEqual(5);
        done();
      });
    });

    it('should create resolved promise on false', (done) => {
      const result = P.fromNull(false, 0);

      return result.anden((r) => {
        expect(r.state).toEqual(PND_RIGHT);
        expect(r.right).toEqual(false);
        done();
      });
    });

    it('should create rejected promise on null', (done) => {
      const result = P.fromNull(null, 0);

      return result.anden((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(0);
        done();
      });
    });

    it('should create rejected promise on null', (done) => {
      const result = P.fromNull(undefined, 0);

      return result.anden((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(0);
        done();
      });
    });

    it('should default to null', (done) => {
      const result = P.fromNull(undefined);

      return result.anden((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(null);
        done();
      });
    });
  });

  describe('map method', () => {
    it('should throw on unwrapped promise', (done) => {
      const result = createPromise(true, 5)
        .map((resVal: number) => fixture);

      result.catch((e) => {
        expect(e.message).toBe("Cannot map on a Promise that does not contain a Pronad");
        done();
      });
    });
  
    it('should map on pronad Right', (done) => {
      const result = P.Right(5)
        .map((resVal: number) => fixture);

      return result.anden((r) => { 
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });
  
    it('should map on pronad Right and await result', (done) => {
      const result = P.Right(5)
        .map((resVal: number) => createPromise(true, fixture));

      return result.anden((r) => { 
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should skip rejected promises', (done) => {
      const result = createPromise(false, fixture)
        .map((resVal: {}) => 7);
      
      return result.catch((e) => {
        expect(e).toBe(fixture);
        done();
      });
    });

    it('should skip on Pronad Left', (done) => {
      const result = P.Left<{}, number>(fixture)
        .map((resVal: number) => 5);
      
      return result.anden((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  });


  describe('rejMap method', () => {
    it('should throw on unwrapped promise value', (done) => {
      const result = createPromise(true, 5)
        .rejMap((resVal: number) => fixture);

      result.catch((e) => {
        expect(e.message).toBe("Cannot leftMap on a Promise that does not contain a Pronad");
        done();
      });
    });
  
    it('should skip on pronad Right', (done) => {
      const result = P.Right<number, {}>(fixture)
        .rejMap((resVal: number) => 5);

      return result.anden((r) => { 
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should rejMap on Pronad Left', (done) => {
      const result = P.Left(5)
        .rejMap((resVal: number) => fixture);
      
      return result.anden((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });

    it('should rejMap on promise Pronad Left', (done) => {
      const result = P.fromPromise(createPromise(false, 5), (e): number => e)
        .rejMap((resVal: number) => fixture);
      
      return result.anden((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  });


  describe('bind method', () => {
    it('should throw on unwrapped promise', (done) => {
      const result = createPromise(true, 5)
        .bind((resVal: number) => P.Right(fixture));

      result.catch((e) => {
        expect(e.message).toBe("Cannot bind on a Promise that does not contain a Pronad");
        done();
      });
    });
  
    it('should bind on pronad Right to Left', (done) => {
      const result = P.Right(5)
        .bind((resVal: number) => P.Left(fixture));

      return result.anden((r) => { 
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  
    it('should bind on pronad Right to Right', (done) => {
      const result = P.Right(5)
        .bind((resVal: number) => P.Right(fixture));

      return result.anden((r) => { 
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should skip rejected promise', (done) => {
      const result = createPromise(false, fixture)
        .bind((resVal: {}) => P.Right(7));
      
      return result.catch((e) => {
        expect(e).toBe(fixture);
        done();
      });
    });

    it('should skip on Pronad Left', (done) => {
      const result = P.Left<{}, number>(fixture)
        .bind((resVal: number) => P.Right(5));
      
      return result.anden((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  });


  
  describe('rejBind method', () => {
    it('should throw on unwrapped promise', (done) => {
      const result = createPromise(true, 5)
        .rejBind((rejVal: any) => P.Right(6));

      result.catch((e: any) => {
        expect(e.message).toBe("Cannot leftBind on a Promise that does not contain a Pronad");
        done();
      });
    });
  
    it('should bind on pronad Right to Left', (done) => {
      const result = P.Right(5)
        .bind((resVal: number) => P.Left(fixture));

      return result.anden((r) => { 
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  
    it('should bind on pronad Right to Right', (done) => {
      const result = P.Right(5)
        .bind((resVal: number) => P.Right(fixture));

      return result.anden((r) => { 
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should skip rejected promise', (done) => {
      const result = createPromise(false, fixture)
        .bind((resVal: {}) => P.Right(7));
      
      return result.catch((e) => {
        expect(e).toBe(fixture);
        done();
      });
    });

    it('should skip on Pronad Left', (done) => {
      const result = P.Left<{}, number>(fixture)
        .bind((resVal: number) => P.Right(5));
      
      return result.anden((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  });


  describe('cata method', () => {
    it('should throw on unwrapped promise', (done) => {
      const result = createPromise(true, 5)
        .cata(
          (rejVal: number) => fixture,
          (resVal: {}) => ({}),
        );

      result.catch((e) => {
        expect(e.message).toBe("Cannot cata on a Promise that does not contain a Pronad");
        done();
      });
    });
  
    it('should cata on pronad Left', (done) => {
      const result = P.Left(5)
        .cata(
          (rejVal: number) => fixture,
          (resVal: {}) => ({}),
        );

      return result.anden((r) => { 
        expect(r).toBe(fixture);
        done();
      });
    });
  
    it('should cata on pronad Right', (done) => {
      const result = P.Right(5)
        .cata(
          (rejVal: {}) => ({}),
          (resVal: number) => fixture,
        );

      return result.anden((r) => { 
        expect(r).toBe(fixture);
        done();
      });
    });
  });

  describe('bimap method', () => {
    it('should throw on unwrapped promise', (done) => {
      const result = createPromise(true, 5)
        .bimap(
          (rejVal: number) => fixture,
          (resVal: {}) => ({}),
        );

      result.catch((e) => {
        expect(e.message).toBe("Cannot bimap on a Promise that does not contain a Pronad");
        done();
      });
    });
  
    it('should bimap on pronad Left', (done) => {
      const result = P.Left(5)
        .bimap(
          (rejVal: number) => fixture,
          (resVal: {}) => ({}),
        );

      return result.anden((r) => { 
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  
    it('should bimap on pronad Right', (done) => {
      const result = P.Right(5)
        .bimap(
          (rejVal: {}) => ({}),
          (resVal: number) => fixture,
        );

      return result.anden((r) => { 
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });
  });

  describe('tap method', () => {
    it('should call on Right and return unaffected', (done) => {
      const fn = jest.fn();
      const right = P.Right(fixture)
      const result = right.tap(fn);

      return result.anden((r) => {
        expect(result).toEqual(right);
        expect(fn).toHaveBeenCalledWith(fixture);
        done();
      });
    });

    it('should skip rejected and return unaffected', (done) => {
      const fn = jest.fn();
      const left = P.Left(fixture)
      const result = left.tap(fn);

      return result.anden((r) => {
        expect(result).toEqual(left);
        expect(fn).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('doubleTap method', () => {
    it('should call on resolved and return unaffected', (done) => {
      const fn = jest.fn();
      const right = P.Right(fixture)
      const result = right.doubleTap(fn);

      return result.anden((r) => {
        expect(result).toEqual(right);
        expect(fn).toHaveBeenCalledWith(null, fixture, true);
        done();
      });
    });

    it('should skip rejected and return unaffected', (done) => {
      const fn = jest.fn();
      const left = P.Left(fixture)
      const result = left.doubleTap(fn);

      return result.anden(() => {
        expect(result).toEqual(left);
        expect(fn).toHaveBeenCalledWith(fixture, null, false);
        done();
      });
    });
  });


  describe('getOrElse method', () => {
    it('should getOrElse on Left side', (done) => {
      const result = P.Left(5)
        .getOrElse((rj: number): {} => fixture);

      return result.anden((r) => {
        expect(r).toEqual(fixture);
        done();
      });
    });

    it('should pass over getOrElse on Right side', (done) => {
      const result = P.Right(fixture)
        .getOrElse((rejVal: any): {} => ({ not: 'ever' }));

      return result.anden((r) => {
        expect(r).toEqual(fixture);
        done();
      });
    });

    it('should catch on rejected promise', (done) => {
      const result = createPromise(false, {})
        .getOrElse(
          (rejVal: any): {} => ({ not: 'ever' }),
          (err: any): {} => fixture );

      return result.anden((r) => {
        expect(r).toEqual(fixture);
        done();
      });
    });
  });

  describe('getOr method', () => {
    it('should getOr on Left side', (done) => {
      const result = P.Left(5)
        .getOr(fixture);

      return result.anden((r) => {
        expect(r).toEqual(fixture);
        done();
      });
    });

    it('should pass over getOr on Right side', (done) => {
      const result = P.Right(fixture)
        .getOr(5);

      return result.anden((r) => {
        expect(r).toEqual(fixture);
        done();
      });
    });

    it('should catch on rejected promise, value', (done) => {
      const result = createPromise(false, {})
        .getOr(
          5,
          fixture,
        );

      return result.anden((r) => {
        expect(r).toEqual(fixture);
        done();
      });
    });

    it('should catch on rejected promise, exec fn', (done) => {
      const result = createPromise(false, {})
        .getOr(
          5,
          (err: any): {} => fixture,
          true,
        );

      return result.anden((r) => {
        expect(r).toEqual(fixture);
        done();
      });
    });

    it('should catch on rejected promise, returning fn as val', (done) => {
      const fixtureFn = (a: number) => a.toString;
      const result = createPromise(false, {})
        .getOr(
          5,
          fixtureFn,
        );

      return result.anden((r) => {
        expect(r).toEqual(fixtureFn);
        done();
      });
    });
  });

  describe('catch guard', () => {
    const isError = (mbErr: any): mbErr is Error => mbErr.message && mbErr.name;

    const makeResPromise = (x: any): Promise<{}> => createPromise(true, fixture);
    const makeResPronad = (x: any): Pronad<any, {}> => createPromise(true, P.Right(fixture)) as unknown as Pronad<any, {}>;
    const makeRejPromiseError = (x: any): Promise<{}> => createPromise(false, new Error('fixture')) as unknown as Promise<{}>;
    const makeRejPromiseThrows = (x: any): Promise<{}> => createPromise(false, fixture) as unknown as Promise<{}>;

    // should this be actual ts guard - or try not to tie to ts functionality too tightly
    const errorGuard = P.makeCatchGuard<Error>((err: any): Error => {
      if (isError(err)) return err;
      else if (typeof err === 'string') return new Error(err)
      else throw err;
    });

    it('should pass through resolved promises', (done) => {
      const newMapFn = errorGuard(makeResPromise);
      const result = newMapFn(5);

      return result.anden((r) => {
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should autoresolve pronad right returns', (done) => {
      const newMapFn = errorGuard(makeResPronad);
      const result = newMapFn(5);

      return result.anden((r) => {
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should pass through rejected promises', (done) => {
      const newMapFn = errorGuard(makeRejPromiseError);
      const result = newMapFn(5);

      return result.anden((r) => {
        expect(r.state).toBe(PND_LEFT);
        if (r.state === PND_LEFT) {
          expect(r.left.message).toBe('fixture');
        } else throw new Error();
        done();
      });
    });

    it('should still throw if catcher fails', (done) => {
      const newMapFn = errorGuard(makeRejPromiseThrows);
      const result = newMapFn(5);

      return result.catch((e) => { 
        expect(e).toBe(fixture);
        done();
      });
    });
  })
});