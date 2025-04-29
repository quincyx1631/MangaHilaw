"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Book, Search, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Import the components
import { MangaCard } from "./components/manga-card";
import { NewMangaItem } from "./components/new-manga-item";
import { ThemeToggle } from "./components/theme-toggle";
import type { MangaChapter } from "./types/manga";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const [hotManga, setHotManga] = useState<MangaChapter[]>([]);
  const [newManga, setNewManga] = useState<MangaChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(10); // Default value
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 30;

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

  useEffect(() => {
    const fetchManga = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try fetching directly from the external API first
        console.log("Fetching hot manga data...");
        const hotResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/chapter/?page=${currentPage}&order=hot&limit=${itemsPerPage}`,
          { cache: "no-store" }
        );

        if (!hotResponse.ok) {
          throw new Error(`API responded with status: ${hotResponse.status}`);
        }

        const hotData = await hotResponse.json();
        console.log("Hot manga data received:", hotData.length || "object");
        setHotManga(Array.isArray(hotData) ? hotData : [hotData]);

        // Fetch new manga
        console.log("Fetching new manga data...");
        const newResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/chapter/?page=1&order=new&limit=10`,
          {
            cache: "no-store",
          }
        );

        if (!newResponse.ok) {
          throw new Error(`API responded with status: ${newResponse.status}`);
        }

        const newData = await newResponse.json();
        console.log("New manga data received:", newData.length || "object");
        setNewManga(Array.isArray(newData) ? newData : [newData]);

        // Set total pages based on response
        // In a real app, you would get this from the API's pagination info
        setTotalPages(10);
      } catch (error) {
        console.error("Error fetching manga:", error);
        setError("Failed to load manga data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    router.push(`/?page=${page}`);
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];

    // Always show first page
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

    // Show ellipsis if current page is > 3
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown

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

    // Show ellipsis if current page is < totalPages - 2
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if totalPages > 1
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
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Book className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl hidden sm:inline-block">
                MangaHilaw
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search manga..." className="pl-8" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Add the theme toggle button */}
              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Categories
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category}>
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="grid gap-4 py-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search manga..." className="pl-8" />
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

          <div className="mt-4 md:hidden relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search manga..." className="pl-8" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Mobile New Releases - Only visible on small screens */}
        <div className="block md:hidden mb-6">
          <h2 className="text-xl font-bold mb-4">New Releases</h2>
          {error ? (
            <div className="p-4 text-center">
              <p className="text-destructive text-sm">
                Failed to load new releases
              </p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-20 w-14 rounded-md" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {newManga.slice(0, 4).map((manga) => (
                <NewMangaItem key={manga.id} manga={manga} />
              ))}
            </div>
          )}
          <div className="mt-2 text-center">
            <Button variant="link" size="sm">
              View All New Releases
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-9">
            <h1 className="text-2xl font-bold mb-4">Popular Manga</h1>

            {error ? (
              <div className="p-8 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array(12)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-[180px] w-full rounded-md" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

          {/* Desktop New Releases - Only visible on medium screens and up */}
          <div className="hidden md:block md:col-span-3">
            <div className="sticky top-[5rem]">
              <h2 className="text-xl font-bold mb-4">New Releases</h2>

              {error ? (
                <div className="p-4 text-center">
                  <p className="text-destructive text-sm">
                    Failed to load new releases
                  </p>
                </div>
              ) : loading ? (
                <div className="space-y-4">
                  {Array(10)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex gap-2">
                        <Skeleton className="h-20 w-14 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-2 border rounded-lg p-2 bg-card">
                  {newManga.map((manga) => (
                    <NewMangaItem key={manga.id} manga={manga} />
                  ))}
                </div>
              )}
            </div>
          </div>
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
