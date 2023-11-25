import rxjs from "rxjs";
import * as R from "ramda";

export const keys = <T, K extends keyof T>() => rxjs.map((object: T) => Object.keys(object) as K[]);
export const values = <T, K extends keyof T>() => rxjs.map((object: T) => Object.values(object) as T[K][]);
export const distinctUntilChanged = <T,>() => rxjs.distinctUntilChanged<T>((a, b) => R.equals(a, b));
export const filterUndefined = <T,>() => rxjs.filter<T>(x => x !== undefined);
