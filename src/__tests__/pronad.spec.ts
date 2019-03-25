import 'jest';

function createPromise<T>(resOrRej: boolean, val: T): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(() => (resOrRej ? res : rej)(val), 50);
  });
}

type Done = () => void;

describe('map function', () => {
  it('should map on resolve promises', (done: Done) => {
    // expect.
    createPromise(true, 5)
      .map((resVal: number) => resVal * 5)
      .then((result: number) => {
        expect(result).toBe(10);
        done();
      })
      .catch(done);
  });

  it('', () => {
    
  });
});