This module:

- Extends the native Promise prototype to include monad methods and TypeScript typings.
- Provides a `Pronad<Rej, Res>` TypeScript type to annotate the rejected state of a promise

It was built to ease frustrations while trying to bridge the gap when working with native Promises which lacked features and structure around types, and arbitrary monad libraries which lacked async abilities.

(I recommend checking out the Fluture library as another more advanced alternative.)

## How to use

An example...

```
/*** Some function that returns a Promise ***/
function playTheGame(): Pronad<boolean, boolean> { 
  return Math.random() > 0.5
    ? Promise.resolve(true)
    : Promise.reject(false);
}

/*** Another function that returns a Promise ***/
function validateWinner((resVal: string)): Pronad<Error, string> {
  return Math.random() > 0.5
    ? Promise.resolve(resVal)
    : Promise.reject(new Error('cheating involved');
}

const competitionResult: Pronad<Error, string> = playTheGame
  .bimap(
    // only runs on rejected
    (rejVal: boolean): Error => new Error('You lost the game'))
    // only runs on resolved
    (resVal: boolean): string => `Congratulations you won`)
  )
  // only runs on resolved, and should return concrete value or resolved promise
  .map(someAddPlayerScoreToStringFn)
  // `validateWinner` only runs on resolved, and returns another Promise / Pronad
  .flatMap(validateWinner);
  // You could keep chaining here instead of assigning to a const

const forRender: string = await competitionResult
  // simply switches the rejected value to same type as resolved so it can be safely awaited
  .recover((rejVal: Error | any): string => typeof rejVal === 'Error'
    ? `Unfortunately you lost: ${rejVal.message}`
    : 'Unfortunately you lost, we can\'t tell you why')
```

The `Pronad` type is interchangable with Promises, they only offer the extra generic slot for notation of the type of the Promise's rejected value*. 

### Promise method equivalency

Without delving into monad thoery, here's a cheat-sheet on the methods available:

**.map -> .then** – for functions which return a concrete value, or intend to return a resolved promise.

**.flatMap -> .then** – for functions which return a Promise (resolved or rejected).

**.rejMap -> .catch** – transform your rejected value; the return will automatically be `Promise.reject()`ed.

**.rejFlatMap -> .catch** – for functions which return a Promise (resolved or rejected), but is only to be run on rejected state, with the rejected value.

**.cata(rejFn, resFn) -> .then(resFn, rejFn)** – to resolve to a standardised type for final consumption by the application

**.recover -> .catch** also serves this purpose, but only runs for rejected state and must return a value the same type as that of the resolved state.

## Installation

**Install the dependency:**

`npm i -S pronad`


**Call the initialiser**

Somewhere in your bootstrapping code, include:

```
import { monadifyPromises } from 'pronad';

monadifyPromises();
```
(We'd wanted to keep mutating native prototypes as an opt-in situation :D)


**For TypeScript projects:**

Wherever you declare your types, create a file:

```
// pronad.d.ts

import 'pronad/src/ambient';

```
(or include in your existing type bootstrap)

This adds the monadic methods to the Promise interface.

## Caveats / notes on usage

Underlying this library are the inherantly problematic javascript Promises.

**`.catch` catches all errors**

Any function used to operate on the rejected side of the promise is evaluated with `.catch` behind the scenes.  This function inherantly must accept an `any`, since any errors that are thrown (willingly or otherwise) will end up in this block.

Functions used in `rejMap`, `rejFlatMap`, `cata` which deal with the rejected state are annotated with `rejFn: (E | any) => ...` (which of course, is simply `any`); the `E` is given as a indicative only.

**You can't wrap Promises**

Promises flatten by design.  You can't try to form a `Pronad<E, Pronad<F, T>>`.  It will flatten to `Pronad<F, T>`.

**Voiding the type contract**

If a function throws, or you return a `Promise.reject()` from a `.map`, your Pronad will end up in the rejected state, even though the `.map` by definition should retain the state of the monad.

There's still more exploring to do around how solid the rejected side of the `Pronad` type is.

*Them's the breaks*

****

#### Todo
 - Explore whether recover fn can be optional / default to identity and still error if type is not maintained
 - Test and implement fromFalsey
 - Implement tap, doubleTap, bimap
 - Write documentation on each method
 - Alternative to Promise.all to convert `Array<Pronad<bad, good>>` and collect all values into a `Pronad<Array<bad>, Array<good>>`.
 - Provide an alternative import file to auto-initialise(?)