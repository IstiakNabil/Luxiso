import { useEffect, useState } from "react";

import { getBrands } from "@/services/brand.service";
import { getCategories } from "@/services/category.service";
import { getColors } from "@/services/color.service";
import { getSizes } from "@/services/size.service";

import type {
  Brand,
  Category,
  Color,
  Size,
} from "@/types/filter";

function useFilters() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFilters() {
      try {
        const [
          categoryResponse,
          brandResponse,
          colorResponse,
          sizeResponse,
        ] = await Promise.all([
          getCategories(),
          getBrands(),
          getColors(),
          getSizes(),
        ]);

        setCategories(categoryResponse.results);
        setBrands(brandResponse.results);
        setColors(colorResponse.results);
        setSizes(sizeResponse.results);
      } finally {
        setLoading(false);
      }
    }

    fetchFilters();
  }, []);

  return {
    categories,
    brands,
    colors,
    sizes,
    loading,
  };
}

export default useFilters;