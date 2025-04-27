import Image from "next/image";
import Link from "next/link";
import { Book, Clock } from "lucide-react";
import type { MangaChapter } from "@/app/types/manga";

interface NewMangaItemProps {
  manga: MangaChapter;
}

export function NewMangaItem({ manga }: NewMangaItemProps) {
  const getCoverImageUrl = (b2key: string) => {
    return `https://meo.comick.pictures/${b2key}`;
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
        return "text-blue-500";
      case 2:
        return "text-green-500";
      case 3:
        return "text-red-500";
      case 4:
        return "text-amber-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Link
      href={`/manga/${manga.md_comics?.slug || manga.id}`}
      className="flex gap-3 group p-2 rounded-lg transition-colors hover:bg-accent"
    >
      <div className="relative h-20 w-14 overflow-hidden rounded-md flex-shrink-0 border">
        {manga.md_comics?.md_covers?.[0]?.b2key ? (
          <div className="relative w-full h-full">
            <Image
              src={
                getCoverImageUrl(manga.md_comics.md_covers[0].b2key) ||
                "/placeholder.svg"
              }
              alt={manga.md_comics?.title || "Manga cover"}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Book className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {manga.md_comics?.title || "Unknown Title"}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">Chapter {manga.chap}</p>

          {/* Status indicator */}
          {manga.md_comics?.status && (
            <span
              className={`text-xs font-medium ${getStatusColor(
                manga.md_comics.status
              )}`}
            >
              {getStatusText(manga.md_comics.status)}
            </span>
          )}
        </div>
        <div className="flex items-center mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {formatDate(manga.updated_at)}
        </div>
      </div>
    </Link>
  );
}
