"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { MangaCard } from "./components/manga-card";
import type { MangaChapter } from "./types/manga";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [hotManga, setHotManga] = useState<MangaChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 30;

  useEffect(() => {
    const fetchManga = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching hot manga data...");
        const hotResponse = await fetch(
          `/api/manga/chapter/?page=${currentPage}&order=hot&limit=${itemsPerPage}`
        );

        if (!hotResponse.ok) {
          throw new Error(`API responded with status: ${hotResponse.status}`);
        }

        const hotData = await hotResponse.json();
        console.log("Hot manga data received:", hotData.length || "object");

        let mangaList: MangaChapter[] = [];

        if (Array.isArray(hotData)) {
          mangaList = hotData;
        } else if (hotData.chapters && Array.isArray(hotData.chapters)) {
          mangaList = hotData.chapters;

          if (hotData.pagination) {
            const totalItems = hotData.pagination.total;
            setTotalPages(Math.ceil(totalItems / itemsPerPage));
          }
        } else {
          mangaList = [hotData];
        }

        const limitedData = mangaList.slice(0, itemsPerPage);
        setHotManga(limitedData);
      } catch (error) {
        console.error("Error fetching manga:", error);
        setError("Failed to load manga data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    router.push(`/?page=${page}`);
  };

  const renderPaginationItems = () => {
    const items = [];
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          href={`/?page=1`}
          isActive={currentPage === 1}
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(1);
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i === 1 || i === totalPages) continue;

      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href={`/?page=${i}`}
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            href={`/?page=${totalPages}`}
            isActive={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Recently Added</h1>

          {error ? (
            <div className="p-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array(itemsPerPage > 20 ? 20 : itemsPerPage)
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {hotManga.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          )}

          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`/?page=${Math.max(1, currentPage - 1)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) {
                      handlePageChange(currentPage - 1);
                    }
                  }}
                  aria-disabled={currentPage <= 1}
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  href={`/?page=${Math.min(totalPages, currentPage + 1)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) {
                      handlePageChange(currentPage + 1);
                    }
                  }}
                  aria-disabled={currentPage >= totalPages}
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </main>

      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MangaHilaw. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
