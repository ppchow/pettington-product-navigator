import React from 'react';

interface FilterSectionProps {
  vendors: string[];
  selectedVendors: string[];
  onVendorChange: (vendor: string) => void;
  selectedTags: string[];
  onTagChange: (tag: string) => void;
}

const predefinedTags = [
  '腸胃處方糧',
  '泌尿道處方糧',
  '腎臟處方糧',
  '低敏處方糧'
];

export default function FilterSection({
  vendors,
  selectedVendors,
  onVendorChange,
  selectedTags,
  onTagChange
}: FilterSectionProps) {
  return (
    <div className="filter-section mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vendor Filter */}
        <div className="vendor-filter">
          <h3 className="text-lg font-semibold mb-3">Vendor</h3>
          <div className="space-y-2">
            {vendors.map((vendor) => (
              <label key={vendor} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedVendors.includes(vendor)}
                  onChange={() => onVendorChange(vendor)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{vendor}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tag Filter */}
        <div className="tag-filter">
          <h3 className="text-lg font-semibold mb-3">Product Type</h3>
          <div className="space-y-2">
            {predefinedTags.map((tag) => (
              <label key={tag} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => onTagChange(tag)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{tag}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedVendors.length > 0 || selectedTags.length > 0) && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {selectedVendors.map((vendor) => (
              <span
                key={vendor}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {vendor}
                <button
                  onClick={() => onVendorChange(vendor)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {tag}
                <button
                  onClick={() => onTagChange(tag)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
