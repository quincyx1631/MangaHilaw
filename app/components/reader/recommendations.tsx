"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecommendationCover {
  vol: string;
  w: number;
  h: number;
  b2key: string;
}

interface RecommendationRelates {
  title: string;
  slug: string;
  hid: string;
  md_covers: RecommendationCover[];
}

interface Recommendation {
  up: number;
  down: number;
  total: number;
  relates: RecommendationRelates;
}

interface MangaRecommendationsProps {
  recommendations: Recommendation[];
}

export function MangaRecommendations({
  recommendations,
}: MangaRecommendationsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check if recommendations array is empty or contains no valid items
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  // Filter out any invalid recommendations (missing relates data)
  const validRecommendations = recommendations.filter(
    (rec) => rec.relates && rec.relates.title && rec.relates.slug
  );

  if (validRecommendations.length === 0) {
    return null;
  }

  const getCoverImage = (covers: RecommendationCover[]) => {
    if (!covers || covers.length === 0) {
      return "/placeholder.svg?height=400&width=280";
    }
    const cover = covers[0];
    return `/api/image/${cover.b2key}`;
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = 320; // Width of card + gap
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  const getVotePercentage = (up: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((up / (up + Math.abs(total - up))) * 100);
  };

  return (
    <div className="mt-8 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Recommendations</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {validRecommendations.map((recommendation, index) => (
            <Link
              key={`${recommendation.relates.hid}-${index}`}
              href={`/comic/${recommendation.relates.slug}`}
              className="flex-none"
            >
              <Card className="w-72 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                <CardContent className="p-0">
                  <div className="flex">
                    {/* Cover Image */}
                    <div className="relative w-20 h-28 flex-shrink-0">
                      <Image
                        src={
                          getCoverImage(recommendation.relates.md_covers) ||
                          "/placeholder.svg"
                        }
                        alt={recommendation.relates.title}
                        fill
                        className="object-cover rounded-l-lg"
                        sizes="80px"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                          {recommendation.relates.title}
                        </h3>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{recommendation.up}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <ThumbsDown className="h-3 w-3" />
                            <span>{Math.abs(recommendation.down)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            getVotePercentage(
                              recommendation.up,
                              recommendation.total
                            ) >= 70
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {getVotePercentage(
                            recommendation.up,
                            recommendation.total
                          )}
                          % match
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {recommendation.total > 0
                            ? `+${recommendation.total}`
                            : recommendation.total}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Gradient overlays for scroll indication */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
