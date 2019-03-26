import './types/Promise';
import { monadifyPromises, Pronad } from 'pronad';

const pr: Pronad<Error, number> = Promise.resolve(5);

monadifyPromises();

function createPromise<T>(resOrRej: boolean, val: T): Promise<T> {
  return new Promise((res, rej) => {
    setTimeout(() => (resOrRej ? res : rej)(val), 50);
  });
}

const result: Pronad<Error, string> = createPromise(true, 5)
  .map((resVal: number) => resVal * 2)
  .map((resVal: number) => {
    console.log(resVal);
    return 'hi';
  });

const result2: Pronad<string, string> = result.map(x => x);
