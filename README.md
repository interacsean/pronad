# Monax

Monax is a suite of functions to help control logic flow.
 
 - Designed to be compatible in promise chains!
 - Retains type information for error states
 - Improved flow-control over promises (as per Fluture library)
 - Simplified terminology available (not so much with Fluture)

It is a also a simplified monad library, but you don't really need to know what
a monad is or how to use one in order to use Monax; we've translated the
traditional mathemathical terms to an intuitive interface for easy onboarding.

## Installing

`npm i monax-js`

## Guide on use


Monax is most useful in typescript, where throwing and catching exceptions in Promises is
[imprecise by design](https://github.com/Microsoft/TypeScript/issues/6283#issuecomment-167851788) 

### Using functionally:

All features are exported as standalone functions.  This becomes more useful in promise chains
(see further below) but is shown here as a starting point:

**Simple but fairly useless example:**
```
// You can import individual functions and types:
import { Monad, val, err, withVal } from 'monax-js';
// or import all using the * pattern:
import * as Mx from 'monax-js'

/**
 * `selectFoo(userId: number | undefined): Monad<number, string>` returns a data container that
 * can hold  the string value or a numeric error, and also holds the state of the
 * data (either val or err).
 */

// mock permissioning
const validUserIds = [1, 2, 3, 5, 8];

function selectFoo(userId: number | undefined): Monad<number, string> {
    // Create a Monax that is either an error of type number, or a value of type string
    const fooMonax: Monad<number, string> = (userId !== undefined && validUserIds.includes(userId))
      ? Mx.val('foo')
      : Mx.err(403);
    
    // If it is a value, perform the following transformation function on the value
    return Mx.withVal((val: string): string => `You selected a ${val}`, fooMonax);
}

```

*Why is this useful*? 

In tradiational javascript, errors are generally thrown within a function, making it annoying to
recover within the same function scope, and impossible to annotate your function to ensure that
a consumer appropriately handles the error.

If the caller of a function did not wrap the call in a `try`/`catch`,
the error may be caught further upstream, or not at all, which may be undesirable.  Additionally
caught errors are of unknown or coerced type.

Simply put, the program flow could not be easily known, nor could it be annotated or
determined by the type signatures.

Returning a container (a monad – our monax) solves this problem of multiple return types.

**A more practical example**

_(This example is in an Express app context but should be simple to follow even if you are not familiar with Express)_

```
import { Request } from 'express';
import { selectFoo } from 'the/above/example.ts';
import { Monax }, * as Mx from 'monax-js';

function checkout(req: Request) {
  // someAuthService doesn't use Monax (we can fix that later)
  const userId: number | undefined = someAuthService.currentUser();
  const selected: Monax<number, string> = selectFoo(userId);

  // this is unnecessary; will see a better way shortly:
  const selectedWithDesc = Mx.withVal(
    (val: string): string => `Thank you for your order, ${val}`,
  );

  Mx.fork(
    // function to run if err
    (err: number) => {
      req.status(err);
      req.send('There was an error processing your order');
    },
    // function to run if val
    (val: string) => {
      req.send(val);
    },
    // (the data to evaluate)
    selectedWithDesc,
  )
}

```

### Chaining

**/!\ Warning: yet to be implemented!**

To chain multiple transformations together, use the utility function `chain`.

(This initalisesa class that contains method aliases for the monax functions.)

```
/**
 * Let's rewrite the checkout route function
 */

function checkout(req: Request) {
  const userId: number | undefined = someAuthService.currentUser();

  // if userId is undefined, fromFalsey will result in an err of number 403
  Mx.chain(Mx.fromFalsey(userId, 403)) // current type of the chained monax: Monax<number, number> - userId or 403
    // pass the userId to selectFoo and use the result
    .ifVal(selectFoo) // current type: Monax<string, number> - 'foo' or 403
    // transform the val
    .withVal((val: string): string => `Thank you for your order, ${val}`)
    // respond accordingly
    .fork(
      (err: number) => {
        req.status(err);
        req.send('There was an error processing your order');
      },
      (val: string) => {
        req.send(val);
      },
    );
}
```

Note, `ifVal` is used with functions that return a Monax and can switch to the 'err' state (aliases `flatMap`, `bind`)

whereas `withVal` is used to apply transformations to the value only, and cannot switch to 'err' state (alias `map`)

### Using monax in a promise chain

[WIP to be tested, should work for implemented functions]

This is where Monax separates itself from other monad libraries...

All functions are curried*, which is perfect for use within a promise chain of `.then`s

_*'Curried' means you can pass a single argument, and you get another function which takes the remainder of the arguments_

```
/**
 * In a real usecase, services/functions like someAuthService.currentUser and selectFoo often return Promises.
 *
 * Let's assume they have been fully implemented as such:
 */
function someAuthService_currentUser(): Promise<number | undefined> { /*...*/ }
function selectFoo(userId: number): Promise<Monax<string, number>> { /*...*/ }

//* Our checkout function would now run like this:

function checkout(req: Request) {
  someAuthService_currentUser()
    .then(uid => Mx.fromFalsey(uid, 403)) // dev note, should the params be reversed for point-free?
    .then(ifVal(selectFoo))
    .then(withVal((val: string): string => `Thank you for your order, ${val}`))
    .then(fork(
      (err: number) => {
        req.status(err);
        req.send('There was an error processing your order');
      },
      (val: string) => {
        req.send(val);
      },
    ))
    // The `.catch` should now only have to deal with completely unexpected errors
    .catch((e: any) => {
      req.status(400);
      req.send('There was an unexpected error');
    });
}
```

### A note on withVal / map and functions that return promises

// todo: write better

use withAwaitedVal / awaitMap to get:

`Promise<Monax<any, YourResponse>>`

rather than:

`Monax<any, Promise<YourResponse>>`

## Recommended approach for higher level architecture when using Monax

- Don't throw errors or reject promises (you will lose type annotation in typescript).  Instead, return / resolve with a Mx.err(yourError).
- Use the `Error` object for your `err` states.  You get a lot of meta data which is also extendable
- Do use Promise chains with the curried monax functions (higher order functions) to control the logic flow
- Don't go overboard with point-free programming or obsess with immediately returning fat-arrow functions.  If it's clearer to write out the function and define a few consts that are technically unnecessary but add context, that is ultimately more important.
- ***Leave obsesive optimisation code for compilers/transpilers***
- Do: remember to `.catch` for unexpected exceptions

## Monad aliases

Monax has traditional monad-like aliases for all functions:

**Monad constructors**
```
right == val
left == err
// fromPromise (no aliases)
fromNull (no aliases)
fromFalsey (no aliases)
```

**Monad transformation functions**
```
map == withVal
awaitMap == withAwaitedVal
flatMap == bind == ifVal
leftMap == errMap == withErr
awaitLeftMap == awaitErrMap == withAwaitedErr
// leftFlatMap == leftBind == errFlatMap == errBind == ifErr
// cata == recover
```

**Utilities**
```
isRight == isVal 
isLeft == isErr

// dev note: consider removing getRight and getLeft
getRight == getVal
getLeft == getErr
//tap == peek
```

## Reflections / roadmap

- Should the map function automatically await promises (i.e. should map's implementation be awaitMap?)
