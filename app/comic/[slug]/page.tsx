"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface Chapter {
  id: number;
  chap: string;
  hid: string;
  title: string | null;
}

export default function ComicChaptersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params); // ✅ unwrap slug

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const limit = 10;

  const fetchChapters = async (pageNumber: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.comick.fun/comic/${slug}/chapters?limit=${limit}&page=${pageNumber}`
      );
      const data = await res.json();
      setChapters(Array.isArray(data.chapters) ? data.chapters : []);
    } catch (error) {
      console.error("Failed to fetch chapters", error);
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters(page);
  }, [page]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 capitalize">{slug} - Chapters</h1>

      {loading && <p>Loading...</p>}

      {chapters.length > 0 ? (
        <div className="space-y-3">
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/comic/${slug}/chapter/${chapter.hid}`}
              className="block p-2 border rounded hover:bg-gray-100"
            >
              Chapter {chapter.chap} {chapter.title ? `- ${chapter.title}` : ""}
            </Link>
          ))}
        </div>
      ) : (
        <p>No chapters found.</p>
      )}

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          disabled={page === 0}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous Page
        </button>
        <span>Page {page + 1}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
