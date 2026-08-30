import { useEffect, useState } from "react";

import { getTypes } from "@/services/type.service";
import { getCategories } from "@/services/category.service";
import { getColors } from "@/services/color.service";
import { getSizes } from "@/services/size.service";

import type {
  Type,
  Category,
  Color,
  Size,
} from "@/types/filter";

/**
 * Shop All filter data.
 *
 * `selectedCategorySlug` drives which Types are shown: with no
 * category selected, every active Type is returned; once a
 * category is selected, only Types linked to it come back
 * (matches whatever an admin assigned that Type to in
 * Admin > Types). Categories, Colors and Sizes are unaffected
 * and only fetched once.
 */
function useFilters(selectedCategorySlug: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<Type[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [loading, setLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(false);

  // Categories, colors, sizes — fetched once.
  useEffect(() => {
    async function fetchStaticFilters() {
      try {
        const [
          categoryResponse,
          colorResponse,
          sizeResponse,
        ] = await Promise.all([
          getCategories(),
          getColors(),
          getSizes(),
        ]);

        setCategories(categoryResponse.results);
        setColors(colorResponse.results);
        setSizes(sizeResponse.results);
      } finally {
        setLoading(false);
      }
    }

    fetchStaticFilters();
  }, []);

  // Types — refetched whenever the selected category changes.
  useEffect(() => {
    let cancelled = false;

    async function fetchTypes() {
      setTypesLoading(true);
      try {
        const response = await getTypes(
          selectedCategorySlug || undefined,
        );
        if (!cancelled) setTypes(response.results);
      } finally {
        if (!cancelled) setTypesLoading(false);
      }
    }

    fetchTypes();

    return () => {
      cancelled = true;
    };
  }, [selectedCategorySlug]);

  return {
    categories,
    types,
    colors,
    sizes,
    loading,
    typesLoading,
  };
}

export default useFilters;
