# Monax

Monax is a suite of functions to help control logic flow.
 
 - Compatible within promise chains
 - Retains type information for error states
 - Improved features (as per Fluture)
 - Simplified terminology (not so much with Fluture)

It is a also a simplified monad library, but you don't really need to know what
a monad is or how to use one in order to use Monax; we've tried to translate the
traditional mathematical terms to an intuitive interface for easy onboarding.

## Installing

`npm i monax-js`

## Using

Monax is most useful in typescript, where throwing and catching results in Promises is
[unprecise type by design](https://github.com/Microsoft/TypeScript/issues/6283#issuecomment-167851788) 

**Simple but fairly useless example:**
```
// You can import individual functions and types:
import { Monad } from 'monaxjs';
// or import all using the * pattern:
import * as Mx from 'monaxjs'

function createMonax(x: boolean): Monad<number, string> {
    // Create a Monax that is either an error that is a number, or a  value that is a string
    const myMonax: Monad<number, string> = x ? Mx.val('foo') : Mx.err(404);
    
    // If it is a value, perform the following function on the value
    return Mx.withVal((val: string): string => `${val}-bar`, myMonax);
}

/**
 * createMonax(): Monad<number, string> returns a data container that can hold 
 * either the string value or a numeric error, and also carries the state
 * of the data (val or err).
 */  
```

*Why is this useful*? 

Previously, errors were generally thrown, making it difficult to recover within the same scope
 (or returned dogily as `false` / `null`).

If the caller of a function that could throw did not call that function within a `try`,
the error may be caught further upstream which may be undesirable.  

Simply put, the program flow could not be easily known, nor could it be annotated or
determined by the type signatures.

**A more practical example**

```
// 

```


## Monad aliases

Monax has monad aliases for all functions:

```
// Monad constructors
right == val
left == err 

// Functors
map == withVal
flatMap == ifVal


// Utilities
isRight == isVal 
isLeft == isErr
getRight == getVal
getLeft == getErr
```

error states and  

 - Promises must have all the methods, so that async fns can be .mapped
 - chain methods must result in a Pronad so we can track the rejected type
 - :. Pronad must be ambient type so that Promise knows about it
 - Pronad definition should inherit Promise prototype to maintain consency


 - How bout Promise<T>.bind => Promise<Pnd<E, T>>.  recover works on resolved promise of Promise<{ left: true, value: T }>, and catch still catches errors
 - in fact why doesn't recover take ((l: E) => T, (err: any) => T)

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
function validateWinner(resVal: string): Pronad<Error, string> {
  return Math.random() > 0.5
    ? Promise.resolve(resVal)
    : Promise.reject(new Error('cheating involved');
}

const competitionResult: Pronad<Error, string> = playTheGame
  .bimap(
    // only runs on rejected
    (rejVal: boolean): Error => new Error('You lost the game'),
    // only runs on resolved
    (resVal: boolean): string => 'Congratulations you won'
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
    : 'Unfortunately you did not win, but we can\'t tell you why')
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

`npm i pronad`


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

Promises flatten by design.  If you try to form a `Pronad<E, Pronad<F, T>>`, it will flatten to `Pronad<F, T>`.

**Voiding the type contract**

If a function throws, or you return a `Promise.reject()` from a `.map`, your Pronad will end up in the rejected state, even though the `.map` by definition should retain the state of the monad.

There's still more exploring to do around how solid the rejected side of the `Pronad` type is.

*Them's the breaks*

****

#### Todo
 - Experiment with alternative rej typing in the Pronad<E,T>
 - Explore whether recover fn can be optional / default to identity and still error if type is not maintained
 - Write documentation on each method
 - Alternative to Promise.all to convert `Array<Pronad<bad, good>>` and collect all values into a `Pronad<Array<bad>, Array<good>>`.
 - Provide an alternative import file to auto-initialise(?)
