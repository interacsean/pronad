/**
 * only thing is, awaiting something that hasn't been 'settled', will use then
 * type sig which goes to T, not Pronad<E, T>, which is actually innacurate
 */
import { Pronad, PND_LEFT, PND_RIGHT } from './Pronad';
export { Pronad, PND_LEFT, PND_RIGHT };
interface PronadConstructor {
    Left<E, T>(val: E | Promise<E>): Pronad<E, T>;
    Right<E, T>(val: T | Promise<T>): Pronad<E, T>;
    fromPromise<E, T>(promise: Promise<T>, catchFn?: (e: any) => E): Pronad<E, T>;
    fromFalsey<E, T>(val: T | undefined | null | false, ifFalsey?: E): Pronad<E, T>;
    fromNull<E, T>(val: T | undefined | null, ifNull?: E): Pronad<E, T>;
    makeCatchGuard: <E>(catchFn: (err: any) => E) => <T, R>(mappedFn: ((val: T) => Promise<R>) | ((val: T) => Pronad<E, R>)) => ((val: T) => Pronad<E, R>);
}
export declare const P: PronadConstructor;
export declare const monadifyPromises: (cfg?: {}) => void;
//# sourceMappingURL=index.d.ts.map