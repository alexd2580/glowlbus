export interface IdTypeProvider<TIdType extends string> {
    readonly _idType: TIdType;
}

// Define what an ID pattern of type `TIdProvider` looks like:
export type ID<TIdTypeProvider, TId extends string = string>
  = TIdTypeProvider extends IdTypeProvider<infer TIdType>
    ? `${TIdType}-${TId}`
    : TIdTypeProvider extends string
      ? `${TIdTypeProvider}-${TId}`
      : never;
