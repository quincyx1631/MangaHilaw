"use client";
import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import type { BookmarkInput, ReadingStatus } from "@/app/types/bookmark";

interface BookmarkButtonProps {
  mangaData: {
    manga_id: string;
    manga_hid: string;
    manga_title: string;
    manga_slug: string;
    manga_cover_b2key?: string;
    manga_status?: number;
    manga_country?: string;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  showText?: boolean;
}

const readingStatusLabels: Record<ReadingStatus, string> = {
  plan_to_read: "Plan to Read",
  reading: "Reading",
  on_hold: "On Hold",
  dropped: "Dropped",
  completed: "Completed",
};

export function BookmarkButton({
  mangaData,
  variant = "outline",
  size = "default",
  className,
  showText = true,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [readingStatus, setReadingStatus] =
    useState<ReadingStatus>("plan_to_read");
  const [checking, setChecking] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    addBookmark,
    removeBookmark,
    checkBookmark,
    updateReadingStatus,
    loading,
  } = useBookmarks();
  const { isAuthenticated } = useAuth();

  // Check bookmark status when component mounts or manga changes
  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated || !mangaData.manga_id) return;
      setChecking(true);
      try {
        const result = await checkBookmark(mangaData.manga_id);
        setIsBookmarked(result.isBookmarked);
        if (result.bookmarkData?.id) {
          setBookmarkId(result.bookmarkData.id);
        }
        if (result.bookmarkData?.reading_status) {
          setReadingStatus(result.bookmarkData.reading_status);
        }
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, [mangaData.manga_id, isAuthenticated, checkBookmark]);

  const handleAddBookmark = async (status: ReadingStatus = "plan_to_read") => {
    const bookmarkInput: BookmarkInput = {
      manga_id: mangaData.manga_id,
      manga_hid: mangaData.manga_hid,
      manga_title: mangaData.manga_title,
      manga_slug: mangaData.manga_slug,
      manga_cover_b2key: mangaData.manga_cover_b2key,
      manga_status: mangaData.manga_status || 1,
      manga_country: mangaData.manga_country || "jp",
      reading_status: status,
    };

    const success = await addBookmark(bookmarkInput);
    if (success) {
      setIsBookmarked(true);
      setReadingStatus(status);
      // Re-check to get the bookmark ID
      const result = await checkBookmark(mangaData.manga_id);
      if (result.bookmarkData?.id) {
        setBookmarkId(result.bookmarkData.id);
      }
    }
  };

  const handleRemoveBookmark = async () => {
    if (!bookmarkId) return;

    const success = await removeBookmark(bookmarkId, mangaData.manga_title);
    if (success) {
      setIsBookmarked(false);
      setBookmarkId(null);
      setReadingStatus("plan_to_read");
    }
  };

  const handleStatusChange = async (newStatus: ReadingStatus) => {
    if (!bookmarkId || isUpdating) return;

    // Optimistically update the UI
    const prevStatus = readingStatus;
    setReadingStatus(newStatus);
    setIsUpdating(true);

    try {
      const success = await updateReadingStatus(bookmarkId, newStatus, true); // Skip refetch
      if (!success) {
        // Revert on failure
        setReadingStatus(prevStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setReadingStatus(prevStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const isLoading = loading || checking || isUpdating;

  if (!isAuthenticated) {
    return null;
  }

  if (!isBookmarked) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={isLoading}
            className={cn("flex items-center gap-2 min-w-0", className)}
          >
            <Bookmark className="h-4 w-4 flex-shrink-0" />
            {showText && (
              <span className="truncate">
                {isLoading ? "Loading..." : "Add to Library"}
              </span>
            )}
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {Object.entries(readingStatusLabels).map(([status, label]) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleAddBookmark(status as ReadingStatus)}
              className="cursor-pointer"
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 min-w-0",
              "text-yellow-600 border-yellow-600 hover:text-yellow-700 hover:border-yellow-700",
              "hover:bg-yellow-50 dark:hover:bg-yellow-950/10",
              className
            )}
          >
            <BookmarkCheck className="h-4 w-4 flex-shrink-0" />
            {showText && (
              <span className="truncate">
                {isUpdating
                  ? "Updating..."
                  : isLoading
                  ? "Loading..."
                  : readingStatusLabels[readingStatus]}
              </span>
            )}
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b">
            Change Status
          </div>
          {Object.entries(readingStatusLabels).map(([status, label]) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleStatusChange(status as ReadingStatus)}
              className={cn(
                "cursor-pointer",
                readingStatus === status &&
                  "bg-accent text-accent-foreground font-medium"
              )}
            >
              <div className="flex items-center justify-between w-full">
                {label}
                {readingStatus === status && (
                  <BookmarkCheck className="h-3 w-3 text-yellow-600" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <div className="border-t">
            <DropdownMenuItem
              onClick={handleRemoveBookmark}
              className="text-destructive cursor-pointer focus:text-destructive"
            >
              Remove from Library
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
