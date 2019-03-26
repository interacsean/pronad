import { monadifyPromises } from '../index';
import '../ambient/index.d.ts';

monadifyPromises();

function createPromise<T>(resOrRej: boolean, val: T): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(() => (resOrRej ? res : rej)(val), 50);
  });
}

describe('map method', () => {
  it('should map on resolved promises', () => {
    const result = createPromise(true, 5)
      .map((resVal: number) => resVal * 2);

    expect(result).resolves.toEqual(10);
  });

  it('should skip rejected promises', () => {
    const result = createPromise(false, 5)
      .map((resVal: number) => resVal * 2);
    
    expect(result).rejects.toEqual(5);
  });
});

describe('rejMap method', () => {
  it('should map on rejected promises', () => {
    const result = createPromise(false, 5)
      .rejMap((rejVal: number) => rejVal * 2);

    expect(result).rejects.toEqual(10);
  });

  it('should skip resolved promises', () => {
    const result = createPromise(true, 5)
      .rejMap((rejVal: number) => rejVal * 2);
    
    expect(result).resolves.toEqual(5);
  });
});

describe('bind method', () => {
  it('should bind on resolved promises', () => {
    const result = createPromise(true, 5)
      .bind((resVal: number) => Promise.resolve(resVal * 2));

    expect(result).resolves.toEqual(10);
  });

  it('should skip rejected promises', () => {
    const result = createPromise(false, 5)
      .bind((resVal: number) => Promise.resolve(resVal * 2));
    
    expect(result).rejects.toEqual(5);
  });

  it('should return rejected promise', () => {
    const result = createPromise(true, 5)
      .bind((resVal: number) => Promise.reject(resVal * 2));

    expect(result).rejects.toEqual(10);
  });
});

describe('rej bind method', () => {
  it('should bind on rejected promises', () => {
    const result = createPromise(false, 5)
      .rejFlatMap((resVal: number) => Promise.resolve(resVal * 2));

    expect(result).resolves.toEqual(10);
  });

  it('should skip resolved promises', () => {
    const result = createPromise(false, 5)
      .rejFlatMap((resVal: number) => Promise.resolve(resVal * 2));
    
    expect(result).rejects.toEqual(5);
  });

  it('should return rejected promise', () => {
    const result = createPromise(false, 5)
      .rejFlatMap((resVal: number) => Promise.reject(resVal * 2));

    expect(result).rejects.toEqual(10);
  });
});

describe('cata method', () => {
  it('should cata on resolved side', () => {
    const result = createPromise(true, 5)
      .cata(
        (rejVal: number) => rejVal * 2,
        (resVal: number) => resVal * 3,
      );

    expect(result).resolves.toEqual(10);
  });

  it('should cata on rejected side', () => {
    const result = createPromise(false, 5)
      .cata(
        (rejVal: number) => rejVal * 2,
        (resVal: number) => resVal * 3,
      );

    expect(result).resolves.toEqual(15);
  });
});
