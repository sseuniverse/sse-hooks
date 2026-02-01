export interface UseSymbolReturn {
  // Create new unique symbols
  createSymbol: (description?: string) => symbol;

  // Global symbol registry operations
  getGlobalSymbol: (key: string) => symbol;
  getSymbolKey: (symbol: symbol) => string | undefined;

  // Symbol utilities
  isSymbol: (value: any) => value is symbol;
  getDescription: (symbol: symbol) => string | undefined;

  // Well-known symbols
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

  // Symbol collection management
  symbols: symbol[];
  addSymbol: (symbol: symbol) => void;
  removeSymbol: (symbol: symbol) => void;
  clearSymbols: () => void;
}
