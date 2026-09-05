"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { ProductCategory } from "../domain/types";

const categories: readonly ProductCategory[] = ["smartphones", "laptops", "electronics"];
const maximumQueryLength = 80;

export type CatalogFilterState = {
  query: string;
  category: ProductCategory | "all";
};

function isCategory(value: string | null): value is ProductCategory {
  return value !== null && categories.includes(value as ProductCategory);
}

export function parseCatalogFilters(params: URLSearchParams): CatalogFilterState {
  const category = params.get("category");
  return {
    query: params.get("q")?.trim().slice(0, maximumQueryLength) ?? "",
    category: category === "all" || isCategory(category) ? category : "all",
  };
}

export function createCatalogSearchParams(current: URLSearchParams, filters: CatalogFilterState): URLSearchParams {
  const next = new URLSearchParams(current);
  const query = filters.query.trim().slice(0, maximumQueryLength);
  if (query) next.set("q", query);
  else next.delete("q");
  if (filters.category === "all") next.delete("category");
  else next.set("category", filters.category);
  return next;
}

export function useCatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const filters = parseCatalogFilters(searchParams);
  const [searchText, setSearchText] = useState(filters.query);
  const synchronizedQuery = useRef(filters.query);

  useEffect(() => {
    if (filters.query === synchronizedQuery.current) return;
    synchronizedQuery.current = filters.query;
    const timer = window.setTimeout(() => setSearchText(filters.query));
    return () => window.clearTimeout(timer);
  }, [filters.query]);

  const replace = useCallback((nextFilters: CatalogFilterState) => {
    const params = createCatalogSearchParams(new URLSearchParams(searchParamsString), nextFilters);
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  }, [router, searchParamsString]);

  useEffect(() => {
    if (searchText === filters.query) return;
    const timer = window.setTimeout(() => replace({ ...filters, query: searchText }), 250);
    return () => window.clearTimeout(timer);
  }, [filters, replace, searchText]);

  return {
    filters,
    searchText,
    setSearchText,
    setCategory: (category: CatalogFilterState["category"]) => replace({ ...filters, category }),
    clearFilters: () => {
      setSearchText("");
      replace({ query: "", category: "all" });
    },
  };
}
