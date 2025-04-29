// types/MangaInfo.ts

export interface Chapter {
    id: number;
    chap: string;
    title: string | null;
    vol: string | null;
    lang: string;
    created_at: string;
    updated_at: string;
    up_count: number;
    down_count: number;
    is_the_last_chapter: boolean;
    publish_at: string;
    group_name: string[];
    hid: string;
    md_chapters_groups?: Array<{
      md_groups: {
        title: string;
        slug: string;
      };
    }>;
  }
  
  export interface ChapterResponse {
    chapters: Chapter[];
    total: number;
    limit: number;
  }
  
  export interface MangaCover {
    vol: string | null;
    w: number;
    h: number;
    b2key: string;
  }
  
  export interface MangaGenre {
    md_genres: {
      name: string;
      type: string | null;
      slug: string;
      group: string;
    };
  }
  
  export interface MangaInfo {
    id: number;
    hid: string;
    title: string;
    slug: string;
    desc: string;
    status: number;
    last_chapter: number;
    chapter_count: number;
    user_follow_count: number;
    md_covers: MangaCover[];
    md_comic_md_genres: MangaGenre[];
  }
  
  export interface ComicResponse {
    comic: MangaInfo;
    chapters?: Chapter[];
    firstChap?: {
      chap: string;
      hid: string;
      lang: string;
      group_name: string[];
      vol: string | null;
    };
    artists?: Array<{ name: string; slug: string }>;
    authors?: Array<{ name: string; slug: string }>;
    langList?: string[];
    demographic?: string;
  }
  
  export interface ChapterImage {
    h: number
    w: number
    name: string
    s: number
    b2key: string
    optimized: string | null
  }
  
  export interface ChapterImagesResponse {
    images: ChapterImage[]
    next?: {
      chap: string
      hid: string
    } | null
    prev?: {
      chap: string
      hid: string
    } | null
  }