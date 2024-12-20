import React from 'react';

const predefinedTags = [
  '腸胃處方糧',
  '泌尿道處方糧',
  '腎臟處方糧',
  '低敏處方糧'
];

const petTypes = ['Dog 狗', 'Cat 貓'];

interface FilterSectionProps {
  availableVendors: string[];
  selectedVendors: string[];
  onVendorSelect: (vendor: string) => void;
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  selectedPetTypes: string[];
  onPetTypeSelect: (type: string) => void;
  showVendorFilter?: boolean;
}

export default function FilterSection({
  availableVendors,
  selectedVendors,
  onVendorSelect,
  selectedTags,
  onTagSelect,
  selectedPetTypes,
  onPetTypeSelect,
  showVendorFilter = true,
}: FilterSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Pet Type</h3>
        <div className="flex flex-wrap gap-2">
          {petTypes.map((type) => (
            <button
              key={type}
              onClick={() => onPetTypeSelect(type)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 ease-in-out
                flex items-center gap-1
                ${
                  selectedPetTypes.includes(type)
                    ? 'bg-green-100 text-green-800 border-2 border-green-300 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }
              `}
            >
              {type}
              {selectedPetTypes.includes(type) && (
                <span className="ml-1 text-lg leading-none">&times;</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {showVendorFilter && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Vendors</h3>
          <div className="flex flex-wrap gap-2">
            {availableVendors.map((vendor) => (
              <button
                key={vendor}
                onClick={() => onVendorSelect(vendor)}
                className={`
                  px-3 py-1.5 rounded-full text-sm font-medium
                  transition-all duration-200 ease-in-out
                  flex items-center gap-1
                  ${
                    selectedVendors.includes(vendor)
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                  }
                `}
              >
                {vendor}
                {selectedVendors.includes(vendor) && (
                  <span className="ml-1 text-lg leading-none">&times;</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">Product Type</h3>
        <div className="flex flex-wrap gap-2">
          {predefinedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium
                transition-all duration-200 ease-in-out
                flex items-center gap-1
                ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-100 text-indigo-800 border-2 border-indigo-300 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }
              `}
            >
              {tag}
              {selectedTags.includes(tag) && (
                <span className="ml-1 text-lg leading-none">&times;</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {(selectedVendors.length > 0 || selectedTags.length > 0 || selectedPetTypes.length > 0) && (
        <div className="pt-2">
          <div className="text-sm text-gray-500">
            Active Filters ({selectedVendors.length + selectedTags.length + selectedPetTypes.length})
          </div>
        </div>
      )}
    </div>
  );
}
