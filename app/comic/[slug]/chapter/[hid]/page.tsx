"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface ImageFile {
  b2key: string;
}

export default function ChapterViewer({
  params,
}: {
  params: Promise<{ hid: string }>;
}) {
  const { hid } = use(params); // ✅ unwrap the Promise

  const [images, setImages] = useState<string[]>([]);
  const [chapterInfo, setChapterInfo] = useState<{
    prev?: string;
    next?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const baseImageUrl = "https://meo.comick.pictures/";

  const fetchChapterImages = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.comick.fun/chapter/${hid}/get_images`
      );
      const data = await res.json();
      console.log(data);
      const urls = data?.map((img: ImageFile) => `${baseImageUrl}${img.b2key}`);
      setImages(urls);
    } catch (e) {
      console.error("Error fetching images", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrevNextChapters = async () => {
    try {
      const res = await fetch(`https://api.comick.fun/chapter/${hid}`);
      const data = await res.json();
      setChapterInfo({
        prev: data.prev_chapter?.hid || undefined,
        next: data.next_chapter?.hid || undefined,
      });
    } catch (e) {
      console.error("Error fetching chapter info", e);
    }
  };

  useEffect(() => {
    fetchChapterImages();
    fetchPrevNextChapters();
  }, [hid]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chapter</h1>

      {/* Navigation */}
      <div className="flex justify-between mb-4">
        {chapterInfo.prev ? (
          <Link
            href={`/chapter/${chapterInfo.prev}`}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ⬅️ Previous
          </Link>
        ) : (
          <div />
        )}
        {chapterInfo.next ? (
          <Link
            href={`/chapter/${chapterInfo.next}`}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Next ➡️
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Images */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Page ${index + 1}`}
              className="w-full rounded shadow-md"
              loading="lazy"
            />
          ))}
        </div>
      )}
    </div>
  );
}
