//comic/[slug]/chapter/[hid]/page.tsx
"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Settings,
  MessageSquare,
  Send,
  Home,
  List,
  ThumbsUp,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chapter, ChapterImage } from "@/app/types/mangaInfo";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useAuth } from "@/context/auth-context";

interface Comment {
  id: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
}

export default function ChapterReader() {
  const { slug, hid } = useParams() as { slug: string; hid: string };
  const router = useRouter();
  const [chapterImages, setChapterImages] = useState<ChapterImage[]>([]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [nextChapter, setNextChapter] = useState<{
    chap: string;
    hid: string;
  } | null>(null);
  const [prevChapter, setPrevChapter] = useState<{
    chap: string;
    hid: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [imageQuality, setImageQuality] = useState(100);
  const [showComments, setShowComments] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const { updateReadingProgress, checkBookmark } = useBookmarks();
  const { isAuthenticated } = useAuth();
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [bookmarkData, setBookmarkData] = useState<any>(null);
  const [mangaInfo, setMangaInfo] = useState<any>(null);

  useEffect(() => {
    const fetchChapterData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch the chapter images
        const chapterImagesResponse = await fetch(
          `/api/manga/chapter/${hid}/get_images`
        );
        if (!chapterImagesResponse.ok)
          throw new Error(`Failed to fetch chapter images`);
        const imagesData = await chapterImagesResponse.json();
        setChapterImages(imagesData);

        // 2. Fetch the current chapter info to get group details
        const currentChapterResponse = await fetch(`/api/manga/chapter/${hid}`);
        if (!currentChapterResponse.ok)
          throw new Error(`Failed to fetch current chapter info`);
        const currentChapterData = await currentChapterResponse.json();
        const currentChapter = currentChapterData.chapter;

        const currentGroups = currentChapter.group_name || [];
        const preferredGroup =
          currentGroups.length > 0 ? currentGroups[0] : null;
        setChapterTitle(`Chapter ${currentChapter.chap}`);

        // 3. Fetch the manga info to get its hid
        const mangaResponse = await fetch(`/api/manga/comic/${slug}`);
        if (!mangaResponse.ok) throw new Error(`Failed to fetch manga info`);
        const mangaData = await mangaResponse.json();
        const mangaHid = mangaData.comic.hid;

        setMangaInfo(mangaData.comic); // 4. Fetch all chapters to have complete data for navigation
        const chaptersResponse = await fetch(
          `/api/manga/comic/${mangaHid}/chapters?limit=9999&chap-order=0&lang=en`
        );
        if (!chaptersResponse.ok)
          throw new Error(`Failed to fetch chapters list`);

        const chaptersData = await chaptersResponse.json();
        const chapters: Chapter[] = chaptersData.chapters;
        setAllChapters(chapters);
        setCurrentChapter(currentChapter);

        const groups = new Set<string>();
        chapters.forEach((chapter) => {
          if (chapter.group_name && chapter.group_name.length > 0) {
            chapter.group_name.forEach((group) => groups.add(group));
          }
        });
        setAvailableGroups(Array.from(groups));

        if (preferredGroup) {
          setSelectedGroup(preferredGroup);
        }

        const sortedChapters = [...chapters].sort((a, b) => {
          const chapA = parseFloat(a.chap) || 0;
          const chapB = parseFloat(b.chap) || 0;
          return chapA - chapB;
        });

        const currentIndex = sortedChapters.findIndex((c) => c.hid === hid);

        if (currentIndex === -1) {
          throw new Error("Current chapter not found in chapters list");
        }

        let prevChapterIndex = currentIndex - 1;
        while (prevChapterIndex >= 0) {
          const prevChapterCandidate = sortedChapters[prevChapterIndex];

          if (
            preferredGroup &&
            prevChapterCandidate.group_name.includes(preferredGroup)
          ) {
            setPrevChapter({
              chap: prevChapterCandidate.chap,
              hid: prevChapterCandidate.hid,
            });
            break;
          } else if (prevChapterIndex === currentIndex - 1) {
            const fallbackPrev = {
              chap: prevChapterCandidate.chap,
              hid: prevChapterCandidate.hid,
            };

            if (prevChapterIndex === 0) {
              setPrevChapter(fallbackPrev);
            }
          }
          prevChapterIndex--;
        }

        if (prevChapterIndex < 0 && currentIndex > 0) {
          setPrevChapter({
            chap: sortedChapters[currentIndex - 1].chap,
            hid: sortedChapters[currentIndex - 1].hid,
          });
        } else if (currentIndex === 0) {
          setPrevChapter(null);
        }

        let nextChapterIndex = currentIndex + 1;
        while (nextChapterIndex < sortedChapters.length) {
          const nextChapterCandidate = sortedChapters[nextChapterIndex];

          if (
            preferredGroup &&
            nextChapterCandidate.group_name.includes(preferredGroup)
          ) {
            setNextChapter({
              chap: nextChapterCandidate.chap,
              hid: nextChapterCandidate.hid,
            });
            break;
          } else if (nextChapterIndex === currentIndex + 1) {
            const fallbackNext = {
              chap: nextChapterCandidate.chap,
              hid: nextChapterCandidate.hid,
            };

            if (nextChapterIndex === sortedChapters.length - 1) {
              setNextChapter(fallbackNext);
            }
          }

          nextChapterIndex++;
        }

        if (
          nextChapterIndex >= sortedChapters.length &&
          currentIndex < sortedChapters.length - 1
        ) {
          setNextChapter({
            chap: sortedChapters[currentIndex + 1].chap,
            hid: sortedChapters[currentIndex + 1].hid,
          });
        } else if (currentIndex === sortedChapters.length - 1) {
          setNextChapter(null);
        }

        if (mangaData.comic.id && currentChapter) {
          await checkIfBookmarked(mangaData.comic.id.toString());

          // Update reading progress when chapter loads
          setTimeout(() => {
            if (bookmarkId) {
              updateProgress(currentChapter.chap, currentChapter.hid);
            }
          }, 1000); // Small delay to ensure bookmark check completes
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    if (slug && hid) {
      fetchChapterData();
    }
    return () => {
      setChapterImages([]);
      setChapterTitle("");
      setNextChapter(null);
      setPrevChapter(null);
      setCurrentChapter(null);
      setAllChapters([]);
      setSelectedGroup(null);
      setAvailableGroups([]);
    };
  }, [slug, hid, baseUrl]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    handleActivity();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearTimeout(timeout);
    };
  }, []);
  const updateProgress = async (chapterNumber: string, chapterHid: string) => {
    if (!isAuthenticated || !bookmarkId) return;

    try {
      const lastReadChapter = bookmarkData?.last_read_chapter;

      // Only update if current chapter is greater than last read chapter
      if (
        !lastReadChapter ||
        parseFloat(chapterNumber) > parseFloat(lastReadChapter)
      ) {
        const success = await updateReadingProgress(
          bookmarkId,
          chapterNumber,
          chapterHid
        );
        if (success) {
          // Update local bookmark data
          setBookmarkData((prev: any) => ({
            ...prev,
            last_read_chapter: chapterNumber,
            last_read_chapter_hid: chapterHid,
          }));
          console.log(`Updated reading progress to chapter ${chapterNumber}`);
        }
      } else {
        console.log(
          `Chapter ${chapterNumber} is not greater than last read chapter ${lastReadChapter}, skipping update`
        );
      }
    } catch (error) {
      console.error("Failed to update reading progress:", error);
    }
  };
  // Add this function to check if manga is bookmarked and get bookmark ID
  const checkIfBookmarked = async (mangaId: string) => {
    if (!isAuthenticated) return;

    try {
      const result = await checkBookmark(mangaId);
      if (result.isBookmarked && result.bookmarkData?.id) {
        setBookmarkId(result.bookmarkData.id);
        setBookmarkData(result.bookmarkData);
      }
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
    }
  };

  useEffect(() => {
    const handleBookmarkCheck = async () => {
      if (mangaInfo && isAuthenticated) {
        await checkIfBookmarked(mangaInfo.id.toString());
      }
    };

    handleBookmarkCheck();
  }, [mangaInfo, isAuthenticated]);

  // Add another useEffect to update progress when bookmark ID is available
  useEffect(() => {
    const updateInitialProgress = async () => {
      if (bookmarkId && currentChapter) {
        // Update progress when bookmark ID becomes available
        await updateProgress(currentChapter.chap, currentChapter.hid);
      }
    };

    updateInitialProgress();
  }, [bookmarkId, currentChapter]);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const handleNextChapter = async () => {
    if (nextChapter) {
      if (bookmarkId && currentChapter) {
        await updateProgress(currentChapter.chap, currentChapter.hid);
      }
      router.push(`/comic/${slug}/chapter/${nextChapter.hid}`);
    }
  };

  const handlePrevChapter = async () => {
    if (prevChapter) {
      if (bookmarkId && currentChapter) {
        await updateProgress(currentChapter.chap, currentChapter.hid);
      }
      router.push(`/comic/${slug}/chapter/${prevChapter.hid}`);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      username: "current_user",
      avatar: "",
      content: newComment,
      timestamp: new Date(),
      likes: 0,
    };

    setComments([newCommentObj, ...comments]);
    setNewComment("");
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView();
  };

  const scrollToComments = () => {
    setShowComments(true);
    setTimeout(() => {
      commentsRef.current?.scrollIntoView();
    }, 100);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
  };

  const getImageUrl = (image: ChapterImage) => {
    return `/api/image/${image.b2key}`;
  };

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

  return (
    <div className="bg-background min-h-screen">
      {/* Top reference for scrolling */}
      <div ref={topRef} />

      {/* Navigation controls */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex gap-2">
            {/* Home button */}
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="w-5 h-5" />
              </Button>
            </Link>

            <Link href={`/comic/${slug}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevChapter}
              disabled={!prevChapter}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <List className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Chapter List</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  {/* Current chapter info */}
                  <div className="mb-4 p-3 bg-muted/30 rounded-md">
                    <p className="font-bold">
                      Chapter {chapterTitle.replace("Chapter ", "")}
                    </p>
                  </div>

                  {/* Group filter selector */}
                  {availableGroups.length > 1 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">
                        Filter by Group
                      </p>
                      <Select
                        value={selectedGroup || "all"}
                        onValueChange={(value) =>
                          setSelectedGroup(value === "all" ? null : value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Groups</SelectLabel>
                            <SelectItem value="all">All Groups</SelectItem>
                            {availableGroups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Chapter dropdown */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Select Chapter</p>
                    <Select
                      value={hid}
                      onValueChange={(value) => {
                        router.push(`/comic/${slug}/chapter/${value}`);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a chapter" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-80">
                          <SelectGroup>
                            <SelectLabel>Chapters</SelectLabel>
                            {allChapters
                              .filter(
                                (chapter) =>
                                  selectedGroup === null ||
                                  (chapter.group_name &&
                                    chapter.group_name.includes(selectedGroup))
                              )
                              .sort((a, b) => {
                                const chapA = parseFloat(a.chap) || 0;
                                const chapB = parseFloat(b.chap) || 0;
                                return chapB - chapA; // Descending order (newest first)
                              })
                              .map((chapter) => (
                                <SelectItem
                                  key={chapter.hid}
                                  value={chapter.hid}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span>Ch. {chapter.chap}</span>
                                    {chapter.group_name &&
                                      chapter.group_name.length > 0 && (
                                        <span className="text-xs bg-accent/50 px-2 py-0.5 rounded-full ml-2">
                                          {chapter.group_name[0] || "Unknown"}
                                        </span>
                                      )}
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-6">
                    <Link href={`/comic/${slug}`}>
                      <Button className="w-full">Go to Manga Page</Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Reader Settings</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <div className="mb-6">
                    <p className="text-sm font-medium mb-2">Image Quality</p>
                    <Slider
                      value={[imageQuality]}
                      onValueChange={(value: React.SetStateAction<number>[]) =>
                        setImageQuality(value[0])
                      }
                      min={50}
                      max={100}
                      step={10}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        Lower
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {imageQuality}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Higher
                      </span>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextChapter}
              disabled={!nextChapter}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chapter content */}
      <div className="container mx-auto px-0 sm:px-4 pt-16 pb-24">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="w-full h-[500px] rounded-none sm:rounded-md"
              />
            ))}
          </div>
        ) : (
          <div className="">
            {chapterImages.map((image, index) => (
              <div key={index} className="relative w-full flex justify-center">
                <Image
                  src={getImageUrl(image) || "/placeholder.svg"}
                  width={image.w}
                  height={image.h}
                  alt={`Page ${index + 1}`}
                  className="max-w-full h-auto"
                  priority={index < 3}
                  quality={imageQuality}
                  loading={index < 5 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        )}

        {/* Chapter navigation */}
        <div className="mt-8 flex justify-between px-4">
          <Button
            variant="outline"
            onClick={handlePrevChapter}
            disabled={!prevChapter}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous Chapter
          </Button>

          <Button
            variant="outline"
            onClick={handleNextChapter}
            disabled={!nextChapter}
            className="flex items-center gap-2"
          >
            Next Chapter
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments section */}
        <div ref={commentsRef} className="mt-12 px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({comments.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? "Hide Comments" : "Show Comments"}
            </Button>
          </div>

          {showComments && (
            <>
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-2 min-h-[80px]"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="flex items-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {comment.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                          {comment.avatar && (
                            <AvatarImage
                              src={comment.avatar || "/placeholder.svg"}
                              alt={comment.username}
                            />
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{comment.username}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatTimeAgo(comment.timestamp)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {comment.likes}
                            </Button>
                          </div>
                          <p className="mt-2 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating action buttons */}
      <div
        className={`fixed bottom-4 right-4 flex flex-col gap-2 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={scrollToComments}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
