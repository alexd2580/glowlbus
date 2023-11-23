import { BehaviorSubject, Observable, map } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import * as R from "ramda";

import { distinct, filterUndefined } from "../utils/operators";

export class Set<T extends string> {
  entities: BehaviorSubject<{ [id: string]: undefined }>;

  constructor() {
    this.entities = new BehaviorSubject({});
  }

  add(value: T) {
    this.entities.next({ ...this.entities.getValue(), [value]: undefined });
  }

  values() {
    return this.entities.pipe(
      map(entities => Object.keys(entities)),
    );
  }

  clear() {
    this.entities.next({});
  }
}

export class Table<T> {
  entities: BehaviorSubject<{ [id: string]: T }>;

  constructor() {
    this.entities = new BehaviorSubject({});
  }

  ids(): Observable<string[]> {
    // We need distinctUntilChanged so that changing changing entities doesn't trigger a rerender of the list.
    return this.entities.pipe(
      map(table => Object.keys(table)),
      distinct()
    );
  }

  byId(id: string): Observable<T> {
    // We need distinctUntilChanged so that changing other entities doesn't trigger a rerender on every entity.
    return this.entities.pipe(
      map(table => table[id]),
      filterUndefined(),
      distinct()
    );
  }

  get(id: string): T {
    return this.entities.getValue()[id];
  }

  set(id: string, entity: T) {
    const entities = this.entities.getValue();
    entities[id] = entity;
    this.entities.next(entities);
  }

  add(entity: T): string {
    let id = uuidv4();
    this.set(id, entity);
    return id;
  }

  remove(id: string) {
    this.entities.next(R.omit([id], this.entities.getValue()));
  }

  alter(id: string, f: (old: T) => T) {
    const entities = this.entities.getValue();
    entities[id] = f(entities[id]);
    this.entities.next(entities);
  }

  alterField<K extends keyof T>(id: string, field: K, f: (old: T[K]) => T[K]) {
    this.alter(id, (t: T) => ({ ...t, [field]: f(t[field]) }));
  }

  setField<K extends keyof T>(id: string, field: K, value: T[K]) {
    this.alter(id, (t: T) => ({ ...t, [field]: value }));
  }

  clear() {
    this.entities.next({});
  }
}
