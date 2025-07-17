"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Trash2,
  BookOpen,
  Calendar,
  Search,
  Grid3X3,
  List,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useAuth } from "@/context/auth-context";
import type { Bookmark, ReadingStatus } from "@/app/types/bookmark";
import {
  getStatusText,
  getStatusColorClass,
  getMangaType,
} from "@/app/utils/helpers";

const readingStatusLabels: Record<ReadingStatus, string> = {
  plan_to_read: "Plan to Read",
  reading: "Reading",
  on_hold: "On Hold",
  dropped: "Dropped",
  completed: "Completed",
};

const readingStatusColors: Record<ReadingStatus, string> = {
  plan_to_read: "bg-gray-500",
  reading: "bg-blue-500",
  on_hold: "bg-yellow-500",
  dropped: "bg-red-500",
  completed: "bg-green-500",
};

export default function BookmarksPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedReadingStatus, setSelectedReadingStatus] = useState<
    ReadingStatus | "all"
  >("all");

  const {
    bookmarks,
    loading,
    fetchBookmarks,
    fetchBookmarksByStatus,
    removeBookmark,
  } = useBookmarks();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (selectedReadingStatus === "all") {
        fetchBookmarks();
      } else {
        fetchBookmarksByStatus(selectedReadingStatus);
      }
    }
  }, [
    isAuthenticated,
    selectedReadingStatus,
    fetchBookmarks,
    fetchBookmarksByStatus,
  ]);

  useEffect(() => {
    let filtered = bookmarks;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((bookmark) =>
        bookmark.manga_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookmarks(filtered);
  }, [bookmarks, searchTerm]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getReadingStatusStats = () => {
    const stats = bookmarks.reduce((acc, bookmark) => {
      const status = bookmark.reading_status || "plan_to_read";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<ReadingStatus, number>);

    return stats;
  };

  const hasActiveFilters = selectedReadingStatus !== "all" || searchTerm !== "";

  const clearAllFilters = () => {
    setSelectedReadingStatus("all");
    setSearchTerm("");
  };

  const handleRemoveBookmark = async (
    bookmarkId: string,
    mangaTitle: string
  ) => {
    await removeBookmark(bookmarkId, mangaTitle);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">My Bookmarks</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to view your bookmarks.
          </p>
          <Button asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
      {/* Header with integrated search and controls */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold">My Bookmarks</h1>
            <p className="text-sm text-muted-foreground">
              {filteredBookmarks.length} of {bookmarks.length} bookmarks
              {selectedReadingStatus !== "all" && (
                <span className="ml-1">
                  · {readingStatusLabels[selectedReadingStatus]}
                </span>
              )}
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="w-12 h-8"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="w-12 h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search your bookmarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Reading Status Filter */}
          <div className="flex items-center gap-2 sm:min-w-[200px]">
            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Select
              value={selectedReadingStatus}
              onValueChange={(value) =>
                setSelectedReadingStatus(value as ReadingStatus | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center justify-between w-full">
                    <span>All Status</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({bookmarks.length})
                    </span>
                  </div>
                </SelectItem>
                {Object.entries(readingStatusLabels).map(([status, label]) => {
                  const count =
                    getReadingStatusStats()[status as ReadingStatus] || 0;
                  return (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              readingStatusColors[status as ReadingStatus]
                            }`}
                          />
                          <span>{label}</span>
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({count})
                        </span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Active filters:</span>
            <div className="flex items-center gap-2">
              {selectedReadingStatus !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {readingStatusLabels[selectedReadingStatus]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedReadingStatus("all")}
                  />
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
              : "space-y-3"
          }
        >
          {Array(12)
            .fill(0)
            .map((_, i) =>
              viewMode === "grid" ? (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-0">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <div className="p-3">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Skeleton className="w-16 h-20 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2 mb-1" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            {bookmarks.length === 0
              ? "No bookmarks yet"
              : hasActiveFilters
              ? "No bookmarks match your filters"
              : "No bookmarks found"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
            {bookmarks.length === 0
              ? "Start exploring manga and bookmark your favorites!"
              : hasActiveFilters
              ? "Try adjusting your search terms or filters"
              : "Try adjusting your search terms"}
          </p>
          {bookmarks.length === 0 ? (
            <Button asChild>
              <Link href="/">Browse Manga</Link>
            </Button>
          ) : hasActiveFilters ? (
            <Button onClick={clearAllFilters} variant="outline">
              Clear Filters
            </Button>
          ) : null}
        </div>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredBookmarks.map((bookmark) => (
            <Card
              key={bookmark.id}
              className="overflow-hidden group hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-0">
                <Link href={`/comic/${bookmark.manga_slug}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={
                        bookmark.manga_cover_b2key
                          ? `/api/image/${bookmark.manga_cover_b2key}`
                          : "/placeholder.svg?height=200&width=150"
                      }
                      alt={bookmark.manga_title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />

                    {/* Status badge */}
                    <div
                      className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-xs font-medium text-white ${getStatusColorClass(
                        bookmark.manga_status,
                        true
                      )}`}
                    >
                      {getStatusText(bookmark.manga_status)}
                    </div>

                    {/* Reading Status badge */}
                    {bookmark.reading_status && (
                      <div
                        className={`absolute top-7 right-1 px-1.5 py-0.5 rounded text-xs font-medium text-white ${
                          readingStatusColors[bookmark.reading_status]
                        }`}
                      >
                        {readingStatusLabels[bookmark.reading_status]}
                      </div>
                    )}

                    {/* Type badge */}
                    <div className="absolute top-1 left-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs">
                      {getMangaType(bookmark.manga_country)}
                    </div>

                    {/* Delete button overlay */}
                    <button
                      className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        handleRemoveBookmark(bookmark.id, bookmark.manga_title);
                      }}
                    >
                      <Trash2 className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </Link>

                <div className="p-2 sm:p-3">
                  <Link href={`/comic/${bookmark.manga_slug}`}>
                    <h3 className="font-medium text-xs sm:text-sm line-clamp-1 hover:text-primary transition-colors mb-1">
                      {bookmark.manga_title}
                    </h3>
                  </Link>

                  {bookmark.last_read_chapter && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <BookOpen className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        Ch. {bookmark.last_read_chapter}
                      </span>
                    </div>
                  )}

                  {bookmark.reading_status && (
                    <div className="flex items-center gap-1 text-xs mb-1">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          readingStatusColors[bookmark.reading_status]
                        }`}
                      />
                      <span className="text-muted-foreground truncate">
                        {readingStatusLabels[bookmark.reading_status]}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {formatDate(bookmark.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredBookmarks.map((bookmark) => (
            <Card
              key={bookmark.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-3 sm:gap-4">
                  <Link
                    href={`/comic/${bookmark.manga_slug}`}
                    className="flex-shrink-0"
                  >
                    <div className="relative w-14 h-20 sm:w-16 sm:h-20 overflow-hidden rounded">
                      <Image
                        src={
                          bookmark.manga_cover_b2key
                            ? `/api/image/${bookmark.manga_cover_b2key}`
                            : "/placeholder.svg?height=80&width=60"
                        }
                        alt={bookmark.manga_title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Link href={`/comic/${bookmark.manga_slug}`}>
                          <h3 className="font-semibold text-sm sm:text-base line-clamp-1 hover:text-primary transition-colors">
                            {bookmark.manga_title}
                          </h3>
                        </Link>

                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getMangaType(bookmark.manga_country)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs text-white border-0 ${getStatusColorClass(
                              bookmark.manga_status,
                              true
                            )}`}
                          >
                            {getStatusText(bookmark.manga_status)}
                          </Badge>
                          {bookmark.reading_status && (
                            <Badge
                              variant="outline"
                              className={`text-xs text-white border-0 ${
                                readingStatusColors[bookmark.reading_status]
                              }`}
                            >
                              {readingStatusLabels[bookmark.reading_status]}
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                          {bookmark.last_read_chapter && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>Chapter {bookmark.last_read_chapter}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Added {formatDate(bookmark.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs sm:text-sm"
                        >
                          <Link href={`/comic/${bookmark.manga_slug}`}>
                            View
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            handleRemoveBookmark(
                              bookmark.id,
                              bookmark.manga_title
                            )
                          }
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
