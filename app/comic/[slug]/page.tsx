//comic/[slug]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Calendar,
  ThumbsUp,
  BookOpen,
  Users,
  BookMarked,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";

import type {
  Chapter,
  ChapterResponse,
  ComicResponse,
  MangaInfo,
  MangaCover,
  MangaGenre,
} from "@/app/types/mangaInfo";

export default function MangaReader() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [mangaInfo, setMangaInfo] = useState<MangaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalChapters, setTotalChapters] = useState(0);
  const { slug } = useParams() as { slug: string };
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const [uniqueGroups, setUniqueGroups] = useState<string[]>([]);
  const [chapterOrder, setChapterOrder] = useState<0 | 1>(0);
  const chaptersPerPage = 15;

  const fetchMangaData = async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching manga data for slug:", slug);

    try {
      const mangaResponse = await fetch(`/api/manga/comic/${slug}`);
      if (!mangaResponse.ok) {
        throw new Error(`Failed to fetch manga info: ${mangaResponse.status}`);
      }

      const mangaData: ComicResponse = await mangaResponse.json();
      console.log("Manga data received:", mangaData);

      const mangaHid = mangaData.comic.hid;
      setMangaInfo(mangaData.comic);

      console.log(
        "Fetching chapters for hid:",
        mangaHid,
        "with order:",
        chapterOrder
      );
      const chaptersResponse = await fetch(
        `/api/manga/comic/${mangaHid}/chapters?limit=9999&page=1&chap-order=${chapterOrder}&lang=en`
      );

      if (!chaptersResponse.ok) {
        throw new Error(`Failed to fetch chapters: ${chaptersResponse.status}`);
      }

      const chaptersData: ChapterResponse = await chaptersResponse.json();
      console.log("Chapters received:", chaptersData.chapters.length);

      if (chaptersData.chapters.length === 0) {
        setError("No chapters found.");
        setChapters([]);
        setTotalChapters(0);
        return;
      }

      setChapters(chaptersData.chapters);
      setTotalChapters(chaptersData.total);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      setPage(1);
      setChapters([]);
      fetchMangaData();
    }

    return () => {
      setMangaInfo(null);
      setChapters([]);
      setUniqueGroups([]);
    };
  }, [slug, chapterOrder]);

  // Filter and paginate chapters
  const filteredChapters = chapters.filter((chapter) => {
    const matchesChapter = searchTerm
      ? chapter.chap.trim().toLowerCase() === searchTerm.trim().toLowerCase()
      : true;

    const matchesGroup = searchGroup
      ? chapter.group_name.some((group) =>
          group.toLowerCase().includes(searchGroup.toLowerCase())
        )
      : true;

    return matchesChapter && matchesGroup;
  });

  const paginatedChapters = filteredChapters.slice(
    (page - 1) * chaptersPerPage,
    page * chaptersPerPage
  );
  const totalFiltered = filteredChapters.length;
  const totalPages = Math.ceil(totalFiltered / chaptersPerPage);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    // Update unique groups when chapters change
    const groups = new Set<string>();
    chapters.forEach((chapter) => {
      chapter.group_name.forEach((group) => {
        groups.add(group);
      });
    });
    setUniqueGroups(Array.from(groups).sort());
  }, [chapters]);

  const handleLoadMore = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMangaData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0:
        return "Unknown";
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

  const getCoverImage = (covers: MangaCover[]) => {
    if (!covers || covers.length === 0)
      return "/placeholder.svg?height=911&width=629";
    const cover = covers[0];
    return `/api/image/${cover.b2key}`;
  };

  const getGenres = (genreData: MangaGenre[]) => {
    if (!genreData) return [];
    return genreData.map((item) => ({
      name:
        typeof item.md_genres?.name === "string"
          ? item.md_genres.name
          : "Unknown",
    }));
  };

  const handleOrderChange = () => {
    const newOrder = chapterOrder === 0 ? 1 : 0;
    setChapterOrder(newOrder);
    setPage(1);

    // Sort chapters client-side instead of refetching
    setChapters((prev) => {
      const sorted = [...prev].sort((a, b) => {
        // Compare by publish date instead of chapter number for better sorting
        const dateA = new Date(a.publish_at).getTime();
        const dateB = new Date(b.publish_at).getTime();

        if (newOrder === 0) {
          // Newest first (descending by date)
          return dateB - dateA;
        } else {
          // Oldest first (ascending by date)
          return dateA - dateB;
        }
      });
      return sorted;
    });
  };

  if (loading) return <MangaInfoSkeleton />;
  if (error) {
    return (
      <div className="container mx-auto px-3 py-8 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }
  if (!mangaInfo) return null;

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      {loading ? (
        <MangaInfoSkeleton />
      ) : (
        <>
          {/* Manga Info Section */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 md:mb-8">
            <div
              className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0"
              style={{ maxWidth: "250px" }}
            >
              <div className="relative aspect-[629/911] w-full rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={getCoverImage(mangaInfo.md_covers) || "/placeholder.svg"}
                  alt={mangaInfo.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 mt-3 md:mt-0 text-center md:text-left">
                {mangaInfo.title}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 sm:gap-2 mb-4">
                {getGenres(mangaInfo.md_comic_md_genres).map((genre, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {genre.name}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 text-center md:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mx-auto md:mx-0" />
                  <span className="text-xs sm:text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    {getStatusText(mangaInfo.status)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <BookMarked className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mx-auto md:mx-0" />
                  <span className="text-xs sm:text-sm">
                    <span className="font-medium">Chapters:</span>{" "}
                    {mangaInfo.chapter_count}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mx-auto md:mx-0" />
                  <span className="text-xs sm:text-sm">
                    <span className="font-medium">Followers:</span>{" "}
                    {mangaInfo.user_follow_count.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-center md:text-left">
                  Synopsis
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-4 sm:line-clamp-none">
                  {mangaInfo.desc}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button className="w-full sm:w-auto">Read First Chapter</Button>
                <Button variant="outline" className="w-full sm:w-auto">
                  Read Latest Chapter
                </Button>
              </div>
            </div>
          </div>

          {/* Chapter List Section */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">Chapters</h2>
              <div className="text-xs sm:text-sm text-muted-foreground">
                {chapters.length} of {totalChapters} chapters
              </div>
            </div>

            <div className="mb-4">
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by chapter number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex-1">
                  <select
                    value={searchGroup}
                    onChange={(e) => setSearchGroup(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">All Scanlation Groups</option>
                    {uniqueGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-none">
                  <Button
                    variant="outline"
                    onClick={handleOrderChange}
                    className="w-full sm:w-auto h-full flex items-center gap-2"
                  >
                    {chapterOrder === 0 ? (
                      <>
                        Newest First{" "}
                        <ChevronRight className="h-4 w-4 rotate-90" />
                      </>
                    ) : (
                      <>
                        Oldest First{" "}
                        <ChevronRight className="h-4 w-4 -rotate-90" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {(searchTerm || searchGroup) && (
                <div className="flex justify-between items-center text-sm">
                  <div>Found {filteredChapters.length} chapter(s)</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setSearchGroup("");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2 sm:space-y-3">
              {paginatedChapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/comic/${mangaInfo.slug}/chapter/${chapter.hid}`}
                  className="block"
                >
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <div className="font-bold text-base sm:text-lg">
                            Ch. {chapter.chap}
                          </div>
                          <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            {formatDate(chapter.publish_at)}
                          </div>
                          <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 sm:hidden" />
                            <span className="sm:hidden">
                              {formatDateShort(chapter.publish_at)}
                            </span>
                            <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 ml-2 sm:ml-0" />
                            {chapter.up_count}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0 sm:px-2 sm:py-0.5"
                          >
                            {chapter.group_name[0]}
                          </Badge>
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {totalFiltered === 0 && (searchTerm || searchGroup) && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No chapters match your search criteria.
                </p>
              </div>
            )}

            {totalFiltered > chaptersPerPage && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  className="mx-1"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <span className="p-2 text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  className="mx-1"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MangaInfoSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6 md:mb-8">
      <div
        className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0"
        style={{ maxWidth: "250px" }}
      >
        <Skeleton className="aspect-[629/911] w-full rounded-lg" />
      </div>

      <div className="flex-1">
        <Skeleton className="h-8 sm:h-10 w-3/4 mx-auto md:mx-0 mb-4" />

        <div className="flex flex-wrap justify-center md:justify-start gap-1.5 sm:gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-5 sm:h-6 w-16 sm:w-20" />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-5 sm:h-6 w-full" />
          ))}
        </div>

        <div className="mb-4 sm:mb-6">
          <Skeleton className="h-6 sm:h-8 w-40 mx-auto md:mx-0 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-full mb-2" />
          <Skeleton className="h-3 sm:h-4 w-full mb-2" />
          <Skeleton className="h-3 sm:h-4 w-3/4" />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Skeleton className="h-9 sm:h-10 w-full sm:w-40" />
          <Skeleton className="h-9 sm:h-10 w-full sm:w-40" />
        </div>
      </div>
    </div>
  );
}
