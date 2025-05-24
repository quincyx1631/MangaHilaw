"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import type { BookmarkInput } from "@/app/types/bookmark";

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

export function BookmarkButton({
  mangaData,
  variant = "outline",
  size = "default",
  className,
  showText = true,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const { addBookmark, removeBookmark, checkBookmark, loading } =
    useBookmarks();
  const { isAuthenticated } = useAuth();

  // Check bookmark status when component mounts or manga changes
  useEffect(() => {
    const checkStatus = async () => {
      if (!isAuthenticated || !mangaData.manga_id) return;

      setChecking(true);
      try {
        const result = await checkBookmark(mangaData.manga_id);
        setIsBookmarked(result.isBookmarked);
        setBookmarkId(result.bookmarkData?.id || null);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      } finally {
        setChecking(false);
      }
    };

    checkStatus();
  }, [mangaData.manga_id, isAuthenticated, checkBookmark]);

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      // You could show a login modal here
      return;
    }

    if (isBookmarked && bookmarkId) {
      // Remove bookmark
      const success = await removeBookmark(bookmarkId, mangaData.manga_title);
      if (success) {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } else {
      // Add bookmark
      const bookmarkInput: BookmarkInput = {
        manga_id: mangaData.manga_id,
        manga_hid: mangaData.manga_hid,
        manga_title: mangaData.manga_title,
        manga_slug: mangaData.manga_slug,
        manga_cover_b2key: mangaData.manga_cover_b2key,
        manga_status: mangaData.manga_status || 1,
        manga_country: mangaData.manga_country || "jp",
      };

      const success = await addBookmark(bookmarkInput);

      if (success) {
        setIsBookmarked(true);
        // Note: We don't have the bookmark ID immediately, but it will be updated on next check
      }
    }
  };

  const isLoading = loading || checking;

  if (!isAuthenticated) {
    return null; // Or show a disabled state
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBookmarkToggle}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2",
        isBookmarked &&
          "text-yellow-600 border-yellow-600 hover:text-yellow-700 hover:border-yellow-700",
        className
      )}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span>
          {isLoading ? "Loading..." : isBookmarked ? "Bookmarked" : "Bookmark"}
        </span>
      )}
    </Button>
  );
}
