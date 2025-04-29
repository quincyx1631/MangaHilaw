import Image from "next/image";
import Link from "next/link";
import { Book, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { MangaChapter } from "@/app/types/manga";

interface MangaCardProps {
  manga: MangaChapter;
}

export function MangaCard({ manga }: MangaCardProps) {
  const getCoverImageUrl = (b2key: string) => {
    return `${process.env.NEXT_PUBLIC_IMG_URL}/${b2key}`;
  };

  // Format date to "Apr 27" style
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Get status text based on status code
  const getStatusText = (statusCode: number) => {
    switch (statusCode) {
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

  // Get status color based on status code
  const getStatusColor = (statusCode: number) => {
    switch (statusCode) {
      case 1:
        return "bg-blue-500";
      case 2:
        return "bg-green-500";
      case 3:
        return "bg-red-500";
      case 4:
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="overflow-hidden h-full rounded-lg border-0 bg-transparent">
      <Link
        href={`/comic/${manga.md_comics?.slug || manga.id}`}
        className="block h-full relative group"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
          {manga.md_comics?.md_covers?.[0]?.b2key ? (
            <div className="relative w-full h-full">
              <Image
                src={
                  getCoverImageUrl(manga.md_comics.md_covers[0].b2key) ||
                  "/placeholder.svg"
                }
                alt={manga.md_comics?.title || "Manga cover"}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />

              {/* Status badge */}
              {manga.md_comics?.status && (
                <div
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium text-white ${getStatusColor(
                    manga.md_comics.status
                  )}`}
                >
                  {getStatusText(manga.md_comics.status)}
                </div>
              )}

              {/* Date overlay */}
              <div className="absolute top-2 left-2 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(manga.updated_at)}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Book className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Title and chapter info with dark gradient background */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3 pt-8">
          <h3 className="font-medium text-sm text-white line-clamp-2">
            {manga.md_comics?.title || "Unknown Title"}
          </h3>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-300 flex items-center">
              <Book className="h-3 w-3 mr-1" /> Chapter {manga.chap}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
