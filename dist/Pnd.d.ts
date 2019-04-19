export interface Pnd<E, V> {
    map: <R>(fn: (resVal: V) => R) => Pnd<E, R>;
    then: <R, T>(onfulfilled: (value: any) => R) => Pnd<E, R>;
    catch: <R, T>(onerror: (err: any) => R) => Pnd<E, R>;
}
export declare const PND_LEFT: unique symbol;
export declare const PND_RIGHT: unique symbol;
export declare type PndInner<E, T> = {
    state: Symbol;
    left: E | undefined;
    right: T | undefined;
};
//# sourceMappingURL=Pnd.d.ts.map