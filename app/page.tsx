/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { Search, Filter, ChevronDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Checkbox } from "@/components/ui/checkbox";

import Image from "next/image";

import * as React from "react";

import * as AccordionPrimitive from "@radix-ui/react-accordion";

import clsx from "clsx";

import { truncateText } from "@/lib/utils";

import { useRouter, useSearchParams } from "next/navigation";

import debounce from "lodash/debounce";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import CategoryButtons from "./components/CategoryButtons";

import { getFieldValue } from '@/lib/helpers';

interface Filter {
  fieldName: string;
  fieldType: string;
  options: string[];
}

interface FilterOption {
  value: string;
  label: string;
}

const cn = (...classes: (string | undefined)[]) => {
  return clsx(classes);
};

export default function Component() {
  const router = useRouter();

  const [searchParamsState, setSearchParamsState] =
    useState<URLSearchParams | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const [services, setServices] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filter[]>([]);

  const [openItems, setOpenItems] = React.useState<string[]>([]);

  const [showAllServices, setShowAllServices] = useState(false);

  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [filteredServices, setFilteredServices] = useState<any[]>([]);

  const [categories, setCategories] = useState<any[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Add this state for category loading

  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  const [isCategoryMapReady, setIsCategoryMapReady] = useState(false);

  const [submitFields, setSubmitFields] = useState<any[]>([]);
  const [submitFormData, setSubmitFormData] = useState<Record<string, any>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFirstRender = useRef(true);

  const handleAccordionChange = (value: string[]) => {
    setOpenItems(value);
  };

  useEffect(() => {
    if (!isFirstRender.current) return;

    // This effect runs only on the client side
    const params = new URLSearchParams(window.location.search);
    setSearchParamsState(params);

    // Parse categories from URL
    const urlCategories = params.get("categories")?.split(",") || [];
    setSelectedCategories(urlCategories);

    // Parse other filters
    const urlFilters: Record<string, string[]> = {};
    params.forEach((value, key) => {
      if (key !== "categories") {
        urlFilters[key] = value.split(",");
      }
    });

    setActiveFilters(urlFilters);
  }, []);

  // Modify the initial data fetch
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setIsCategoriesLoading(true);
        setIsLoading(true);

        // Fetch categories, entries, and filters in parallel
        const [categoriesResponse, entriesResponse, filtersResponse] =
          await Promise.all([
            fetch("/api/categories").then((res) => res.json()),
            fetch("/api/entries?page=1&limit=10").then((res) => res.json()),
            fetch("/api/filters").then((res) => res.json()),
          ]);

        if (categoriesResponse.error) throw new Error(categoriesResponse.error);
        if (entriesResponse.error) throw new Error(entriesResponse.error);
        if (filtersResponse.error) throw new Error(filtersResponse.error);

        // Set the states with the correct response properties
        setFilters(filtersResponse.filters);
        setCategories(categoriesResponse.categories);
        setServices(entriesResponse.services);
        setFilteredServices(entriesResponse.services);

        // Create category map
        const newCategoryMap: Record<string, string> = {};
        categoriesResponse.categories.forEach((category: any) => {
          newCategoryMap[category.id] = category.name;
        });
        setCategoryMap(newCategoryMap);
        setIsCategoryMapReady(true);
      } catch (err) {
        setError("Failed to load data. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
        setIsCategoriesLoading(false);
      }
    }

    fetchInitialData();
  }, []); // Only run once on mount

  // Modify the debouncedFetchData to only handle filtering
  const debouncedFetchData = useCallback(
    debounce((services: any[], filters: Record<string, string[]>) => {
      const filteredServices = applyFiltersToServices(
        services,
        filters,
        selectedCategories
      );
      setFilteredServices(filteredServices);
    }, 300),
    [selectedCategories]
  );

  // Update useEffect for filter changes
  useEffect(() => {
    if (services.length > 0) {
      debouncedFetchData(services, activeFilters);
    }
  }, [activeFilters, services, debouncedFetchData]);

  const applyFiltersToServices = (
    services: any[],
    filters: Record<string, string[]>,
    selectedCategories: string[]
  ) => {
    return services.filter((service) => {
      // Check if the service belongs to any of the selected categories
      if (selectedCategories.length > 0) {
        const serviceCategories = service.categories || [];
        if (
          !selectedCategories.some((cat) => serviceCategories.includes(cat))
        ) {
          return false;
        }
      }

      return Object.entries(filters).every(([key, values]) => {
        if (values.length === 0) return true;

        // Special handling for Tags field which has a nested value array
        if (key === "Tags") {
          const tagValues = service[key]?.value || [];
          return values.some((value) => tagValues.includes(value));
        }

        const serviceValue = service[key]?.value;

        // Rest of your existing comparisons...
        if (typeof serviceValue === "boolean") {
          return values.includes(serviceValue.toString());
        }

        if (typeof serviceValue === "number") {
          return values.some((value) => parseFloat(value) === serviceValue);
        }

        if (serviceValue instanceof Date) {
          return values.some(
            (value) => new Date(value).getTime() === serviceValue.getTime()
          );
        }

        if (typeof serviceValue === "string") {
          return values.some((value) =>
            serviceValue.toLowerCase().includes(value.toLowerCase())
          );
        }

        return false;
      });
    });
  };

  // First, create a function to update the URL outside of the render cycle
  const updateURL = useCallback(
    (filters: Record<string, string[]>) => {
      // Wrap the router update in a setTimeout to move it out of the render cycle
      setTimeout(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, values]) => {
          if (values.length > 0) {
            params.set(key, values.join(","));
          }
        });

        // Add categories to URL if they exist
        if (selectedCategories.length > 0) {
          params.set("categories", selectedCategories.join(","));
        }

        router.replace(`?${params.toString()}`, { scroll: false });
      }, 0);
    },
    [router, selectedCategories]
  );

  // Modify handleFilterChange to batch state updates
  const handleFilterChange = (
    filterName: string,
    value: string,
    checked: boolean
  ) => {
    setActiveFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (!newFilters[filterName]) {
        newFilters[filterName] = [];
      }

      if (checked) {
        newFilters[filterName] = [...newFilters[filterName], value];
      } else {
        newFilters[filterName] = newFilters[filterName].filter(
          (v) => v !== value
        );
      }

      if (newFilters[filterName].length === 0) {
        delete newFilters[filterName];
      }

      return newFilters;
    });
  };

  // Create a state update handler for categories
  const handleCategoryChange = useCallback(
    (categoryId: string, checked: boolean) => {
      setSelectedCategories((prev) => {
        const newCategories = checked
          ? [...prev, categoryId]
          : prev.filter((id) => id !== categoryId);

        // Use requestAnimationFrame to defer the URL update
        requestAnimationFrame(() => {
          const params = new URLSearchParams(window.location.search);
          if (newCategories.length > 0) {
            params.set("categories", newCategories.join(","));
          } else {
            params.delete("categories");
          }
          router.replace(`?${params.toString()}`, { scroll: false });
        });

        return newCategories;
      });
    },
    [router]
  );

  const faqItems = [
    {
      question: "What is Faceless video list?",
      answer:
        "Faceless video list is a comprehensive platform that showcases various AI-powered tools and services for creating faceless video content. It helps content creators, marketers, and businesses discover and compare the best AI solutions for their video projects, streamlining the process of finding the right tools for their specific needs.",
    },
    {
      question:
        "How can I use Faceless video list to find the best AI video tools?",
      answer:
        "You can use Faceless video list to search for specific AI video tools, compare different services, and find the best solutions for your faceless video creation needs. Simply browse the listings, use the search function to find relevant tools, or apply filters based on categories, pricing, and features to narrow down your options. Our directory provides detailed information about each tool, including key features, pricing, and user reviews.",
    },
    {
      question: "Is Faceless video list free to use?",
      answer:
        "Yes, browsing and searching Faceless video list is completely free. We believe in providing open access to information about AI video tools to help creators make informed decisions. However, please note that the individual tools and services listed may have their own pricing structures, which you'll need to check directly with the service providers.",
    },
    {
      question:
        "How often is Faceless video list updated with new tools and services?",
      answer:
        "We strive to keep Faceless video list up-to-date with the latest AI video creation tools and services. Our team regularly reviews and adds new entries to ensure you have access to the most current information. We also encourage service providers to submit their tools for inclusion, which helps us maintain a comprehensive and current directory.",
    },
    {
      question: "What types of AI video tools can I find in the directory?",
      answer:
        "Faceless video list covers a wide range of AI-powered video creation tools, including but not limited to: text-to-video generators, video editing software with AI capabilities, AI-powered animation tools, voice synthesis for video narration, automated video captioning and subtitling services, AI-driven video analytics tools, and more. Whether you're looking for tools to create explainer videos, social media content, or educational materials, you'll find relevant options in our directory.",
    },
    {
      question: "How can I add my AI video service to Faceless video list?",
      answer:
        "To add your service to Faceless video list, click on the 'Submit Service' button at the top of the page. You'll be guided through a simple process to submit your service for review. Our team will verify the information and, if approved, add your service to the directory. We strive to maintain a high-quality list of services, so please ensure your submission is accurate, relevant, and provides value to our users.",
    },
    {
      question:
        "Can I leave reviews or ratings for the AI video tools listed in Faceless video list?",
      answer:
        "Currently, we don't have a built-in review system, but we're considering adding this feature in the future. In the meantime, we encourage users to share their experiences with specific tools in our community forums or on social media. You can also contact us if you have significant feedback about a listed service that you believe should be reflected in our directory.",
    },
    {
      question:
        "How does Faceless video list ensure the quality and accuracy of listed services?",
      answer:
        "We have a dedicated team that researches and verifies information about each service before it's added to our directory. We also regularly update existing listings to ensure accuracy. However, as AI technology evolves rapidly, we encourage users to always check the latest information directly with the service providers. If you notice any discrepancies or outdated information, please let us know, and we'll investigate and update accordingly.",
    },
    {
      question:
        "Are the AI video tools in Faceless video list suitable for beginners?",
      answer:
        "Our directory includes AI video tools suitable for users of all skill levels, from beginners to advanced professionals. Many of the listed tools are designed with user-friendly interfaces and offer templates or automated features that make video creation accessible to newcomers. We recommend using our filtering options to find tools that match your experience level and specific needs.",
    },
    {
      question:
        "What is the future of AI in video creation, and how does Faceless video list stay current?",
      answer:
        "AI is rapidly transforming video creation, making it more accessible, efficient, and innovative. We expect to see advancements in areas like real-time video generation, personalized content creation, and enhanced video editing capabilities. Faceless video list stays current by continuously monitoring the industry, attending relevant conferences, and maintaining relationships with AI video tool developers. We regularly update our listings and add new categories to reflect the latest trends and technologies in AI-powered video creation.",
    },
  ];

  const visibleServices = showAllServices
    ? filteredServices
    : filteredServices.slice(0, 32);

  const removeFilter = (key: string, value: string) => {
    if (key === "categories") {
      setSelectedCategories((prev) => prev.filter((id) => id !== value));
    } else {
      setActiveFilters((prevFilters) => {
        const newFilters = { ...prevFilters };

        if (Array.isArray(newFilters[key])) {
          newFilters[key] = newFilters[key].filter((v) => v !== value);

          if (newFilters[key].length === 0) {
            delete newFilters[key];
          }
        } else {
          delete newFilters[key];
        }

        return newFilters;
      });
    }

    // Update URL

    const params = new URLSearchParams(window.location.search);

    if (key === "categories") {
      const newCategories = selectedCategories.filter((id) => id !== value);

      if (newCategories.length > 0) {
        params.set("categories", newCategories.join(","));
      } else {
        params.delete("categories");
      }
    } else {
      if (params.has(key)) {
        const values = params

          .get(key)!
          .split(",")

          .filter((v) => v !== value);

        if (values.length > 0) {
          params.set(key, values.join(","));
        } else {
          params.delete(key);
        }
      }
    }

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearch = () => {
    const lowercasedQuery = searchQuery.toLowerCase();

    const filtered = services.filter(
      (service) =>
        service.Name.value.toLowerCase().includes(lowercasedQuery) ||
        service.Description.value.toLowerCase().includes(lowercasedQuery)
    );

    setFilteredServices(filtered);
  };

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredServices(services);
    } else {
      handleSearch();
    }
  }, [searchQuery, services]);

  // Add this useEffect to log categories when they change

  useEffect(() => {
    async function fetchSubmitFields() {
      try {
        const response = await fetch("/api/submit-fields");
        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setSubmitFields(data.submitFields);
      } catch (err) {
        console.error("Error fetching submit fields:", err);
        setSubmitError(
          "Failed to load submission form. Please try again later."
        );
      }
    }

    fetchSubmitFields();
  }, []);

  const handleSubmitFormChange = (fieldName: string, value: any) => {
    setSubmitFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitFormData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSubmitSuccess(true);
      setSubmitFormData({}); // Clear the form after successful submission
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      if (error instanceof Error) {
        setSubmitError(`Failed to submit the form: ${error.message}`);
      } else {
        setSubmitError("Failed to submit the form: An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const commonProps = {
      id: field.FieldName,
      name: field.FieldName,
      required: field.Required,
      value: submitFormData[field.FieldName] || "",
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => handleSubmitFormChange(field.FieldName, e.target.value),
    };

    switch (field.FieldType) {
      case "text":
      case "email":
      case "url":
      case "phone":
        return <Input {...commonProps} type={field.FieldType} />;

      case "number":
      case "currency":
        return <Input {...commonProps} type="number" />;

      case "date":
        return <Input {...commonProps} type="date" />;

      case "richText":
      case "textarea":
        return (
          <Textarea
            {...commonProps}
            placeholder={field.Placeholder || `Enter ${field.FieldLabel}`}
            className="min-h-[100px]" // Add minimum height for better UX
          />
        );

      case "boolean":
        return (
          <Checkbox
            id={field.FieldName}
            name={field.FieldName}
            checked={submitFormData[field.FieldName] || false}
            onCheckedChange={(checked) =>
              handleSubmitFormChange(field.FieldName, checked)
            }
          />
        );

      case "dropdown":
        return (
          <Select
            value={submitFormData[field.FieldName] || ""}
            onValueChange={(value) =>
              handleSubmitFormChange(field.FieldName, value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.Options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "image":
        return (
          <Input
            {...commonProps}
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              handleSubmitFormChange(field.FieldName, file);
            }}
          />
        );

      case "multiselect":
        return (
          <div
            className="space-y-2 border p-4 rounded-md"
            key={field.FieldName}
          >
            <div className="text-sm font-medium mb-2">{field.FieldLabel}</div>
            {field.Options.map((option: string) => (
              <div
                key={`${field.FieldName}-${option}`}
                className="flex items-center gap-2"
              >
                <Checkbox
                  id={`${field.FieldName}-${option}`}
                  checked={
                    Array.isArray(submitFormData[field.FieldName]) &&
                    submitFormData[field.FieldName].includes(option)
                  }
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(
                      submitFormData[field.FieldName]
                    )
                      ? submitFormData[field.FieldName]
                      : [];

                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter(
                          (value: string) => value !== option
                        );

                    handleSubmitFormChange(field.FieldName, newValues);
                  }}
                />
                <label
                  htmlFor={`${field.FieldName}-${option}`}
                  className="text-sm cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return <Input {...commonProps} />;
    }
  };

  // Move URL updates to a separate effect
  useEffect(() => {
    const params = new URLSearchParams();

    // Add active filters to URL
    Object.entries(activeFilters).forEach(([key, values]) => {
      if (values?.length > 0) {
        params.set(key, values.join(","));
      }
    });

    // Add categories to URL
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    // Use requestAnimationFrame to ensure we're not updating during render
    requestAnimationFrame(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }, [activeFilters, selectedCategories, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Left Sidebar / Top Bar on Mobile */}
      <div className="lg:fixed lg:inset-y-0 lg:left-0 lg:w-80 bg-[#1f2937] border-r border-gray-800 shadow-lg">
        <div className="h-full p-6 overflow-y-auto">
          {/* Search Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">
              Search projects
            </h2>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border-gray-700 text-gray-100 placeholder-gray-400 focus:ring-blue-500/30 focus:border-blue-500/50"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">
              Categories
            </h2>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <CategoryButtons
                categories={categories}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                isLoading={isCategoriesLoading}
              />
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-100">
              Filters
            </h2>
            {filters.map((filter) => (
              <div key={filter.fieldName} className="mb-6">
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  {filter.fieldName}
                </h3>
                <div className="space-y-2 bg-gray-800/50 rounded-lg p-3">
                  {filter.options.map((option) => (
                    <div key={option} className="flex items-center group">
                      <Checkbox
                        id={`${filter.fieldName}-${option}`}
                        checked={
                          activeFilters[filter.fieldName]?.includes(option) ||
                          false
                        }
                        onCheckedChange={(checked) => {
                          handleFilterChange(
                            filter.fieldName,
                            option,
                            checked as boolean
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500/50 bg-gray-700"
                      />
                      <label
                        htmlFor={`${filter.fieldName}-${option}`}
                        className="ml-2 text-sm text-gray-300 group-hover:text-gray-100 transition-colors duration-200 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Directory Network */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">
              Directory Network
            </h3>
            <div className="space-y-2 bg-gray-800/50 rounded-lg p-3">
              <a
                href="https://facelessvideolist.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Faceless Video List
              </a>
              <a
                href="https://texttospeechlist.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Text to Speech List
              </a>
            </div>
          </div>

          {/* Connect */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-100">
              Connect
            </h3>
            <div className="space-y-2 bg-gray-800/50 rounded-lg p-3">
              <a
                href="https://www.linkedin.com/in/stellan-bergstr%C3%B6m-34522162/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 hover:text-white transition-colors duration-200 flex items-center gap-2"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>

          {/* Active Filters */}
          {(Object.keys(activeFilters).length > 0 ||
            (selectedCategories.length > 0 && isCategoryMapReady)) && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-100">
                Active Filters
              </h2>
              <div className="flex flex-wrap gap-2 bg-gray-800/50 rounded-lg p-3">
                {Object.entries(activeFilters).map(([key, values]) =>
                  values.map((value) => (
                    <Button
                      key={`${key}-${value}`}
                      variant="outline"
                      size="sm"
                      onClick={() => removeFilter(key, value)}
                      className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200 hover:text-white transition-colors duration-200 flex items-center gap-1"
                    >
                      {key}: {value}
                      <X className="h-3 w-3" />
                    </Button>
                  ))
                )}
                {selectedCategories.map((categoryId) => (
                  <Button
                    key={`category-${categoryId}`}
                    variant="outline"
                    size="sm"
                    onClick={() => removeFilter("categories", categoryId)}
                    className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-gray-200 hover:text-white transition-colors duration-200 flex items-center gap-1"
                  >
                    Category: {categoryMap[categoryId]}
                    <X className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-80">
        {/* Header Section */}
        <header className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold">
            Technology First Sweden - Portfolio
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome to my company portfolio showcasing various side projects and
            tech experiments I&apos;ve been working on.
          </p>
        </header>

        {/* Services Grid */}
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
            {visibleServices.map((service, index) => (
              <a
                key={`service-${index}`}
                href={`/${getFieldValue(service, 'Slug')}`}
                className="group bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden flex flex-col h-full border border-gray-100"
              >
                {service.Image && (
                  <div className="relative w-full pt-[56.25%] overflow-hidden">
                    <Image
                      src={String(getFieldValue(service, 'Image'))}
                      alt={String(getFieldValue(service, 'Name'))}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      priority={index < 6}
                    />
                  </div>
                )}

                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-semibold text-xl mb-3 text-gray-900">
                    {getFieldValue(service, 'Name')}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 flex-grow">
                    {truncateText(String(getFieldValue(service, 'Description')), 120)}
                  </p>

                  {/* Add Tags section */}
                  {getFieldValue(service, 'Tags') && Array.isArray(getFieldValue(service, 'Tags')) && (
                    <div className="mt-auto flex flex-wrap gap-1">
                      {(getFieldValue(service, 'Tags') as string[])
                        .slice(0, 3)
                        .map((tag: string, tagIndex: number) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      {getFieldValue(service, 'Tags').length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                          +{getFieldValue(service, 'Tags').length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>

          {/* Show More Button */}
          {!showAllServices &&
            filteredServices.length > visibleServices.length && (
              <div className="mt-8 text-center">
                <Button
                  onClick={() => setShowAllServices(true)}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  Show all projects
                </Button>
              </div>
            )}
        </main>
      </div>

      {/* Rest of the sections (Submit Form, FAQ, etc.) */}
      {/* ... */}
    </div>
  );
}
