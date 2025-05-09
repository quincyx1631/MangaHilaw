"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Book,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  LayoutGrid,
  List,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  debounce,
  getCoverImageUrl,
  type MangaSearchResult,
} from "@/app/components/search";
import {
  FilterState,
  genresList,
  themesList,
  formatsList,
} from "@/app/types/browse";

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<MangaSearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    excludes: [],
    demographic: [],
    country: [],
    page: 1,
    limit: 20,
    showall: true,
    q: "",
  });

  useEffect(() => {
    const query = searchParams.get("q") || "";
    const genres = searchParams.getAll("genres");
    const excludes = searchParams.getAll("excludes");
    const demographic = searchParams.getAll("demographic").map(Number);
    const country = searchParams.getAll("country");
    const status = searchParams.get("status")
      ? Number(searchParams.get("status"))
      : undefined;
    const content_rating = searchParams.get("content_rating") || undefined;
    const from = searchParams.get("from")
      ? Number(searchParams.get("from"))
      : undefined;
    const to = searchParams.get("to")
      ? Number(searchParams.get("to"))
      : undefined;
    const minimum = searchParams.get("minimum")
      ? Number(searchParams.get("minimum"))
      : undefined;
    const sort = searchParams.get("sort") || undefined;
    const completed = searchParams.get("completed") === "true";
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const showall = searchParams.get("showall") !== "false";

    setFilters({
      genres,
      excludes,
      demographic,
      country,
      status,
      content_rating,
      from,
      to,
      minimum,
      sort,
      completed,
      page,
      limit,
      showall,
      q: query,
    });

    setSearchQuery(query);
  }, [searchParams]);

  const searchManga = useCallback(async (currentFilters: FilterState) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (currentFilters.q) {
        params.append("q", currentFilters.q);
      }

      params.append("page", currentFilters.page.toString());
      params.append("limit", currentFilters.limit.toString());
      params.append("showall", currentFilters.showall.toString());
      params.append("t", "false");

      currentFilters.genres.forEach((genre) => params.append("genres", genre));
      currentFilters.excludes.forEach((genre) =>
        params.append("excludes", genre)
      );
      currentFilters.demographic.forEach((demo) =>
        params.append("demographic", demo.toString())
      );
      currentFilters.country.forEach((country) =>
        params.append("country", country)
      );

      if (currentFilters.status !== undefined) {
        params.append("status", currentFilters.status.toString());
      }

      if (currentFilters.content_rating) {
        params.append("content_rating", currentFilters.content_rating);
      }

      if (currentFilters.from) {
        params.append("from", currentFilters.from.toString());
      }

      if (currentFilters.to) {
        params.append("to", currentFilters.to.toString());
      }

      if (currentFilters.minimum) {
        params.append("minimum", currentFilters.minimum.toString());
      }

      if (currentFilters.sort) {
        params.append("sort", currentFilters.sort);
      }

      if (currentFilters.completed) {
        params.append("completed", "true");
      }

      const response = await fetch(
        `/api/manga/v1.0/search/?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Search failed with status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
      setTotalResults(data.length);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUrl = useCallback(
    (currentFilters: FilterState) => {
      const params = new URLSearchParams();

      if (currentFilters.q) {
        params.append("q", currentFilters.q);
      }

      currentFilters.genres.forEach((genre) => params.append("genres", genre));
      currentFilters.excludes.forEach((genre) =>
        params.append("excludes", genre)
      );
      currentFilters.demographic.forEach((demo) =>
        params.append("demographic", demo.toString())
      );
      currentFilters.country.forEach((country) =>
        params.append("country", country)
      );

      if (currentFilters.status !== undefined) {
        params.append("status", currentFilters.status.toString());
      }

      if (currentFilters.content_rating) {
        params.append("content_rating", currentFilters.content_rating);
      }

      if (currentFilters.from) {
        params.append("from", currentFilters.from.toString());
      }

      if (currentFilters.to) {
        params.append("to", currentFilters.to.toString());
      }

      if (currentFilters.minimum) {
        params.append("minimum", currentFilters.minimum.toString());
      }

      if (currentFilters.sort) {
        params.append("sort", currentFilters.sort);
      }

      if (currentFilters.completed) {
        params.append("completed", "true");
      }

      params.append("page", currentFilters.page.toString());
      params.append("limit", currentFilters.limit.toString());

      if (!currentFilters.showall) {
        params.append("showall", "false");
      }

      router.push(`/browse?${params.toString()}`);
    },
    [router]
  );

  useEffect(() => {
    searchManga(filters);
  }, [filters, searchManga]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setFilters((prev) => ({ ...prev, q: query, page: 1 }));
      updateUrl({ ...filters, q: query, page: 1 });
    }, 1000),
    [filters, updateUrl]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const toggleGenre = (genre: string, isExclude = false) => {
    setFilters((prev) => {
      const targetArray = isExclude ? "excludes" : "genres";
      const otherArray = isExclude ? "genres" : "excludes";

      if (prev[targetArray].includes(genre)) {
        return {
          ...prev,
          [targetArray]: prev[targetArray].filter((g) => g !== genre),
          page: 1,
        };
      }

      const updatedOtherArray = prev[otherArray].filter((g) => g !== genre);

      return {
        ...prev,
        [targetArray]: [...prev[targetArray], genre],
        [otherArray]: updatedOtherArray,
        page: 1,
      };
    });
  };

  const toggleDemographic = (demo: number) => {
    setFilters((prev) => {
      if (prev.demographic.includes(demo)) {
        return {
          ...prev,
          demographic: prev.demographic.filter((d) => d !== demo),
          page: 1,
        };
      }
      return {
        ...prev,
        demographic: [...prev.demographic, demo],
        page: 1,
      };
    });
  };

  const toggleCountry = (country: string) => {
    setFilters((prev) => {
      if (prev.country.includes(country)) {
        return {
          ...prev,
          country: prev.country.filter((c) => c !== country),
          page: 1,
        };
      }
      return {
        ...prev,
        country: [...prev.country, country],
        page: 1,
      };
    });
  };

  const handleStatusChange = (status: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  const handleContentRatingChange = (rating: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      content_rating: rating,
      page: 1,
    }));
  };

  const handleSortChange = (sort: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      sort,
      page: 1,
    }));
  };

  const handleYearChange = (from?: number, to?: number) => {
    setFilters((prev) => ({
      ...prev,
      from,
      to,
      page: 1,
    }));
  };

  const toggleCompleted = () => {
    setFilters((prev) => ({
      ...prev,
      completed: !prev.completed,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    updateUrl({ ...filters, page: newPage });
    window.scrollTo(0, 0);
  };

  const clearFilters = () => {
    setFilters({
      genres: [],
      excludes: [],
      demographic: [],
      country: [],
      page: 1,
      limit: 20,
      showall: true,
      q: searchQuery,
    });
    updateUrl({
      genres: [],
      excludes: [],
      demographic: [],
      country: [],
      page: 1,
      limit: 20,
      showall: true,
      q: searchQuery,
    });
  };

  const applyFilters = () => {
    updateUrl(filters);
    setShowFilters(false);
  };

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

  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case 1:
        return "bg-blue-500";
      case 2:
        return "bg-green-500";
      case 3:
        return "bg-red-500";
      case 4:
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMangaType = (countryCode: string) => {
    switch (countryCode.toLowerCase()) {
      case "jp":
        return "Manga";
      case "kr":
        return "Manhwa";
      case "cn":
        return "Manhua";
      case "gb":
        return "Webtoon";
      default:
        return "International";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold">Browse</h1>
          <p className="text-muted-foreground mt-2">
            Discover your next favorite series
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            className="md:hidden flex items-center gap-2 mb-4"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          {/* Filters sidebar - hidden on mobile unless toggled */}
          <div
            className={cn(
              "w-full md:w-64 lg:w-72 shrink-0 transition-all",
              showFilters ? "block" : "hidden md:block"
            )}
          >
            <div className="sticky top-20 bg-background">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-4">
                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title..."
                    className="pl-8 pr-8"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setSearchQuery("");
                        setFilters((prev) => ({ ...prev, q: "", page: 1 }));
                        updateUrl({ ...filters, q: "", page: 1 });
                      }}
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="pr-4 space-y-6">
                    {/* Sort */}
                    <Accordion type="single" collapsible defaultValue="sort">
                      <AccordionItem value="sort">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 flex items-center justify-center text-xs">
                              ⏬
                            </span>
                            SORT BY
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <RadioGroup
                            value={filters.sort || "created_at"}
                            onValueChange={(value) => handleSortChange(value)}
                          >
                            <div className="flex items-center space-x-2 ">
                              <RadioGroupItem
                                value="created_at"
                                id="sort-created_at"
                              />
                              <Label htmlFor="sort-created_at">
                                Newest Added
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem
                                value="uploaded"
                                id="sort-uploaded"
                              />
                              <Label htmlFor="sort-uploaded">
                                Latest Update
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem value="view" id="sort-view" />
                              <Label htmlFor="sort-view">Most Viewed</Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem value="rating" id="sort-rating" />
                              <Label htmlFor="sort-rating">Rating</Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem value="follow" id="sort-follow" />
                              <Label htmlFor="sort-follow">Follow Count</Label>
                            </div>
                          </RadioGroup>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Status */}
                    <Accordion type="single" collapsible defaultValue="status">
                      <AccordionItem value="status">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            STATUS
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <RadioGroup
                            value={filters.status?.toString() || "all"}
                            onValueChange={(value) => {
                              if (value === "all") {
                                handleStatusChange(undefined);
                              } else {
                                handleStatusChange(Number.parseInt(value));
                              }
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="all-status" />
                              <Label htmlFor="all-status">All</Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem value="1" id="ongoing" />
                              <Label htmlFor="ongoing">Ongoing</Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem value="2" id="completed" />
                              <Label htmlFor="completed">Completed</Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem value="3" id="cancelled" />
                              <Label htmlFor="cancelled">Cancelled</Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem value="4" id="hiatus" />
                              <Label htmlFor="hiatus">Hiatus</Label>
                            </div>
                          </RadioGroup>

                          <div className="mt-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="completed-translation"
                                checked={filters.completed}
                                onCheckedChange={() => toggleCompleted()}
                              />
                              <Label htmlFor="completed-translation">
                                Completed Translation
                              </Label>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Country */}
                    <Accordion type="single" collapsible defaultValue="country">
                      <AccordionItem value="country">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 flex items-center justify-center text-xs">
                              🌏
                            </span>
                            COUNTRY
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="country-jp"
                                checked={filters.country.includes("jp")}
                                onCheckedChange={() => toggleCountry("jp")}
                              />
                              <Label htmlFor="country-jp">Japan (Manga)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="country-kr"
                                checked={filters.country.includes("kr")}
                                onCheckedChange={() => toggleCountry("kr")}
                              />
                              <Label htmlFor="country-kr">Korea (Manhwa)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="country-cn"
                                checked={filters.country.includes("cn")}
                                onCheckedChange={() => toggleCountry("cn")}
                              />
                              <Label htmlFor="country-cn">China (Manhua)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="country-other"
                                checked={filters.country.some(
                                  (c) => !["jp", "kr", "cn"].includes(c)
                                )}
                                onCheckedChange={() => toggleCountry("other")}
                              />
                              <Label htmlFor="country-other">Other</Label>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Demographic */}
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue="demographic"
                    >
                      <AccordionItem value="demographic">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 flex items-center justify-center text-xs">
                              👥
                            </span>
                            DEMOGRAPHIC
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="demo-1"
                                checked={filters.demographic.includes(1)}
                                onCheckedChange={() => toggleDemographic(1)}
                              />
                              <Label htmlFor="demo-1">Shounen</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="demo-2"
                                checked={filters.demographic.includes(2)}
                                onCheckedChange={() => toggleDemographic(2)}
                              />
                              <Label htmlFor="demo-2">Shoujo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="demo-3"
                                checked={filters.demographic.includes(3)}
                                onCheckedChange={() => toggleDemographic(3)}
                              />
                              <Label htmlFor="demo-3">Seinen</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="demo-4"
                                checked={filters.demographic.includes(4)}
                                onCheckedChange={() => toggleDemographic(4)}
                              />
                              <Label htmlFor="demo-4">Josei</Label>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Genres */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="genres">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 flex items-center justify-center text-xs">
                              📚
                            </span>
                            GENRES
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-2">
                            {genresList.map((genre) => (
                              <div
                                key={genre.slug}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <Checkbox
                                    id={`genre-${genre.slug}`}
                                    checked={filters.genres.includes(
                                      genre.slug
                                    )}
                                    onCheckedChange={() =>
                                      toggleGenre(genre.slug)
                                    }
                                    className="mr-2"
                                  />
                                  <Label
                                    htmlFor={`genre-${genre.slug}`}
                                    className="text-sm"
                                  >
                                    {genre.name}
                                  </Label>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {genre.count.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Themes */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="themes">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 flex items-center justify-center text-xs">
                              🎭
                            </span>
                            THEMES
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-2">
                            {themesList.map((theme) => (
                              <div
                                key={theme.slug}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <Checkbox
                                    id={`theme-${theme.slug}`}
                                    checked={filters.genres.includes(
                                      theme.slug
                                    )}
                                    onCheckedChange={() =>
                                      toggleGenre(theme.slug)
                                    }
                                    className="mr-2"
                                  />
                                  <Label
                                    htmlFor={`theme-${theme.slug}`}
                                    className="text-sm"
                                  >
                                    {theme.name}
                                  </Label>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {theme.count.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Format */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="format">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 flex items-center justify-center text-xs">
                              📐
                            </span>
                            FORMAT
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-2">
                            {formatsList.map((format) => (
                              <div
                                key={format.slug}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center">
                                  <Checkbox
                                    id={`format-${format.slug}`}
                                    checked={filters.genres.includes(
                                      format.slug
                                    )}
                                    onCheckedChange={() =>
                                      toggleGenre(format.slug)
                                    }
                                    className="mr-2"
                                  />
                                  <Label
                                    htmlFor={`format-${format.slug}`}
                                    className="text-sm"
                                  >
                                    {format.name}
                                  </Label>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {format.count.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Release Year */}
                    <Accordion type="single" collapsible defaultValue="year">
                      <AccordionItem value="year">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            RELEASE YEAR
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col space-y-4">
                            <div>
                              <Label
                                htmlFor="year-from"
                                className="text-sm mb-1 block"
                              >
                                From
                              </Label>
                              <select
                                id="year-from"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={filters.from?.toString() || ""}
                                onChange={(e) => {
                                  const fromYear = e.target.value
                                    ? Number(e.target.value)
                                    : undefined;
                                  handleYearChange(fromYear, filters.to);
                                }}
                              >
                                <option value="">Any</option>
                                {Array.from(
                                  { length: 26 },
                                  (_, i) => 2025 - i
                                ).map((year) => (
                                  <option key={`from-${year}`} value={year}>
                                    {year}
                                  </option>
                                ))}
                                <option value="1990">1990s</option>
                                <option value="1980">1980s</option>
                                <option value="1970">Before 1980</option>
                              </select>
                            </div>

                            <div>
                              <Label
                                htmlFor="year-to"
                                className="text-sm mb-1 block"
                              >
                                To
                              </Label>
                              <select
                                id="year-to"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={filters.to?.toString() || ""}
                                onChange={(e) => {
                                  const toYear = e.target.value
                                    ? Number(e.target.value)
                                    : undefined;
                                  handleYearChange(filters.from, toYear);
                                }}
                                disabled={!filters.from}
                              >
                                <option value="">Any</option>
                                {Array.from({ length: 26 }, (_, i) => 2025 - i)
                                  .filter(
                                    (year) =>
                                      !filters.from || year >= filters.from
                                  )
                                  .map((year) => (
                                    <option key={`to-${year}`} value={year}>
                                      {year}
                                    </option>
                                  ))}
                              </select>
                            </div>

                            {(filters.from || filters.to) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleYearChange(undefined, undefined)
                                }
                                className="w-full"
                              >
                                Clear Year Range
                              </Button>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Content Rating */}
                    <Accordion type="single" collapsible defaultValue="content">
                      <AccordionItem value="content">
                        <AccordionTrigger className="text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="h-4 w-4 flex items-center justify-center text-xs">
                              🔞
                            </span>
                            CONTENT RATING
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <RadioGroup
                            value={filters.content_rating || "all"}
                            onValueChange={(value) => {
                              if (value === "all") {
                                handleContentRatingChange(undefined);
                              } else {
                                handleContentRatingChange(value);
                              }
                            }}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="all" id="all-content" />
                              <Label htmlFor="all-content">All</Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem value="safe" id="safe" />
                              <Label htmlFor="safe">Safe</Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem
                                value="suggestive"
                                id="suggestive"
                              />
                              <Label htmlFor="suggestive">Suggestive</Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              <RadioGroupItem value="erotica" id="erotica" />
                              <Label htmlFor="erotica">Erotica</Label>
                            </div>
                          </RadioGroup>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </ScrollArea>

                {/* Apply filters button - only visible on mobile */}
                <Button
                  className="w-full md:hidden mt-4"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Results area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                {isLoading ? "Searching..." : `${totalResults} manga found`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(viewMode === "grid" && "bg-muted")}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="sr-only">Grid view</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(viewMode === "list" && "bg-muted")}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">List view</span>
                </Button>
              </div>
            </div>

            {/* Active filters */}
            {(filters.genres.length > 0 ||
              filters.excludes.length > 0 ||
              filters.demographic.length > 0 ||
              filters.country.length > 0 ||
              filters.status !== undefined ||
              filters.content_rating !== undefined ||
              filters.from !== undefined ||
              filters.completed) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {genre}
                    <button onClick={() => toggleGenre(genre)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.excludes.map((genre) => (
                  <Badge
                    key={genre}
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    Not {genre}
                    <button
                      onClick={() => toggleGenre(genre, true)}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {filters.demographic.map((demo) => {
                  const demoName =
                    demo === 1
                      ? "Shounen"
                      : demo === 2
                      ? "Shoujo"
                      : demo === 3
                      ? "Seinen"
                      : demo === 4
                      ? "Josei"
                      : "Unknown";
                  return (
                    <Badge
                      key={demo}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {demoName}
                      <button
                        onClick={() => toggleDemographic(demo)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                {filters.country.map((country) => {
                  const countryName =
                    country === "jp"
                      ? "Japan"
                      : country === "kr"
                      ? "Korea"
                      : country === "cn"
                      ? "China"
                      : "Other";
                  return (
                    <Badge
                      key={country}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {countryName}
                      <button
                        onClick={() => toggleCountry(country)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
                {filters.status !== undefined && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {getStatusText(filters.status)}
                    <button
                      onClick={() => handleStatusChange(undefined)}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.content_rating !== undefined && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {filters.content_rating.charAt(0).toUpperCase() +
                      filters.content_rating.slice(1)}
                    <button
                      onClick={() => handleContentRatingChange(undefined)}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.from !== undefined && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    From {filters.from}
                    <button
                      onClick={() => handleYearChange(undefined, undefined)}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.completed && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Completed Translation
                    <button onClick={() => toggleCompleted()} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array(12)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-[240px] w-full rounded-md" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-[120px] w-[80px] rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    ))}
                </div>
              )
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No manga found matching your criteria
                </div>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                {/* Grid view */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {results.map((manga) => {
                      const coverKey =
                        manga.md_covers && manga.md_covers.length > 0
                          ? manga.md_covers[0].b2key
                          : null;

                      return (
                        <Card
                          key={manga.id}
                          className="overflow-hidden h-full border-0 bg-transparent"
                        >
                          <a
                            href={`/comic/${manga.slug}`}
                            className="block h-full relative group"
                          >
                            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                              {coverKey ? (
                                <div className="relative w-full h-full">
                                  <Image
                                    src={
                                      getCoverImageUrl(coverKey) ||
                                      "/placeholder.svg"
                                    }
                                    alt={manga.title || "Manga cover"}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                    priority={false}
                                    loading="lazy"
                                  />

                                  {/* Status badge */}
                                  {manga.status && (
                                    <div
                                      className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(
                                        manga.status
                                      )}`}
                                    >
                                      {getStatusText(manga.status)}
                                    </div>
                                  )}

                                  {/* Country badge */}
                                  <div className="absolute top-2 left-2 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded-sm">
                                    {getMangaType(manga.country)}
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <Book className="h-12 w-12 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Title and info with dark gradient background */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 pt-10">
                              <h3 className="font-medium text-sm text-white line-clamp-2 mb-2">
                                {manga.title || "Unknown Title"}
                              </h3>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-300 flex items-center">
                                  <Book className="h-3 w-3 mr-1" /> Ch.{" "}
                                  {manga.last_chapter || "?"}
                                </span>
                                {manga.rating && (
                                  <span className="text-xs text-yellow-400 flex items-center">
                                    ★{" "}
                                    {Number.parseFloat(manga.rating).toFixed(1)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-300 flex items-center">
                                  {manga.follow_count &&
                                    `${manga.follow_count.toLocaleString()} follows`}
                                </span>
                                {manga.year && (
                                  <span className="text-xs text-gray-300">
                                    {manga.year}
                                  </span>
                                )}
                              </div>
                            </div>
                          </a>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* List view */}
                {viewMode === "list" && (
                  <div className="space-y-4">
                    {results.map((manga) => {
                      const coverKey =
                        manga.md_covers && manga.md_covers.length > 0
                          ? manga.md_covers[0].b2key
                          : null;

                      return (
                        <Card key={manga.id} className="overflow-hidden">
                          <a
                            href={`/comic/${manga.slug}`}
                            className="flex p-4 gap-4"
                          >
                            <div className="relative h-[120px] w-[80px] overflow-hidden rounded-md flex-shrink-0">
                              {coverKey ? (
                                <Image
                                  src={
                                    getCoverImageUrl(coverKey) ||
                                    "/placeholder.svg"
                                  }
                                  alt={manga.title || "Manga cover"}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                  priority={false}
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <Book className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-base line-clamp-1">
                                  {manga.title || "Unknown Title"}
                                </h3>
                                {manga.rating && (
                                  <span className="text-xs text-yellow-400 flex items-center whitespace-nowrap">
                                    ★{" "}
                                    {Number.parseFloat(manga.rating).toFixed(1)}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {getMangaType(manga.country)}
                                </Badge>
                                {manga.status && (
                                  <Badge
                                    className={`text-xs text-white ${getStatusColor(
                                      manga.status
                                    )}`}
                                  >
                                    {getStatusText(manga.status)}
                                  </Badge>
                                )}
                                {manga.year && (
                                  <Badge variant="outline" className="text-xs">
                                    {manga.year}
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {manga.desc || "No description available."}
                              </p>

                              <div className="flex items-center text-xs text-muted-foreground gap-4 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Book className="h-3 w-3" /> Ch.{" "}
                                  {manga.last_chapter || "?"}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> Updated{" "}
                                  {new Date(
                                    manga.uploaded_at
                                  ).toLocaleDateString()}
                                </span>
                                {manga.follow_count && (
                                  <span className="flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />{" "}
                                    {manga.follow_count.toLocaleString()}{" "}
                                    follows
                                  </span>
                                )}
                                {manga.view_count > 0 && (
                                  <span className="flex items-center gap-1">
                                    <span className="h-3 w-3">👁️</span>{" "}
                                    {manga.view_count.toLocaleString()} views
                                  </span>
                                )}
                              </div>
                            </div>
                          </a>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalResults > 0 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(Math.max(1, filters.page - 1))
                        }
                        disabled={filters.page <= 1}
                      >
                        Previous
                      </Button>

                      <span className="text-sm px-4">Page {filters.page}</span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={results.length < filters.limit}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
