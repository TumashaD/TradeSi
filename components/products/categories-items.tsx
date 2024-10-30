'use client'

import { Button } from "@/components/ui/button"
import { getSubCategories } from "@/lib/services/products"
import clsx from "clsx"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

type CategoriesItemsProps = {
  categories: string[]
}

export default function CategoriesItems({ categories }: CategoriesItemsProps) {
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") as string
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<{ [key: string]: string[] }>({})
  
  useEffect(() => {
    async function fetchSubcategories(category: string) {
      if (!subcategories[category]) {
        try {
          const subs = await getSubCategories(category)
          setSubcategories((prev) => ({ ...prev, [category]: subs }))
        } catch (error) {
          console.error("Error fetching subcategories:", error)
        }
      }
    }

    if (hoveredCategory) {
      fetchSubcategories(hoveredCategory)
    }
  }, [hoveredCategory, subcategories])

  const handleMouseEnter = (category: string) => {
    setHoveredCategory(category)
  }

  const handleMouseLeave = () => {
    setHoveredCategory(null)
  }

  return (
    <div className="space-y-2">
      <div>
        <Button
          variant="link"
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
        const link = `/products?category=${category}`
        const subcategoriesList = subcategories[category] || []
        return (
          <div 
            key={category} 
            className="relative"
            onMouseEnter={() => handleMouseEnter(category)}
            onMouseLeave={handleMouseLeave}
          >
            <Button
              variant="link"
              className={clsx(
                "h-9 p-0 underline-offset-4 hover:underline dark:hover:text-neutral-100",
                { "underline underline-offset-4": currentCategory === category }
              )}
            >
              <Link href={link} className="p-4">
                {category}
              </Link>
            </Button>

            {hoveredCategory === category && subcategoriesList.length > 0 && (
              <div 
                className={clsx(
                  "absolute left-0 -mt-1 bg-white dark:bg-neutral-800 shadow-md rounded-md p-2",
                  "w-48 z-50" // Ensure it's above other content
                )}
              >
                {subcategoriesList.map((subcategory) => {
                  const subcategoryLink = `/products?category=${subcategory}`
                  return (
                    <Button
                      key={subcategory}
                      variant="link"
                      className={clsx(
                        "block w-full text-left p-2 hover:bg-gray-200 dark:hover:bg-neutral-700",
                        "underline-offset-4"
                      )}
                    >
                      <Link href={subcategoryLink} className="w-full block">
                        {subcategory}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}