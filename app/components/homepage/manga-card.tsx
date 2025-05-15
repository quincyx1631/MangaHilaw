import Image from "next/image";
import { Book, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { MangaChapter } from "@/app/types/manga";

interface MangaCardProps {
  manga: MangaChapter;
}

export function MangaCard({ manga }: MangaCardProps) {
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

  const getMangaType = (countryCode: string) => {
    switch (countryCode.toLowerCase()) {
      case "jp":
        return "Manga";
      case "kr":
        return "Manhwa";
      case "cn":
        return "Manhua";
      default:
        return "International";
    }
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) {
      return `${diffSec}s`;
    } else if (diffMin < 60) {
      return `${diffMin}m`;
    } else if (diffHrs < 24) {
      return `${diffHrs}h`;
    } else if (diffDays < 30) {
      return `${diffDays}d`;
    } else {
      return past.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const coverKey = manga.md_comics?.md_covers?.[0]?.b2key;
  const coverUrl = coverKey ? `/api/image/${coverKey}` : "/placeholder.svg";
  const mangaType = getMangaType(manga.md_comics?.country || "");

  return (
    <Card className="overflow-hidden h-full rounded-lg border-0 bg-transparent">
      <a
        href={`/comic/${manga.md_comics?.slug || manga.id}`}
        className="block h-full relative group"
      >
        <div className="relative aspect-[2/3.2] overflow-hidden rounded-lg">
          {coverKey ? (
            <div className="relative w-full h-full">
              <Image
                src={coverUrl || "/placeholder.svg"}
                alt={manga.md_comics?.title || "Manga cover"}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                priority={false}
                loading="lazy"
              />

              {/* Status badge */}
              {manga.md_comics?.status && (
                <div
                  className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(
                    manga.md_comics.status
                  )}`}
                >
                  {getStatusText(manga.md_comics.status)}
                </div>
              )}

              {/* Time overlay */}
              <div className="absolute top-2 left-2 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getRelativeTime(manga.updated_at)}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Book className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Title and chapter info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 pt-10">
          <h3 className="font-medium text-sm text-white line-clamp-2 mb-2">
            {manga.md_comics?.title || "Unknown Title"}
          </h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-300 flex items-center">
              <Book className="h-3 w-3 mr-1" /> Chapter {manga.chap}
            </span>
            <span className="text-xs text-gray-300 bg-black/30 px-1.5 py-0.5 rounded">
              {mangaType}
            </span>
          </div>
        </div>
      </a>
    </Card>
  );
}
