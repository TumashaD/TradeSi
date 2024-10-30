"use client";
import { Button } from "@/components/ui/button";
import { getSubCategories } from "@/lib/services/products";
import clsx from "clsx";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type CategoriesItemsProps = {
  categories: string[];
};

export default function CategoriesItems({ categories }: CategoriesItemsProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") as string;
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    async function fetchSubcategories(category: string) {
      if (!subcategories[category]) {
        try {
          const subs = await getSubCategories(category);
          setSubcategories((prev) => ({ ...prev, [category]: subs }));
        } catch (error) {
          console.error("Error fetching subcategories:", error);
        }
      }
    }

    if (hoveredCategory) {
      fetchSubcategories(hoveredCategory);
    }
  }, [hoveredCategory, subcategories]);

  // Delay state reset when leaving dropdown area
  let timeoutId: NodeJS.Timeout;
  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => setHoveredCategory(null), 200);
  };

  const handleMouseEnter = (category: string) => {
    clearTimeout(timeoutId); // Clear any scheduled state resets
    setHoveredCategory(category);
  };

  return (
    <>
      <div>
        <Button
          variant={"link"}
          className={clsx(
            "h-9 underline-offset-4 hover:underline dark:hover:text-neutral-100 p-0",
            { "underline underline-offset-4": !currentCategory }
          )}
        >
          <Link href="/products" className="p-4">
            All
          </Link>
        </Button>
      </div>

      {categories?.map((category) => {
        const link = `/products?category=${category}`;
        const subcategoriesList = subcategories[category] || [];
        return (
          <div 
            key={category} 
            className="relative flex items-center space-x-2"
            onMouseEnter={() => handleMouseEnter(category)}
            onMouseLeave={handleMouseLeave}
          >
            <Button
              variant={"link"}
              className={clsx(
                "h-9 p-0 underline-offset-4 hover:underline dark:hover:text-neutral-100",
                { "underline underline-offset-4": currentCategory === category }
              )}
            >
              <Link href={link} className="p-4">
                {category}
              </Link>
            </Button>

            {/* Subcategories dropdown */}
            {hoveredCategory === category && subcategoriesList.length > 0 && (
              <div 
                className="absolute left-full -ml-1 top-0 w-48 bg-white dark:bg-neutral-800 shadow-md rounded-md p-2"
                style={{ zIndex: 1000 }}
                onMouseEnter={() => handleMouseEnter(category)}  // Keep open when hovering over dropdown
                onMouseLeave={handleMouseLeave}                  // Delay closing when leaving dropdown
              >
                {subcategoriesList.map((subcategory) => {
                  const subcategoryLink = `/products?category=${subcategory}`;
                  return (
                    <Button
                      key={subcategory}
                      variant={"link"}
                      className={clsx(
                        "block w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-neutral-700",
                        "underline-offset-4"
                      )}
                    >
                      <Link href={subcategoryLink} className="w-full block">
                        {subcategory}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
