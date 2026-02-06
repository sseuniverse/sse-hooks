import { useState, useCallback, useMemo, useRef } from "react";
import { UseSymbolReturn } from "./types";

/**
 * Custom hook for managing ES6 Symbols. Provides utilities to create unique symbols,
 * manage a registry of symbols, and access well-known symbols.
 * * @category utilities
 * @returns {UseSymbolReturn} Utilities for creating, retrieving, and managing symbols.
 * @public
 * @see [Documentation](/docs/use-symbol)
 * @example
 * ```tsx
 * const { createSymbol, wellKnownSymbols } = useSymbol();
 * const myId = createSymbol('my-id');
 * * console.log(wellKnownSymbols.iterator); // Symbol(Symbol.iterator)
 * ```
 */
export function useSymbol(): UseSymbolReturn {
  const [symbols, setSymbols] = useState<symbol[]>([]);
  const symbolsRef = useRef<Set<symbol>>(new Set());

  const createSymbol = useCallback((description?: string): symbol => {
    const newSymbol = Symbol(description);
    setSymbols((prev) => [...prev, newSymbol]);
    symbolsRef.current.add(newSymbol);
    return newSymbol;
  }, []);

  const getGlobalSymbol = useCallback((key: string): symbol => {
    return Symbol.for(key);
  }, []);

  const getSymbolKey = useCallback((symbol: symbol): string | undefined => {
    return Symbol.keyFor(symbol);
  }, []);

  const isSymbol = useCallback((value: any): value is symbol => {
    return typeof value === "symbol";
  }, []);

  const getDescription = useCallback((symbol: symbol): string | undefined => {
    return symbol.description;
  }, []);

  const addSymbol = useCallback((symbol: symbol) => {
    if (!symbolsRef.current.has(symbol)) {
      setSymbols((prev) => [...prev, symbol]);
      symbolsRef.current.add(symbol);
    }
  }, []);

  const removeSymbol = useCallback((symbol: symbol) => {
    if (symbolsRef.current.has(symbol)) {
      setSymbols((prev) => prev.filter((s) => s !== symbol));
      symbolsRef.current.delete(symbol);
    }
  }, []);

  const clearSymbols = useCallback(() => {
    setSymbols([]);
    symbolsRef.current.clear();
  }, []);

  const wellKnownSymbols = useMemo(
    () => ({
      iterator: Symbol.iterator,
      asyncIterator: Symbol.asyncIterator,
      hasInstance: Symbol.hasInstance,
      isConcatSpreadable: Symbol.isConcatSpreadable,
      species: Symbol.species,
      toPrimitive: Symbol.toPrimitive,
      toStringTag: Symbol.toStringTag,
      unscopables: Symbol.unscopables,
      match: Symbol.match,
      matchAll: Symbol.matchAll,
      replace: Symbol.replace,
      search: Symbol.search,
      split: Symbol.split,
    }),
    [],
  );

  return {
    createSymbol,
    getGlobalSymbol,
    getSymbolKey,
    isSymbol,
    getDescription,
    wellKnownSymbols,
    symbols,
    addSymbol,
    removeSymbol,
    clearSymbols,
  };
}
