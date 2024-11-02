import React from "react";
import { Button } from "@/components/ui/button";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

interface CategoryButtonsProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categoryId: string, checked: boolean) => void;
  isLoading?: boolean;
}

const CategoryButtons: React.FC<CategoryButtonsProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.id);
        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            onClick={() => onCategoryChange(category.id, !isSelected)}
            className={`
              text-sm transition-all duration-200 ease-in-out rounded-full px-4 py-2
              ${
                isSelected
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
              }
            `}
          >
            {category.name}
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryButtons;
