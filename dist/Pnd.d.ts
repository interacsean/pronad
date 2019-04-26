declare type bindPr<E, V> = <R>(fn: (resVal: V) => Pnd<E, R>) => Pnd<E, R>;
declare type leftMapPr<E, V> = <F>(fn: (rejVal: E) => F) => Pnd<F, V>;
declare type leftBindPr<E, V> = <F, R>(fn: (rejVal: E) => Pnd<F, V>) => Pnd<F, V>;
export interface Pnd<E, V> {
    map: <R>(fn: (resVal: V) => R) => Pnd<E, R>;
    then: <R>(onfulfilled: (value: any) => R) => Pnd<E, R>;
    catch: <R>(onerror: (err: any) => R) => Pnd<any, R>;
    chain: bindPr<E, V>;
    flatMap: bindPr<E, V>;
    bind: bindPr<E, V>;
    rejMap: leftMapPr<E, V>;
    leftMap: leftMapPr<E, V>;
    rejChain: leftBindPr<E, V>;
    rejFlatMap: leftBindPr<E, V>;
    rejBind: leftBindPr<E, V>;
    leftChain: leftBindPr<E, V>;
    leftFlatMap: leftBindPr<E, V>;
    leftBind: leftBindPr<E, V>;
}
export declare const PND_LEFT: unique symbol;
export declare const PND_RIGHT: unique symbol;
export declare type PndInner<E, T> = {
    state: Symbol;
    left: E | undefined;
    right: T | undefined;
};
export {};
//# sourceMappingURL=Pnd.d.ts.map