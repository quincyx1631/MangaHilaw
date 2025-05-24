"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";
import type {
  Bookmark,
  BookmarkInput,
  BookmarkResponse,
  BookmarkCheckResponse,
} from "@/app/types/bookmark";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();

  // Get all bookmarks
  const fetchBookmarks = useCallback(
    async (page = 1, limit = 20) => {
      if (!isAuthenticated || !token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get<BookmarkResponse>(
          `/bookmarks?page=${page}&limit=${limit}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success && Array.isArray(response.data.data)) {
          setBookmarks(response.data.data);
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch bookmarks";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token, toast]
  );

  // Add bookmark
  const addBookmark = useCallback(
    async (bookmarkData: BookmarkInput) => {
      if (!isAuthenticated || !token) {
        toast({
          title: "Authentication required",
          description: "Please log in to bookmark manga",
          variant: "destructive",
        });
        return false;
      }

      setLoading(true);

      try {
        // Ensure manga_country has a default value
        const dataToSend = {
          ...bookmarkData,
          manga_country: bookmarkData.manga_country || "jp",
          manga_status: bookmarkData.manga_status || 1,
        };

        const response = await axiosInstance.post<BookmarkResponse>(
          "/bookmarks",
          dataToSend,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          toast({
            title: "Bookmark added",
            description: `${bookmarkData.manga_title} has been bookmarked`,
            variant: "default",
          });

          // Refresh bookmarks
          await fetchBookmarks();
          return true;
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to add bookmark";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }

      return false;
    },
    [isAuthenticated, token, toast, fetchBookmarks]
  );

  // Remove bookmark
  const removeBookmark = useCallback(
    async (bookmarkId: string, mangaTitle?: string) => {
      if (!isAuthenticated || !token) return false;

      setLoading(true);

      try {
        const response = await axiosInstance.delete(
          `/bookmarks/${bookmarkId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          toast({
            title: "Bookmark removed",
            description: mangaTitle
              ? `${mangaTitle} has been removed from bookmarks`
              : "Bookmark removed",
            variant: "default",
          });

          // Refresh bookmarks
          await fetchBookmarks();
          return true;
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to remove bookmark";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }

      return false;
    },
    [isAuthenticated, token, toast, fetchBookmarks]
  );

  // Check if manga is bookmarked
  const checkBookmark = useCallback(
    async (mangaId: string) => {
      if (!isAuthenticated || !token)
        return { isBookmarked: false, bookmarkData: null };

      try {
        const response = await axiosInstance.get<BookmarkCheckResponse>(
          `/bookmarks/check/${mangaId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          return {
            isBookmarked: response.data.isBookmarked,
            bookmarkData: response.data.bookmarkData,
          };
        }
      } catch (error: any) {
        console.error("Failed to check bookmark status:", error);
      }

      return { isBookmarked: false, bookmarkData: null };
    },
    [isAuthenticated, token]
  );

  // Update reading progress
  const updateReadingProgress = useCallback(
    async (bookmarkId: string, chapterNumber: string, chapterHid: string) => {
      if (!isAuthenticated || !token) return false;

      try {
        const response = await axiosInstance.put(
          `/bookmarks/${bookmarkId}/progress`,
          {
            last_read_chapter: chapterNumber,
            last_read_chapter_hid: chapterHid,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          // Refresh bookmarks to get updated data
          await fetchBookmarks();
          return true;
        }
      } catch (error: any) {
        console.error("Failed to update reading progress:", error);
      }

      return false;
    },
    [isAuthenticated, token, fetchBookmarks]
  );

  return {
    bookmarks,
    loading,
    error,
    fetchBookmarks,
    addBookmark,
    removeBookmark,
    checkBookmark,
    updateReadingProgress,
  };
};
