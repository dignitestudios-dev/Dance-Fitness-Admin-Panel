import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onToggle: (tag: string) => void;
  label?: string;
}

export default function TagSelector({
  tags,
  selectedTags,
  onToggle,
  label = "Tags",
}: TagSelectorProps) {
  return (
    <div>
      <div className="text-sm font-medium mb-1">{label}</div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full text-left">
            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedTags.map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded bg-[#D32C86] text-white">
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              "Select Tags"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid gap-2 max-h-48 overflow-auto">
            {tags.map((tag) => (
              <label key={tag} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => onToggle(tag)}
                 className="w-4 h-4 appearance-none border border-gray-300 rounded-sm 
             checked:bg-[#D32C86] checked:border-[#D32C86] 
             relative cursor-pointer"
                />
                <span className="text-sm">{tag}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
