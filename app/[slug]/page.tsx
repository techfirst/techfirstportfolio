/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";

export default function ServicePage({ params }: { params: { slug: string } }) {
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchService() {
      try {
        const response = await fetch(`/api/service/${params.slug}`);
        const data = await response.json();

        if (data.error) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error(data.error);
        }

        setService(data.service);
      } catch (error) {
        console.error("Failed to fetch service:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    }
    fetchService();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!service) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <main className="container mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-300 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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

        <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="relative h-64 sm:h-80 md:h-96">
            <Image
              src={service.Image.value}
              alt={service.Name.value as string}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              priority={true}
            />
          </div>
          <div className="p-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">
              {service.Name.value}
            </h1>
            {service.Tags &&
              service.Tags.value &&
              service.Tags.value.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.Tags.value.map((tag: string, tagIndex: number) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            <div className="prose prose-lg max-w-none text-gray-600 mb-8">
              <p>{service.Description.value}</p>
            </div>
            <a
              href={service.Url.value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-orange-300 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-400 transition duration-300 ease-in-out"
            >
              Visit {service.Name.value}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
