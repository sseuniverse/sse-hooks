export interface UseSymbolReturn {
  /** Creates a new unique symbol and adds it to the local registry. */
  createSymbol: (description?: string) => symbol;

  /** Returns a symbol from the global symbol registry. */
  getGlobalSymbol: (key: string) => symbol;
  /** Returns the key for a global symbol. */
  getSymbolKey: (symbol: symbol) => string | undefined;

  /** Checks if a value is a symbol. */
  isSymbol: (value: any) => value is symbol;
  /** Gets the description of a symbol. */
  getDescription: (symbol: symbol) => string | undefined;

  /** A collection of standard JavaScript well-known symbols. */
  wellKnownSymbols: {
    iterator: symbol;
    asyncIterator: symbol;
    hasInstance: symbol;
    isConcatSpreadable: symbol;
    species: symbol;
    toPrimitive: symbol;
    toStringTag: symbol;
    unscopables: symbol;
    match: symbol;
    matchAll: symbol;
    replace: symbol;
    search: symbol;
    split: symbol;
  };

  /** Array of symbols created via createSymbol in this instance. */
  symbols: symbol[];
  /** Manually adds a symbol to the local registry. */
  addSymbol: (symbol: symbol) => void;
  /** Removes a symbol from the local registry. */
  removeSymbol: (symbol: symbol) => void;
  /** Clears all symbols from the local registry. */
  clearSymbols: () => void;
}
