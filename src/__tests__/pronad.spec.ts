// import 'jest';
import { monadifyPromises } from '../index';
import '../types/Promise.d.ts';

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

describe('leftMap method', () => {
  it('should map on rejected promises', () => {
    const result = createPromise(false, 5)
      .leftMap((rejVal: number) => rejVal * 2);

    expect(result).rejects.toEqual(10);
  });

  it('should skip resolved promises', () => {
    const result = createPromise(true, 5)
      .leftMap((rejVal: number) => rejVal * 2);
    
    expect(result).resolves.toEqual(5);
  });
});