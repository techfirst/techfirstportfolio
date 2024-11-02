/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";

import Link from "next/link";

export default function CategoryBrowser() {
  const [categories, setCategories] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setCategories(data.categories);
      } catch (err) {
        setError("Failed to load categories. Please try again later.");
        console.error("Error in CategoryBrowser:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Browse by categories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              href={`/categories/${category.slug}`}
              key={category.id}
              className="block bg-white rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl h-full flex flex-col overflow-hidden border border-gray-200"
            >
              <div className="p-6 flex-grow">
                <h3 className="font-semibold text-lg mb-2 text-gray-800">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">
                  Explore category →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
