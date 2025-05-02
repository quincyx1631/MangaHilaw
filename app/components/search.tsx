"use client";

// Define interfaces for the manga search response
export interface MangaCover {
  w: number;
  h: number;
  b2key: string;
}

export interface MangaTitle {
  title: string;
}

export interface MangaSearchResult {
  id: number;
  hid: string;
  slug: string;
  title: string;
  country: string;
  rating: string;
  bayesian_rating: string;
  rating_count: number;
  follow_count: number;
  desc: string;
  status: number;
  last_chapter: number;
  translation_completed: boolean;
  view_count: number;
  content_rating: string;
  demographic: string | null;
  uploaded_at: string;
  genres: number[];
  created_at: string;
  user_follow_count: number;
  year: number;
  mu_comics: {
    year: number;
  };
  is_english_title: boolean | null;
  md_titles: MangaTitle[];
  md_covers: MangaCover[];
  highlight?: string;
}

export interface SearchParams {
  query: string;
  page?: number;
  limit?: number;
  showAll?: boolean;
}

// Function to get cover image URL from b2key
export function getCoverImageUrl(b2key: string): string {
  // Use the same URL structure as in NewMangaItem
  return `/api/image/${b2key}`;
}

// Main search function
export async function searchManga({
  query,
  page = 1,
  limit = 10,
  showAll = false,
}: SearchParams): Promise<MangaSearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `/api/manga/v1.0/search/?page=${page}&limit=${limit}&showall=${showAll}&q=${encodedQuery}&t=false`
    );

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data as MangaSearchResult[];
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}

// Debounce utility
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<F>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
