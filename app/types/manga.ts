// Manga Types
export interface MangaCover {
    w: number
    h: number
    b2key: string
  }
  
  export interface MangaTitle {
    title: string
    lang: string
  }
  
  export interface MangaComic {
    id: number
    hid: string
    title: string
    slug: string
    content_rating: string
    country: string
    status: number
    translation_completed: boolean
    last_chapter: number
    final_chapter: number | null
    created_at: string
    genres: number[]
    demographic: number | null
    is_english_title: boolean | null
    md_titles: MangaTitle[]
    md_covers: MangaCover[]
  }
  
  export interface MangaChapter {
    id: number
    status: string
    chap: string
    vol: string | null
    last_at: string
    hid: string
    created_at: string
    group_name: string[]
    updated_at: string
    up_count: number
    lang: string
    down_count: number
    external_type: string | null
    publish_at: string
    md_comics: MangaComic
    count?: number
  }
  
  export interface TrendingManga{
    id: string | number;
    title: string;
    slug: string;
    status?: number;
    country?: string;
    md_covers?: Array<{ b2key: string }>;
    created_at?: string;
    updated_at: string;
  }

  export interface PaginationResponse {
    limit: number
    offset: number
    total: number
  }
  
  export interface MangaApiResponse {
    chapters: MangaChapter[]
    pagination: PaginationResponse
  }
  