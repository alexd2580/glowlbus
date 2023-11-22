import * as R from "ramda";

export const listAsOptions: (values: string[]) => { text: string, value: string }[] = R.map(v => ({ text: v, value: v }));
