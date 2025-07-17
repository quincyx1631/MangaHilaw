import Image from "next/image";
import Link from "next/link";
import { Book, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MangaChapter } from "@/app/types/manga";
import {
  getStatusText,
  getStatusColorClass,
  getMangaType,
} from "@/app/utils/helpers";

interface MangaListCardProps {
  manga: MangaChapter;
}

export function MangaListCard({ manga }: MangaListCardProps) {
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffSec < 60) {
      return `${diffSec}s ago`;
    } else if (diffMin < 60) {
      return `${diffMin}m ago`;
    } else if (diffHrs < 24) {
      return `${diffHrs}h ago`;
    } else if (diffDays < 30) {
      return `${diffDays}d ago`;
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          <Link
            href={`/comic/${manga.md_comics?.slug || manga.id}`}
            className="flex-shrink-0"
          >
            <div className="relative w-16 h-20 sm:w-20 sm:h-24 overflow-hidden rounded">
              <Image
                src={coverUrl || "/placeholder.svg"}
                alt={manga.md_comics?.title || "Manga cover"}
                fill
                sizes="80px"
                className="object-cover transition-transform hover:scale-105"
                loading="lazy"
              />
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <div className="flex-1 min-w-0">
                <Link href={`/comic/${manga.md_comics?.slug || manga.id}`}>
                  <h3 className="font-semibold text-sm sm:text-base line-clamp-2 hover:text-primary transition-colors mb-2">
                    {manga.md_comics?.title || "Unknown Title"}
                  </h3>
                </Link>

                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {mangaType}
                  </Badge>
                  {manga.md_comics?.status && (
                    <Badge
                      variant="outline"
                      className={`text-xs text-white border-0 ${getStatusColorClass(
                        manga.md_comics.status,
                        true
                      )}`}
                    >
                      {getStatusText(manga.md_comics.status)}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Book className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Chapter {manga.chap}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>{getRelativeTime(manga.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
