import { useEffect, useState } from "react";

import { getSizes } from "@/services/size.service";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product";
import { selectPlusSizes } from "../plusSizes";

interface State {
  products: Product[];
  loading: boolean;
  error: string | null;
  /** The plus-size names we matched (e.g. ["XL","XXL"]). */
  plusSizes: string[];
}

/**
 * Loads products available in plus sizes. Reads the live
 * size list, picks the plus ones, then queries the product
 * list with a comma-joined size filter (?size=XL,XXL),
 * which the backend resolves via size__name__in.
 */
export function usePlusSizeProducts() {
  const [state, setState] = useState<State>({
    products: [],
    loading: true,
    error: null,
    plusSizes: [],
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const sizesResponse = await getSizes();
        const plusSizes = selectPlusSizes(
          sizesResponse.results.map((s) => s.name),
        );

        if (plusSizes.length === 0) {
          if (active) {
            setState({
              products: [],
              loading: false,
              error: null,
              plusSizes: [],
            });
          }
          return;
        }

        const productsResponse = await getProducts({
          size: plusSizes.join(","),
        });

        if (active) {
          setState({
            products: productsResponse.results,
            loading: false,
            error: null,
            plusSizes,
          });
        }
      } catch {
        if (active) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Failed to load plus size products.",
          }));
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return state;
}
