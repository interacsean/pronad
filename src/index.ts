import { monadifyPromises, Pronad } from 'pronad';

const pr: Pronad<Error, number> = Promise.resolve(5);

monadifyPromises();

function createPromise<E, T>(resOrRej: boolean, val: T, errVal: E): Pronad<E, T> {
  return new Promise((res, rej) => {
    setTimeout(() => (resOrRej ? res(val) : rej(errVal)), 50);
  });
}

const result: Pronad<string, number> = createPromise<Error, number>(false, 5, new Error("boo"));
const result2: Promise<string> = result
  .map((resVal: number) => resVal * 2)
  .rejMap((resVal: number) => resVal * 2)
  .map((resVal: number): string => {
    console.log(resVal);
    return 'hi';
  })
  .recover((rejVal: any): string => '5');

const result3: Pronad<string, string> = result2.map(x => x);
