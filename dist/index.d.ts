import { Pnd, PND_LEFT, PND_RIGHT } from './Pnd';
export { Pnd, PND_LEFT, PND_RIGHT };
interface PronadConstructor {
    Left<E>(val: E): Pnd<E, never>;
    Right<T>(val: T): Pnd<never, T>;
}
export declare const Pronad: PronadConstructor;
export declare const monadifyPromises: () => void;
//# sourceMappingURL=index.d.ts.map