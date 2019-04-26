declare type bindPr<E, T> = <R>(fn: (resVal: T) => Pronad<E, R>) => Pronad<E, R>;
declare type leftMapPr<E, T> = <F>(fn: (rejVal: E) => F) => Pronad<F, T>;
declare type leftBindPr<E, T> = <F>(fn: (rejVal: E) => Pronad<F, T>) => Pronad<F, T>;
declare type cata<E, T> = <R>(rejFn: (rejVal: E) => R, resFn: (resVal: T) => R) => Promise<R>;
export interface Pronad<E, T> {
    map: <R>(fn: (resVal: T) => R) => Pronad<E, R>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    anden: <R>(onfulfilled: (value: PronadInner<E, T>) => R) => Pronad<E, R>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    readonly [Symbol.toStringTag]: string;
    chain: bindPr<E, T>;
    flatMap: bindPr<E, T>;
    bind: bindPr<E, T>;
    rejMap: leftMapPr<E, T>;
    leftMap: leftMapPr<E, T>;
    rejChain: leftBindPr<E, T>;
    rejFlatMap: leftBindPr<E, T>;
    rejBind: leftBindPr<E, T>;
    leftChain: leftBindPr<E, T>;
    leftFlatMap: leftBindPr<E, T>;
    leftBind: leftBindPr<E, T>;
    cata: cata<E, T>;
    fold: cata<E, T>;
    bimap: <E, F, R>(rejFn: (rejVal: E) => F, resFn: (resVal: T) => R) => Pronad<F, R>;
    tap: (fn: (val: T) => void) => Pronad<E, T>;
    doubleTap: (fn: ((rejVal: E | null, resVal: T | null, isRight: boolean) => void) | ((rejVal: E | null, resVal: T | null) => void)) => Pronad<E, T>;
    getOr: (orElse: T, catchValOrFn?: T | ((err: any) => T), execFn?: boolean) => Promise<T>;
    getOrElse: <E>(fn: (rejVal: E) => T, catchFn?: (err: any) => T) => Promise<T>;
}
export declare const PND_LEFT = "LEFT";
export declare const PND_RIGHT = "RIGHT";
export declare const PND_ID: unique symbol;
export declare type PronadInner<E, T> = {
    _pndId: symbol;
} & ({
    state: 'LEFT';
    left: E;
    right: undefined;
} | {
    state: 'RIGHT';
    left: undefined;
    right: T;
});
export {};
//# sourceMappingURL=Pronad.d.ts.map