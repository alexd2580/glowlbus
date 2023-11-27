import rxjs from "rxjs";
import * as R from "ramda";

export const keys = <T extends object, K extends keyof T>() =>
  rxjs.map((object: T) => Object.keys(object) as K[]);
export const values = <T extends object, K extends keyof T>() =>
  rxjs.map((object: T) => Object.values(object) as Exclude<T[K], undefined>[]);
export const prop = <T extends object, K extends keyof T>(id: K) =>
  rxjs.map((object: T) => object[id]);
export const distinctUntilChanged = <T,>() =>
  rxjs.distinctUntilChanged<T>((a, b) => R.equals(a, b));

// We explicitly cast filter undefined into an operator function, which, by implementation,
// it is not, because the type has to change, since we remove undefined.
export const filterUndefined = <T,>() =>
  rxjs.filter<T>(x => x !== undefined) as rxjs.OperatorFunction<T, Exclude<T, undefined>>;
