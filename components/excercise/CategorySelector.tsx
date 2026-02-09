interface CategorySelectorProps {
  categories: string[];
  selectedCategories: string[];
  onToggle: (category: string) => void;
  label?: string;
}

export default function CategorySelector({
  categories,
  selectedCategories,
  onToggle,
  label = "Categories",
}: CategorySelectorProps) {
  return (
    <div>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => onToggle(cat)}
            className={`px-2 py-1 cursor-pointer rounded-sm text-sm ${
              selectedCategories.includes(cat)
                ? "bg-[#D32C86] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
