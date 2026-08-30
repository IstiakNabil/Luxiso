import { useEffect, useState } from "react";

import { getCategories } from "@/services/category.service";
import type { Category } from "@/types/filter";

/**
 * Loads real categories for the mega-menu so links always
 * reflect the live catalog (never hardcoded slugs).
 */
export function useMenuCategories() {
  const [categories, setCategories] = useState<Category[]>(
    [],
  );

  useEffect(() => {
    let active = true;

    getCategories()
      .then((data) => {
        if (active) setCategories(data.results);
      })
      .catch(() => {
        if (active) setCategories([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return categories;
}
