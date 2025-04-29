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

import type { Chapter, ChapterImage } from "@/app/types/mangaInfo";

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
  const imgUrl = process.env.NEXT_PUBLIC_IMG_URL || "";

  // Fetch chapter data
  useEffect(() => {
    const fetchChapterData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch the chapter images
        const chapterImagesResponse = await fetch(
          `${baseUrl}/chapter/${hid}/get_images`
        );
        if (!chapterImagesResponse.ok)
          throw new Error(`Failed to fetch chapter images`);
        const imagesData = await chapterImagesResponse.json();
        setChapterImages(imagesData);

        // 2. Fetch the chapter list
        const mangaResponse = await fetch(`${baseUrl}/comic/${slug}`);
        if (!mangaResponse.ok) throw new Error(`Failed to fetch manga info`);

        const mangaData = await mangaResponse.json();
        const chaptersResponse = await fetch(
          `${baseUrl}/comic/${mangaData.comic.hid}/chapters?chap-order=1&lang=en`
        );
        if (!chaptersResponse.ok)
          throw new Error(`Failed to fetch chapters list`);

        const chaptersData = await chaptersResponse.json();
        const chapters: Chapter[] = chaptersData.chapters;

        // Find current chapter index using hid
        const currentIndex = chapters.findIndex((c) => c.hid === hid);

        // Set previous and next chapter
        if (currentIndex > 0) {
          setPrevChapter({
            chap: chapters[currentIndex - 1].chap,
            hid: chapters[currentIndex - 1].hid,
          });
        } else {
          setPrevChapter(null);
        }

        if (currentIndex < chapters.length - 1) {
          setNextChapter({
            chap: chapters[currentIndex + 1].chap,
            hid: chapters[currentIndex + 1].hid,
          });
        } else {
          setNextChapter(null);
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
  }, [slug, hid, baseUrl]);

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("touchstart", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Initial timeout
    handleActivity();

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      clearTimeout(timeout);
    };
  }, []);

  // Smooth scroll implementation
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const handleNextChapter = () => {
    if (nextChapter) {
      router.push(`/comic/${slug}/chapter/${nextChapter.hid}`);
    }
  };

  const handlePrevChapter = () => {
    if (prevChapter) {
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

  // Construct image URL from b2key
  const getImageUrl = (image: ChapterImage) => {
    return `${imgUrl}/${image.b2key}`;
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
          <div className="flex items-center gap-2">
            <Link href={`/comic/${slug}`}>
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-sm font-medium truncate max-w-[150px] sm:max-w-md">
              {loading ? "Loading..." : chapterTitle}
            </h1>
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
                  <p className="text-sm text-muted-foreground mb-4">
                    View all chapters for this manga
                  </p>
                  <Link href={`/comic/${slug}`}>
                    <Button className="w-full">Go to Chapter List</Button>
                  </Link>
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
          <div className="space-y-2">
            {chapterImages.map((image, index) => (
              <div key={index} className="relative w-full flex justify-center">
                <Image
                  src={getImageUrl(image) || "/placeholder.svg"}
                  width={image.w}
                  height={image.h}
                  alt={`Page ${index + 1}`}
                  className="max-w-full h-auto"
                  priority={index < 3} // Prioritize loading first 3 images
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
