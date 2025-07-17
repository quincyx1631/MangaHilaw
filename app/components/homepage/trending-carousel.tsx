"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { getStatusText, getStatusColorClass } from "@/app/utils/helpers";
import type { TrendingManga } from "@/app/types/manga";

export function TrendingCarousel() {
  const [trendingManga, setTrendingManga] = useState<TrendingManga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingManga = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "/api/manga/top?day=180&type=trending&accept_mature_content=false"
        );

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        const data = await response.json();
        let mangaList: TrendingManga[] = [];
        if (Array.isArray(data)) {
          mangaList = data;
        } else if (data["180"] && Array.isArray(data["180"])) {
          mangaList = data["180"];
        } else if (data["90"] && Array.isArray(data["90"])) {
          mangaList = data["90"];
        } else if (data["30"] && Array.isArray(data["30"])) {
          mangaList = data["30"];
        } else if (data["7"] && Array.isArray(data["7"])) {
          mangaList = data["7"];
        } else if (data.manga && Array.isArray(data.manga)) {
          mangaList = data.manga;
        } else if (data.data && Array.isArray(data.data)) {
          mangaList = data.data;
        }
        setTrendingManga(mangaList.slice(0, 30));
      } catch (error) {
        console.error("Error fetching trending manga:", error);
        setError("Failed to load trending manga.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingManga();
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Trending</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (error || trendingManga.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Trending</h2>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {error || "No trending manga available at the moment."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Trending</h2>
      </div>

      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: false,
          dragFree: true,
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {trendingManga.map((manga, index) => {
            const coverKey = manga.md_covers?.[0]?.b2key;
            const coverUrl = coverKey
              ? `/api/image/${coverKey}`
              : "/placeholder.svg";
            const ranking = index + 1;

            return (
              <CarouselItem
                key={manga.id}
                className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
              >
                <Card className="overflow-hidden h-full rounded-lg border-0 bg-transparent">
                  <Link
                    href={`/comic/${manga.slug}`}
                    className="block h-full relative group"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                      <Image
                        src={coverUrl || "/placeholder.svg"}
                        alt={manga.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        loading="lazy"
                      />

                      {/* Ranking number */}
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-bold min-w-[24px] text-center">
                        #{ranking}
                      </div>

                      {/* Status badge */}
                      {manga.status && (
                        <div
                          className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white ${getStatusColorClass(
                            manga.status,
                            true
                          )}`}
                        >
                          {getStatusText(manga.status)}
                        </div>
                      )}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-8">
                      <h3 className="font-medium text-sm text-white line-clamp-2">
                        {manga.title}
                      </h3>
                    </div>
                  </Link>
                </Card>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-4 bg-background/80 backdrop-blur-sm border hover:bg-background" />
        <CarouselNext className="hidden sm:flex -right-4 bg-background/80 backdrop-blur-sm border hover:bg-background" />
      </Carousel>
    </div>
  );
}
