"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Book, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  searchManga,
  getCoverImageUrl,
  type MangaSearchResult,
} from "@/app/components/header/search";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const currentPage = Number(searchParams.get("page")) || 1;
  const [searchQuery, setSearchQuery] = useState(query);
  const [results, setResults] = useState<MangaSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const limit = 20;

  useEffect(() => {
    if (query) {
      performSearch(query, currentPage);
    }
  }, [query, currentPage]);

  const performSearch = async (searchTerm: string, page: number) => {
    if (!searchTerm || searchTerm.length < 2) return;

    setIsLoading(true);
    try {
      const searchResults = await searchManga({
        query: searchTerm,
        page,
        limit,
        showAll: true, // Show all results for advanced search
      });

      setResults(searchResults);
      // Estimate total results - in a real app, this would come from the API
      setTotalResults(
        searchResults.length === limit ? limit * 10 : searchResults.length
      );
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) return;

    router.push(`/search?q=${encodeURIComponent(searchQuery)}&page=1`);
  };

  const handlePageChange = (page: number) => {
    router.push(`/search?q=${encodeURIComponent(query)}&page=${page}`);
  };

  const getMangaType = (country: string) => {
    switch (country) {
      case "jp":
        return "Manga";
      case "kr":
        return "Manhwa";
      case "cn":
        return "Manhua";
      default:
        return "Comic";
    }
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Advanced Search</h1>

        {query && (
          <div className="text-sm text-muted-foreground mb-4">
            Showing results for <span className="font-medium">"{query}"</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : results.length === 0 && query ? (
          <div className="text-center py-12">
            <p className="text-lg mb-2">No results found for "{query}"</p>
            <p className="text-muted-foreground">
              Try a different search term or browse our catalog
            </p>
          </div>
        ) : (
          <>
            {results.length > 0 && (
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
                                "/placeholder.svg" ||
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
                                ★ {Number.parseFloat(manga.rating).toFixed(1)}
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
                              {new Date(manga.uploaded_at).toLocaleDateString()}
                            </span>
                            {manga.follow_count && (
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />{" "}
                                {manga.follow_count.toLocaleString()} follows
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
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={`/search?q=${encodeURIComponent(
                          query
                        )}&page=${Math.max(1, currentPage - 1)}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            handlePageChange(currentPage - 1);
                          }
                        }}
                        aria-disabled={currentPage <= 1}
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {Array.from(
                      { length: Math.min(5, Math.ceil(totalResults / limit)) },
                      (_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            href={`/search?q=${encodeURIComponent(
                              query
                            )}&page=${i + 1}`}
                            isActive={currentPage === i + 1}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(i + 1);
                            }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href={`/search?q=${encodeURIComponent(query)}&page=${
                          currentPage + 1
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (results.length >= limit) {
                            handlePageChange(currentPage + 1);
                          }
                        }}
                        aria-disabled={results.length < limit}
                        className={
                          results.length < limit
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
