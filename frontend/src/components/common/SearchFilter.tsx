import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    name: string;
    value: string;
    options: { value: string; label: string }[];
  }[];
  onFilterChange: (filterName: string, value: string) => void;
}

export function SearchFilter({ searchQuery, onSearchChange, filters, onFilterChange }: SearchFilterProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          placeholder="Search..."
        />
      </div>

      <div className="flex flex-wrap gap-4">
        {filters.map((filter) => (
          <select
            key={filter.name}
            value={filter.value}
            onChange={(e) => onFilterChange(filter.name, e.target.value)}
            className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>
    </div>
  );
} 