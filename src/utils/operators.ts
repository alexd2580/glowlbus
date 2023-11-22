import { distinctUntilChanged, filter, map } from "rxjs";
import * as R from "ramda";

export const keys = map((object: object) => Object.keys(object));
export function distinct<T>() { return distinctUntilChanged<T>((a, b) => R.equals(a, b)); }
export function filterUndefined<T>() { return filter<T>(x => x !== undefined); }
