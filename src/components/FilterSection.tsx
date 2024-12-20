import React from 'react';

const collectionTags = {
  'stella-chewys': [
    'Dry Food 乾糧',
    'Wet Food 濕糧',
    '乾糧伴侶',
    '凍乾外層乾糧',
    '凍乾脫水肉餅',
    '凍乾脫水貓糧',
    '烘焙乾糧混合凍乾生肉粒',
    '魔幻肉塵'
  ],
  'wellness-1': [
    'Dry Food 乾糧',
    'Wet Food 濕糧',
    'Puppy 幼犬',
    'Kitten 幼貓',
    'Senior 老年',
    '室內',
    '泌尿道',
    '消化健康',
    '牙齒保健',
    '皮毛和皮膚',
    '腸胃敏感',
    '關節護理',
    '體重控制'
  ],
  'pet-supplements': [
    '驅蟲除蚤產品',
    '益生菌/腸道健康',
    '皮膚/眼睛及耳朵護理',
    '泌尿道健康',
    '關節保健',
    '腎臟及肝臟健康',
    '心血管健康',
    '口腔護理'
  ],
  'prescription-diet-cats-dogs': [
    '腎臟處方糧',
    '腸胃處方糧',
    '泌尿道處方糧',
    '低敏處方糧',
    '糖尿病處方糧',
    '體重控制處方糧'
  ],
  'default': []
};

// Collection titles mapping
const collectionTitles = {
  'pet-supplements': '保健品及補充品',
  'prescription-diet-cats-dogs': '獸醫處方糧',
  'stella-chewys': "Stella & Chewy's",
  'wellness-1': 'Wellness'
};

// Collection order
const collectionOrder = [
  'prescription-diet-cats-dogs',
  'pet-supplements',
  'stella-chewys',
  'wellness-1'
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
  currentCollection: string;
  collections: { handle: string; title: string }[];
  onCollectionSelect: (collection: string) => void;
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
  currentCollection,
  collections,
  onCollectionSelect,
}: FilterSectionProps) {
  // Get the appropriate tags for the current collection
  const availableTags = collectionTags[currentCollection as keyof typeof collectionTags] || collectionTags.default;

  // Determine if we should show vendor filter for current collection
  const shouldShowVendorFilter = currentCollection !== 'pet-supplements' && showVendorFilter;

  // Sort collections based on the order array
  const sortedCollections = [...collections].sort((a, b) => {
    const indexA = collectionOrder.indexOf(a.handle);
    const indexB = collectionOrder.indexOf(b.handle);
    return indexA - indexB;
  });

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        <div className="flex flex-nowrap gap-4">
          <div className="max-w-[calc(100vw-3rem)]">
            <h3 className="text-lg font-semibold mb-3">Collections</h3>
            <div className="flex flex-nowrap gap-2 mask-fade-right">
              {sortedCollections.map((collection) => (
                <button
                  key={collection.handle}
                  onClick={() => onCollectionSelect(collection.handle)}
                  className={`
                    whitespace-nowrap
                    px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all duration-200 ease-in-out
                    flex items-center gap-1
                    ${
                      currentCollection === collection.handle
                        ? 'bg-purple-100 text-purple-800 border-2 border-purple-300 hover:bg-purple-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }
                  `}
                >
                  {collectionTitles[collection.handle as keyof typeof collectionTitles] || collection.title}
                  {currentCollection === collection.handle && (
                    <span className="ml-1 text-lg leading-none">&times;</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Pet Type</h3>
            <div className="flex flex-nowrap gap-2">
              {petTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => onPetTypeSelect(type)}
                  className={`
                    whitespace-nowrap
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
        </div>
      </div>

      {shouldShowVendorFilter && (
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

      {availableTags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Product Type</h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
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
      )}

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
