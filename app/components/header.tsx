"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Book, Menu, Search, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MangaSearchResult,
  searchManga,
  getCoverImageUrl,
  debounce,
} from "@/app/components/search";

export default function Header() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MangaSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchMobileContainerRef = useRef<HTMLDivElement>(null);

  // if the URL is `/comic/:slug/chapter/:hid` hide the header
  if (pathname?.match(/^\/comic\/[^/]+\/chapter\/[^/]+$/)) {
    return null;
  }

  const categories = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Mystery",
    "Supernatural",
  ];

  // Create memoized fetchSearchResults function
  const fetchSearchResults = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchManga({ query });
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      fetchSearchResults(query);
    }, 500),
    [fetchSearchResults]
  );

  // Effect to handle search query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, debouncedSearch]);

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        searchMobileContainerRef.current &&
        !searchMobileContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length === 0) {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.length >= 2) {
      setShowResults(true);
    }
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const SearchResultsList = ({ results }: { results: MangaSearchResult[] }) => {
    if (results.length === 0 && searchQuery.length >= 2) {
      return (
        <div className="p-2 text-sm text-center text-muted-foreground">
          No results found
        </div>
      );
    }

    return (
      <>
        {results.map((result) => {
          // Get cover key if available
          const coverKey =
            result.md_covers && result.md_covers.length > 0
              ? result.md_covers[0].b2key
              : null;

          // Get status text based on status code
          const getStatusText = (statusCode: number) => {
            switch (statusCode) {
              case 1:
                return "Ongoing";
              case 2:
                return "Completed";
              case 3:
                return "Cancelled";
              case 4:
                return "Hiatus";
              default:
                return "Unknown";
            }
          };

          // Get status color based on status code
          const getStatusColor = (statusCode: number) => {
            switch (statusCode) {
              case 1:
                return "text-blue-500";
              case 2:
                return "text-green-500";
              case 3:
                return "text-red-500";
              case 4:
                return "text-amber-500";
              default:
                return "text-gray-500";
            }
          };

          return (
            <Link
              href={`/comic/${result.slug}`}
              key={result.id}
              className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded"
              onClick={() => {
                setShowResults(false);
                setSearchQuery(""); // Clear search input when a suggestion is clicked
              }}
            >
              {/* Cover image */}
              <div className="relative h-20 w-14 overflow-hidden rounded-md flex-shrink-0 border">
                {coverKey ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={getCoverImageUrl(coverKey)}
                      alt={result.title || "Manga cover"}
                      fill
                      className="object-cover"
                      sizes="56px"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Book className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium line-clamp-2">
                  {result.highlight ? (
                    <span
                      dangerouslySetInnerHTML={{ __html: result.highlight }}
                    />
                  ) : (
                    result.title
                  )}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {result.status && (
                    <span
                      className={`text-xs font-medium ${getStatusColor(
                        result.status
                      )}`}
                    >
                      {getStatusText(result.status)}
                    </span>
                  )}
                  {result.rating && (
                    <span className="text-xs text-muted-foreground">
                      ★ {result.rating}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">
              MangaHilaw
            </span>
          </Link>

          {/* Search bar - only visible on desktop */}
          <div
            className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-4"
            ref={searchContainerRef}
          >
            <div className="relative w-full">
              {isLoading ? (
                <Loader2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder="Search manga..."
                className="pl-8 pr-8"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
              />
              {searchQuery.length > 0 && (
                <button
                  className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                  onClick={handleSearchClear}
                  aria-label="Clear search"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}

              {/* Search Results Dropdown */}
              {showResults && (
                <div
                  className={cn(
                    "absolute top-full mt-1 w-full bg-background border rounded-md shadow-md z-50 max-h-96 overflow-y-auto",
                    searchResults.length === 0 &&
                      searchQuery.length < 2 &&
                      "hidden"
                  )}
                >
                  {isLoading ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <SearchResultsList results={searchResults} />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle button */}
            <ThemeToggle />

            {/* Categories dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem key={category} asChild>
                    <Link href={`/category/${category.toLowerCase()}`}>
                      {category}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4 py-4">
                  {/* Search bar - only in the mobile menu */}
                  <div className="relative" ref={searchMobileContainerRef}>
                    {isLoading ? (
                      <Loader2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
                    ) : (
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    )}
                    <Input
                      placeholder="Search manga..."
                      className="pl-8 pr-8"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={handleSearchFocus}
                    />
                    {searchQuery.length > 0 && (
                      <button
                        className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                        onClick={handleSearchClear}
                        aria-label="Clear search"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                    {/* Mobile Search Results Dropdown */}
                    {showResults && (
                      <div
                        className={cn(
                          "absolute top-full mt-1 w-full bg-background border rounded-md shadow-md z-50 max-h-96 overflow-y-auto",
                          searchResults.length === 0 &&
                            searchQuery.length < 2 &&
                            "hidden"
                        )}
                      >
                        {isLoading ? (
                          <div className="flex justify-center items-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <SearchResultsList results={searchResults} />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-sm font-medium">Categories</h3>
                    {categories.map((category) => (
                      <Link
                        key={category}
                        href={`/category/${category.toLowerCase()}`}
                        className="text-sm hover:underline"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
