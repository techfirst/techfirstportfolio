/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import Image from "next/image";

import { truncateText } from "@/lib/utils";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [services, setServices] = useState<any[]>([]);

  const [category, setCategory] = useState<any | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchCategoryAndServices() {
      try {
        const [categoriesResponse, servicesResponse] = await Promise.all([
          fetch("/api/categories").then((res) => res.json()),
          fetch("/api/entries?page=1&limit=100").then((res) => res.json()),
        ]);

        if (categoriesResponse.error) {
          throw new Error(categoriesResponse.error);
        }

        const foundCategory = categoriesResponse.categories.find(
          (cat: any) => cat.slug === params.slug
        );

        if (!foundCategory) {
          setError("Category not found");
          setIsLoading(false);
          return;
        }

        setCategory(foundCategory);

        const filteredServices = servicesResponse.services.filter(
          (service: any) =>
            service.categories && service.categories.includes(foundCategory.id)
        );

        setServices(filteredServices);
      } catch (err) {
        setError(
          "Failed to load category and services. Please try again later."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategoryAndServices();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f2937]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1f2937]">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-gray-200 bg-[#1f2937] hover:bg-gray-700 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-gray-900">
            {category?.name}
          </h1>
          <p className="text-gray-600 mb-8">{category?.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <a
                key={`service-${index}`}
                href={`/${service.Slug.value}`}
                className="group bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col h-full border border-gray-100"
              >
                {service.Image && (
                  <div className="relative w-full pt-[56.25%] overflow-hidden">
                    <Image
                      src={service.Image.value}
                      alt={service.Name.value}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3}
                    />
                  </div>
                )}

                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-semibold text-xl mb-3 text-gray-900">
                    {service.Name.value}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {truncateText(service.Description.value, 120)}
                  </p>

                  {service.Tags?.value?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {service.Tags.value
                        .slice(0, 3)
                        .map((tag: string, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-full border border-gray-100"
                          >
                            {tag}
                          </span>
                        ))}
                      {service.Tags.value.length > 3 && (
                        <span className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded-full border border-gray-100">
                          +{service.Tags.value.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>

          {services.length === 0 && (
            <p className="text-center mt-8 text-gray-600">
              No services found in this category.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
