"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Upload, Columns, Filter, X } from "lucide-react";
import { useEffect, useState } from "react";

function HowToCompareTwoColumns() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const carouselData = [
    {
      src: "/images/compare-two-columns/excel-preview-compare-two-column.webp",
      alt: "Excel preview - Compare two columns",
      description: "Instant Data Preview"
    },
    {
      src: "/images/compare-two-columns/highlight-result-compare-two-column.webp",
      alt: "Highlight result - Compare two columns",
      description: "Visual Comparison"
    },
    {
      src: "/images/compare-two-columns/show-unique-values-compare-two-column.webp",
      alt: "Show unique values - Compare two columns",
      description: "Focus on Differences"
    },
    {
      src: "/images/compare-two-columns/show-duplicates-compare-two-column.webp",
      alt: "Show duplicates - Compare two columns",
      description: "Find Matches Instantly"
    }
  ];

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    // Auto-play functionality
    const interval = setInterval(() => {
      const totalSlides = api.slideNodes().length;
      const currentSlide = api.selectedScrollSnap();
      const nextSlide = (currentSlide + 1) % totalSlides;
      api.scrollTo(nextSlide);
    }, 3000); // Change slide every 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [api]);

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);
  const steps = [
    {
      title: "Upload Your Files",
      description: "Drag and drop your Excel files. You can verify lists from the same file or compare columns across two different files.",
      icon: <Upload className="h-6 w-6" style={{ color: '#20A884' }} />,
    },
    {
      title: "Select Target Columns",
      description: "Unlike full-sheet comparisons, you simply choose \"Column A\" from the first list and \"Column B\" from the second list.",
      icon: <Columns className="h-6 w-6" style={{ color: '#20A884' }} />,
    },
    {
      title: "Choose Your View",
      description: "**Intersection:** See items present in both lists (Duplicates).\n**Unique to A:** See what is missing from list B.\n**Unique to B:** See new items added to list B.",
      icon: <Filter className="h-6 w-6" style={{ color: '#20A884' }} />,
    },
  ];

  return (
    <div className="w-full py-8 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">
            How to Compare Two Columns in Excel
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find duplicates and unique values without VLOOKUP formulas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left side - Steps */}
          <div className="space-y-2 lg:col-span-5">
            <p className="text-gray-600 mb-2">
              Comparing two lists in Excel often requires writing complex VLOOKUP formulas or using Conditional Formatting rules that are hard to manage. Our tool simplifies this into 3 steps:
            </p>
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4 items-start p-3 bg-white rounded-lg shadow-sm">
                <div className="flex-shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1">
                    {step.title}
                  </h3>
                  <div className="text-gray-600">
                    {step.description.split('\n').map((line, index) => {
                      const parts = line.split('**');
                      return (
                        <div key={index}>
                          {parts.map((part, partIndex) =>
                            partIndex % 2 === 1 ? <strong key={partIndex}>{part}</strong> : part
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right side - Carousel with Images */}
          <div className="w-full max-w-full lg:col-span-7">
            <Carousel className="w-full" setApi={setApi}>
              <CarouselContent>
                {carouselData.map((item, index) => (
                  <CarouselItem key={index}>
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImage(item.src)}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            {/* Description below carousel */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {carouselData[current - 1]?.description}
              </p>
            </div>

            {/* Carousel Progress Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {carouselData.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    current === index + 1
                      ? 'bg-green-600 w-8'
                      : 'bg-green-200 hover:bg-green-400'
                  }`}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-5xl max-h-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
                className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
                aria-label="Close image preview"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={selectedImage}
                alt="Enlarged preview"
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
        </div>
    </div>
  );
}

export { HowToCompareTwoColumns };