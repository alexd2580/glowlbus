/**
  * Convenience functions for joining rxjs with react.
  * For reference see: https://www.toptal.com/react/rxjs-react-state-management
  */

import { useEffect, useState } from "react";
import { Observable } from "rxjs";

function get<T>(observable: Observable<T>): T {
  let value;
  let found = false;
  observable.subscribe((val) => { value = val; found = true }).unsubscribe();
  if (!found) {
    throw "Failed to get value from observable! Use `useObservableWithDefault` instead.";
  }
  return value as T;
}

// Custom React hook for unwrapping observables
export function useObservableWithDefault<T>(observable: Observable<T>, defaultFactory: T | (() => T)): T {
  const [value, setValue] = useState(defaultFactory);
  useEffect(
    () => {
      // When the observable emits, use setValue to update the component.
      // The emitted value must be different from the one we already have,
      // e.g. when we pick an object, we must create a new replacement object
      // instead of updating the old one. Otherwise the component will not rerender.
      const subscription = observable.subscribe(setValue);
      return () => subscription.unsubscribe();
    },
    // Use stringify as a simple, but expensive, hash function.
    [JSON.stringify(value)]
  );

  return value;
}

export function useObservable<T>(observable: Observable<T>): T {
  return useObservableWithDefault(observable, () => get(observable));
}
