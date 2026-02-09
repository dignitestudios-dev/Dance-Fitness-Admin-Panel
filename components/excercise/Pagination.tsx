import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  lastPage,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex justify-center mt-6 space-x-2">
      <Button
        size="sm"
        variant="outline"
        disabled={!hasPrev}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &laquo; Previous
      </Button>

      {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          size="sm"
          variant={page === currentPage ? "default" : "outline"}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        size="sm"
        variant="outline"
        disabled={!hasNext}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next &raquo;
      </Button>
    </div>
  );
}
