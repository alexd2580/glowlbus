import { BehaviorSubject, Observable } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import * as R from "ramda";

import { keys, values, distinctUntilChanged, filterUndefined, prop } from "../utils/operators";

export class Map<Id extends string | number | symbol, Value> {
  entries: BehaviorSubject<{ [key in Key]?: Value; }>;

  constructor() {
    this.entries = new BehaviorSubject({});
  }

  keys(): Observable<Key[]> {
    // We need distinctUntilChanged so that changing entities doesn't trigger a rerender of the list.
    return this.entries.pipe(keys(), distinctUntilChanged());
  }

  values(): Observable<Value[]> {
    return this.entries.pipe(values(), distinctUntilChanged());
  }

  byId(key: Key): Observable<Value> {
    // We need distinctUntilChanged so that changing other entities doesn't trigger a rerender on every entity.
    return this.entries.pipe(prop(key), filterUndefined(), distinctUntilChanged());
  }

  get(key: Key): Value | undefined {
    return this.entries.getValue()[key];
  }

  set(key: Key, entity: Value) {
    const entities = this.entries.getValue();
    entities[key] = entity;
    this.entries.next(entities);
  }

  remove(key: Key) {
    // TODO fix typings.
    this.entries.next(R.omit([key as string], this.entries.getValue()) as { [key in Key]?: Value; });
  }

  alter(key: Key, f: (old: Value | undefined) => Value | undefined) {
    const entries = this.entries.getValue();
    entries[key] = f(entries[key]);
    this.entries.next(entries);
  }

  clear() {
    this.entries.next({});
  }
}

export class Table<Id extends string | number | symbol, Value> extends Map<Id, Value> {
  add(entity: Value): Id {
    let id = uuidv4() as Id; // TODO type this properly
    this.set(id, entity);
    return id;
  }

  alterField<K extends keyof Value>(id: Id, field: K, f: (old: Value[K]) => Value[K]) {
    this.alter(id, (t: Value | undefined) => t && ({ ...t, [field]: f(t[field]) }));
  }

  setField<K extends keyof Value>(id: Id, field: K, value: Value[K]) {
    this.alter(id, (t: Value | undefined) => t && ({ ...t, [field]: value }));
  }
}

export class Set<Value extends string | number | symbol> extends Map<Value, undefined> { };
