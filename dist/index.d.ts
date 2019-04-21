import { Pnd } from './Pnd';
export { Pnd };
interface PronadConstructor {
    unit<T>(val: T): Pnd<never, T>;
    fromFalsey<E, T>(val: T | undefined | null | false, ifFalsey?: E): Pnd<E, T>;
    fromNull<E, T>(val: T | undefined | null, ifNull?: E): Pnd<E, T>;
}
export declare const Pronad: PronadConstructor;
export declare const monadifyPromises: () => void;
//# sourceMappingURL=index.d.ts.map