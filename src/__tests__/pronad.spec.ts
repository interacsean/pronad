import { monadifyPromises, Pronad, PND_LEFT, PND_RIGHT } from '../index';

monadifyPromises();

function createPromise<T>(resOrRej: boolean, val: T): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(() => (resOrRej ? res : rej)(val), 50);
  });
}

describe('pronad', () => {
  const fixture = {};

  describe('right constructor', () => {
    it('should return promise with Pnd', (done) => {
      const result = Pronad.Right(fixture);

      return result.then((r) => {
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });
  });

  describe('left constructor', () => {
    it('should return promise with Pnd', (done) => {
      const result = Pronad.Left(fixture);

      return result.then((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  });
  
  describe('fromPromise factory', () => {
    it('should return right on resolved', (done) => {
      const result = Pronad.fromPromise(createPromise(true, fixture));

      return result.then((r) => {
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should return left on rejected', (done) => {
      const result = Pronad.fromPromise(createPromise(false, fixture));

      return result.then((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });

    it('should run catchFn on rejected', (done) => {
      const catchFn = jest.fn().mockImplementation(() => fixture);
      const result = Pronad.fromPromise(createPromise(false, 5), catchFn);

      return result.then((r) => {
        expect(catchFn).toHaveBeenCalledWith(5);
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  })
  
  describe('fromFalsey factory', () => {
    it('should create resolved promise on truthy', (done) => {
      const result = Pronad.fromFalsey(5, 0);

      return result.then((r) => {
        expect(r.state).toEqual(PND_RIGHT);
        expect(r.right).toEqual(5);
        done();
      });
    });

    it('should create rejected promise on false', (done) => {
      const result = Pronad.fromFalsey(false, 0);

      return result.then((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(0);
        done();
      });
    });

    it('should create rejected promise on null', (done) => {
      const result = Pronad.fromFalsey(null, 0);

      return result.then((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(0);
        done();
      });
    });

    it('should create rejected promise on null', (done) => {
      const result = Pronad.fromFalsey(undefined, 0);

      return result.then((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(0);
        done();
      });
    });

    it('should default to null', (done) => {
      const result = Pronad.fromFalsey(undefined);

      return result.then((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(null);
        done();
      });
    });
  });

  describe('fromNull factory', () => {
    it('should create resolved promise on truthy', (done) => {
      const result = Pronad.fromNull(5, 0);

      return result.then((r) => {
        expect(r.state).toEqual(PND_RIGHT);
        expect(r.right).toEqual(5);
        done();
      });
    });

    it('should create resolved promise on false', (done) => {
      const result = Pronad.fromNull(false, 0);

      return result.then((r) => {
        expect(r.state).toEqual(PND_RIGHT);
        expect(r.right).toEqual(false);
        done();
      });
    });

    it('should create rejected promise on null', (done) => {
      const result = Pronad.fromNull(null, 0);

      return result.then((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(0);
        done();
      });
    });

    it('should create rejected promise on null', (done) => {
      const result = Pronad.fromNull(undefined, 0);

      return result.then((r) => {
        expect(r.state).toEqual(PND_LEFT);
        expect(r.left).toEqual(0);
        done();
      });
    });

    it('should default to null', (done) => {
      const result = Pronad.fromNull(undefined);

      return result.then((r) => {
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
      const result = Pronad.Right(5)
        .map((resVal: number) => fixture);

      return result.then((r) => { 
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
      const result = Pronad.Left(fixture)
        .map((resVal: number) => 5);
      
      return result.then((r) => {
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
      const result = Pronad.Right(fixture)
        .rejMap((resVal: number) => 5);

      return result.then((r) => { 
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should rejMap on Pronad Left', (done) => {
      const result = Pronad.Left(5)
        .rejMap((resVal: number) => fixture);
      
      return result.then((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });

    it('should rejMap on promise Pronad Left', (done) => {
      const result = Pronad.fromPromise(createPromise(false, 5), (e): number => e)
        .rejMap((resVal: number) => fixture);
      
      return result.then((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  });


  describe('bind method', () => {
    it('should throw on unwrapped promise', (done) => {
      const result = createPromise(true, 5)
        .bind((resVal: number) => Pronad.Right(fixture));

      result.catch((e) => {
        expect(e.message).toBe("Cannot bind on a Promise that does not contain a Pronad");
        done();
      });
    });
  
    it('should bind on pronad Right to Left', (done) => {
      const result = Pronad.Right(5)
        .bind((resVal: number) => Pronad.Left(fixture));

      return result.then((r) => { 
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  
    it('should bind on pronad Right to Right', (done) => {
      const result = Pronad.Right(5)
        .bind((resVal: number) => Pronad.Right(fixture));

      return result.then((r) => { 
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should skip rejected promise', (done) => {
      const result = createPromise(false, fixture)
        .bind((resVal: {}) => Pronad.Right(7));
      
      return result.catch((e) => {
        expect(e).toBe(fixture);
        done();
      });
    });

    it('should skip on Pronad Left', (done) => {
      const result = Pronad.Left(fixture)
        .bind((resVal: number) => Pronad.Right(5));
      
      return result.then((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  });


  
  describe('rejBind method', () => {
    it('should throw on unwrapped promise', (done) => {
      const result = createPromise(true, 5)
        .rejBind((rejVal: any) => Pronad.Right(6));

      result.catch((e: any) => {
        expect(e.message).toBe("Cannot leftBind on a Promise that does not contain a Pronad");
        done();
      });
    });
  
    it('should bind on pronad Right to Left', (done) => {
      const result = Pronad.Right(5)
        .bind((resVal: number) => Pronad.Left(fixture));

      return result.then((r) => { 
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  
    it('should bind on pronad Right to Right', (done) => {
      const result = Pronad.Right(5)
        .bind((resVal: number) => Pronad.Right(fixture));

      return result.then((r) => { 
        expect(r.state).toBe(PND_RIGHT);
        expect(r.right).toBe(fixture);
        done();
      });
    });

    it('should skip rejected promise', (done) => {
      const result = createPromise(false, fixture)
        .bind((resVal: {}) => Pronad.Right(7));
      
      return result.catch((e) => {
        expect(e).toBe(fixture);
        done();
      });
    });

    it('should skip on Pronad Left', (done) => {
      const result = Pronad.Left(fixture)
        .bind((resVal: number) => Pronad.Right(5));
      
      return result.then((r) => {
        expect(r.state).toBe(PND_LEFT);
        expect(r.left).toBe(fixture);
        done();
      });
    });
  });

  // describe('bind method', () => {
  //   it('should bind on resolved promises', (done) => {
  //     const result = createPromise(true, 5)
  //       .bind((resVal: number) => Promise.resolve(resVal * 2));

  //     return result.then((r) => {
  //       expect(r).toEqual(10);
  //       done();
  //     });
  //   });

  //   it('should skip rejected promises', (done) => {
  //     const result = createPromise(false, 5)
  //       .bind((resVal: number) => Promise.resolve(resVal * 2));
      
  //     return result.catch(() => {
  //       expect(r).toEqual(5);
  //       done();
  //     });
  //   });

  //   it('should return rejected promise', (done) => {
  //     const result = createPromise(true, 5)
  //       .bind((resVal: number) => Promise.reject(resVal * 2));

  //     return result.catch(() => {
  //       expect(r).toEqual(10);
  //       done();
  //     });
  //   });
  // });

  // describe('rej bind method', () => {
  //   it('should bind on rejected promises', (done) => {
  //     const result = createPromise(false, 5)
  //       .rejFlatMap((resVal: number) => Promise.resolve(resVal * 2));

  //     return result.then((r) => {
  //       expect(r).toEqual(10);
  //       done();
  //     });
  //   });

  //   it('should skip resolved promises', (done) => {
  //     const result = createPromise(true, 5)
  //       .rejFlatMap((resVal: number) => Promise.resolve(resVal * 2));
      
  //     return result.then((r) => {
  //       expect(r).toEqual(5);
  //       done();
  //     });
  //   });

  //   it('should return rejected promise', (done) => {
  //     const result = createPromise(false, 5)
  //       .rejFlatMap((resVal: number) => Promise.reject(resVal * 2));

  //     return result.catch(() => {
  //       expect(r).toEqual(10);
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

  //     return result.then((r) => {
  //       expect(r).toEqual(15);
  //       done();
  //     });
  //   });

  //   it('should cata on rejected side', (done) => {
  //     const result = createPromise(false, 5)
  //       .cata(
  //         (rejVal: number) => rejVal * 2,
  //         (resVal: number) => resVal * 3,
  //       );

  //     return result.then((r) => {
  //       expect(r).toEqual(10);
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

  //     return result.then((r) => {
  //       expect(r).toEqual(15);
  //       done();
  //     });
  //   });

  //   it('should bimap on rejected side', (done) => {
  //     const result = createPromise(false, 5)
  //       .bimap(
  //         (rejVal: number) => rejVal * 2,
  //         (resVal: number) => resVal * 3,
  //       );

  //     return result.catch(() => {
  //       expect(r).toEqual(10);
  //       done();
  //     });
  //   });
  // });

  // describe('recover method', () => {
  //   it('should recover on rejected side', (done) => {
  //     const result = createPromise(false, 5)
  //       .recover((rj: number | any): number => typeof rj === 'number' ? rj * 2 : 0);

  //     return result.then((r) => {
  //       expect(r).toEqual(10);
  //       done();
  //     });
  //   });

  //   it('should pass over recover on rejesolved side', (done) => {
  //     const result = createPromise(true, 5)
  //       .recover((rj: number | any): number => typeof rj === 'number' ? rj * 2 : 0);

  //     return result.then((r) => {
  //       expect(r).toEqual(5);
  //       done();
  //     });
  //   });
  // });

  // describe('tap method', () => {
  //   it('should call on resolved and return unaffected', (done) => {
  //     const fn = jest.fn();
  //     const result = createPromise(true, 5)
  //       .tap(fn);

  //     return result.then((r) => {
  //       expect(r).toEqual(5);
  //       expect(fn).toHaveBeenCalledWith(5);
  //       done();
  //     });
  //   });

  //   it('should skip rejected and return unaffected', (done) => {
  //     const fn = jest.fn();
  //     const result = createPromise(false, 5)
  //       .tap(fn);

  //     return result.catch(() => {
  //       expect(r).toEqual(5);
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

  //     return result.then((r) => {
  //       expect(r).toEqual(5);
  //       expect(fn).toHaveBeenCalledWith(null, 5, true);
  //       done();
  //     });
  //   });

  //   it('should skip rejected and return unaffected', (done) => {
  //     const fn = jest.fn();
  //     const result = createPromise(false, 5)
  //       .doubleTap(fn);

  //     return result.catch(() => {
  //       expect(r).toEqual(5);
  //       expect(fn).toHaveBeenCalledWith(5, null, false);
  //       done();
  //     });
  //   });
  // });

});