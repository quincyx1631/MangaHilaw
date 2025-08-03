import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { MangaChapter, TrendingManga } from '@/app/types/manga';
import type { 
  Chapter, 
  MangaInfo, 
  Recommendation,
  ComicResponse,
  ChapterResponse 
} from '@/app/types/mangaInfo';

interface MangaState {
  // Hot/Recent manga state
  hotManga: MangaChapter[];
  hotMangaLoading: boolean;
  hotMangaError: string | null;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  
  // Trending manga state
  trendingManga: TrendingManga[];
  trendingLoading: boolean;
  trendingError: string | null;
  
  // Manga Info state
  mangaInfoCache: Record<string, {
    data: MangaInfo;
    recommendations: Recommendation[];
    fetchTime: number;
  }>;
  mangaInfoLoading: boolean;
  mangaInfoError: string | null;
  
  // Chapters state
  chaptersCache: Record<string, {
    data: Chapter[];
    total: number;
    fetchTime: number;
    chapterOrder: 0 | 1;
  }>;
  chaptersLoading: boolean;
  chaptersError: string | null;
  
  // UI state
  viewMode: 'grid' | 'list';
  
  // Tracking state
  apiCallCount: number;
  refreshCount: number;
  lastFetchTime: {
    hotManga: number | null;
    trendingManga: number | null;
    mangaInfo: number | null;
    chapters: number | null;
  };
  cacheHits: {
    hotManga: number;
    trendingManga: number;
    mangaInfo: number;
    chapters: number;
  };
  sessionStartTime: number;
  
  // Actions for hot/recent manga
  setHotManga: (manga: MangaChapter[]) => void;
  setHotMangaLoading: (loading: boolean) => void;
  setHotMangaError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  
  // Actions for trending manga
  setTrendingManga: (manga: TrendingManga[]) => void;
  setTrendingLoading: (loading: boolean) => void;
  setTrendingError: (error: string | null) => void;
  
  // Actions for manga info 
  setMangaInfoLoading: (loading: boolean) => void;
  setMangaInfoError: (error: string | null) => void;
  getMangaInfo: (slug: string) => { data: MangaInfo; recommendations: Recommendation[] } | null;
  fetchMangaInfo: (slug: string, forceRefresh?: boolean) => Promise<{ comic: MangaInfo; recommendations?: Recommendation[] } | null>;
  
  // Actions for chapters 
  setChaptersLoading: (loading: boolean) => void;
  setChaptersError: (error: string | null) => void;
  getChapters: (mangaHid: string, chapterOrder: 0 | 1) => { data: Chapter[]; total: number } | null;
  fetchChapters: (mangaHid: string, chapterOrder: 0 | 1, forceRefresh?: boolean) => Promise<{ chapters: Chapter[]; total: number } | null>;
  
  // UI actions
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // API functions
  fetchHotManga: (page?: number, forceRefresh?: boolean) => Promise<void>;
  fetchTrendingManga: (forceRefresh?: boolean) => Promise<void>;
  
  // Tracking methods
  incrementRefreshCount: () => void;
  getStats: () => {
    totalRefreshes: number;
    totalApiCalls: number;
    cacheHitRate: string;
    sessionTime: string;
    lastFetched: {
      hotManga: string;
      trendingManga: string;
    };
  };
}

export const useMangaStore = create<MangaState>()(
  devtools(
    persist(
      (set, get) => ({
        // Hot/Recent manga
        hotManga: [],
        hotMangaLoading: false,
        hotMangaError: null,
        currentPage: 1,
        totalPages: 10,
        itemsPerPage: 30,
        
        trendingManga: [],
        trendingLoading: false,
        trendingError: null,
        
        // Manga Info 
        mangaInfoCache: {},
        mangaInfoLoading: false,
        mangaInfoError: null,
        
        // Chapters 
        chaptersCache: {},
        chaptersLoading: false,
        chaptersError: null,
        
        viewMode: 'grid',
        
        // Tracking state
        apiCallCount: 0,
        refreshCount: 0,
        lastFetchTime: {
          hotManga: null,
          trendingManga: null,
          mangaInfo: null,
          chapters: null,
        },
        cacheHits: {
          hotManga: 0,
          trendingManga: 0,
          mangaInfo: 0,
          chapters: 0,
        },
        sessionStartTime: Date.now(),
        
        setHotManga: (manga) => set({ hotManga: manga }, false, 'setHotManga'),
        setHotMangaLoading: (loading) => set({ hotMangaLoading: loading }, false, 'setHotMangaLoading'),
        setHotMangaError: (error) => set({ hotMangaError: error }, false, 'setHotMangaError'),
        setCurrentPage: (page) => set({ currentPage: page }, false, 'setCurrentPage'),
        setTotalPages: (pages) => set({ totalPages: pages }, false, 'setTotalPages'),
        
        setTrendingManga: (manga) => set({ trendingManga: manga }, false, 'setTrendingManga'),
        setTrendingLoading: (loading) => set({ trendingLoading: loading }, false, 'setTrendingLoading'),
        setTrendingError: (error) => set({ trendingError: error }, false, 'setTrendingError'),
        
        setMangaInfoLoading: (loading) => set({ mangaInfoLoading: loading }, false, 'setMangaInfoLoading'),
        setMangaInfoError: (error) => set({ mangaInfoError: error }, false, 'setMangaInfoError'),
        
        getMangaInfo: (slug: string) => {
          const { mangaInfoCache } = get();
          const cached = mangaInfoCache[slug];
          if (!cached) return null;
          
          const now = Date.now();
          const cacheValidTime = 30 * 60 * 1000; 
          
          if (now - cached.fetchTime > cacheValidTime) {
            return null;
          }
          
          return {
            data: cached.data,
            recommendations: cached.recommendations
          };
        },
        
        setChaptersLoading: (loading) => set({ chaptersLoading: loading }, false, 'setChaptersLoading'),
        setChaptersError: (error) => set({ chaptersError: error }, false, 'setChaptersError'),
        
        getChapters: (mangaHid: string, chapterOrder: 0 | 1) => {
          const { chaptersCache } = get();
          const cacheKey = `${mangaHid}_${chapterOrder}`;
          const cached = chaptersCache[cacheKey];
          if (!cached) return null;
          
          const now = Date.now();
          const cacheValidTime = 60 * 60 * 1000;
          
          if (now - cached.fetchTime > cacheValidTime) {
            return null; 
          }
          
          return {
            data: cached.data,
            total: cached.total
          };
        },
        
        setViewMode: (mode) => set({ viewMode: mode }, false, 'setViewMode'),
  
  fetchHotManga: async (page, forceRefresh = false) => {
    const { currentPage, itemsPerPage, hotManga, lastFetchTime, cacheHits, apiCallCount } = get();
    const pageToFetch = page || currentPage;
    const now = Date.now();
    const cacheValidTime = 60 * 60 * 1000; 
    const hasCachedData = hotManga.length > 0 && pageToFetch === currentPage;
    const isCacheValid = lastFetchTime.hotManga && (now - lastFetchTime.hotManga) < cacheValidTime;
    
    if (hasCachedData && isCacheValid && !forceRefresh) {
      console.log("📋 [Cache] Using cached hot manga data");
      set({ 
        cacheHits: { ...cacheHits, hotManga: cacheHits.hotManga + 1 }
      }, false, 'fetchHotManga/cacheHit');
      return;
    }
    
    set({ 
      hotMangaLoading: true, 
      hotMangaError: null,
      currentPage: pageToFetch 
    }, false, 'fetchHotManga/start');
    
    try {
      console.log("🚀 [API] Fetching hot manga data for page:", pageToFetch);
      const response = await fetch(
        `/api/manga/chapter/?page=${pageToFetch}&order=hot&limit=${itemsPerPage}`
      );
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ [API] Hot manga data loaded successfully:", data.length || "data received");

      let mangaList: MangaChapter[] = [];
      if (Array.isArray(data)) {
        mangaList = data;
      } else if (data.chapters && Array.isArray(data.chapters)) {
        mangaList = data.chapters;
        if (data.pagination) {
          const totalItems = data.pagination.total;
          set({ totalPages: Math.ceil(totalItems / itemsPerPage) }, false, 'fetchHotManga/updatePagination');
        }
      } else {
        mangaList = [data];
      }

      const limitedData = mangaList.slice(0, itemsPerPage);
      set({ 
        hotManga: limitedData,
        hotMangaLoading: false,
        apiCallCount: apiCallCount + 1,
        lastFetchTime: { ...lastFetchTime, hotManga: now }
      }, false, 'fetchHotManga/success');
      
    } catch (error) {
      console.error("❌ [API] Error fetching hot manga:", error);
      set({ 
        hotMangaError: "Failed to load manga data. Please try again later.",
        hotMangaLoading: false 
      }, false, 'fetchHotManga/error');
    }
  },
  
  fetchTrendingManga: async (forceRefresh = false) => {
    const { trendingManga, lastFetchTime, cacheHits, apiCallCount } = get();
    const now = Date.now();
    const cacheValidTime = 60 * 60 * 1000; 
    const hasCachedData = trendingManga.length > 0;
    const isCacheValid = lastFetchTime.trendingManga && (now - lastFetchTime.trendingManga) < cacheValidTime;
    
    if (hasCachedData && isCacheValid && !forceRefresh) {
      console.log("📋 [Cache] Using cached trending manga data");
      set({ 
        cacheHits: { ...cacheHits, trendingManga: cacheHits.trendingManga + 1 }
      }, false, 'fetchTrendingManga/cacheHit');
      return;
    }
    
    set({ 
      trendingLoading: true, 
      trendingError: null 
    }, false, 'fetchTrendingManga/start');
    
    try {
      console.log("🔥 [API] Fetching trending manga data...");
      const response = await fetch(
        "/api/manga/top?day=180&type=trending&accept_mature_content=false"
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ [API] Trending manga data loaded successfully");
      
      let mangaList: TrendingManga[] = [];
      
      if (Array.isArray(data)) {
        mangaList = data;
      } else if (data["180"] && Array.isArray(data["180"])) {
        mangaList = data["180"];
      } else if (data["90"] && Array.isArray(data["90"])) {
        mangaList = data["90"];
      } else if (data["30"] && Array.isArray(data["30"])) {
        mangaList = data["30"];
      } else if (data["7"] && Array.isArray(data["7"])) {
        mangaList = data["7"];
      } else if (data.manga && Array.isArray(data.manga)) {
        mangaList = data.manga;
      } else if (data.data && Array.isArray(data.data)) {
        mangaList = data.data;
      }
      
      const limitedData = mangaList.slice(0, 30);
      set({ 
        trendingManga: limitedData,
        trendingLoading: false,
        apiCallCount: apiCallCount + 1,
        lastFetchTime: { ...lastFetchTime, trendingManga: now }
      }, false, 'fetchTrendingManga/success');
      
    } catch (error) {
      console.error("❌ [API] Error fetching trending manga:", error);
      set({ 
        trendingError: "Failed to load trending manga.",
        trendingLoading: false 
      }, false, 'fetchTrendingManga/error');
    }
  },
  
  fetchMangaInfo: async (slug: string, forceRefresh = false) => {
    const { mangaInfoCache, cacheHits, apiCallCount } = get();
    const now = Date.now();
    
    if (!forceRefresh) {
      const cached = mangaInfoCache[slug];
      if (cached) {
        const cacheValidTime = 60 * 60 * 1000; 
        if (now - cached.fetchTime < cacheValidTime) {
          console.log("📋 [Cache] Using cached manga info for:", slug);
          set({ 
            cacheHits: { ...cacheHits, mangaInfo: cacheHits.mangaInfo + 1 }
          }, false, 'fetchMangaInfo/cacheHit');
          return {
            comic: cached.data,
            recommendations: cached.recommendations
          };
        }
      }
    }
    
    set({ 
      mangaInfoLoading: true, 
      mangaInfoError: null 
    }, false, 'fetchMangaInfo/start');
    
    try {
      console.log("🚀 [API] Fetching manga info for:", slug);
      const response = await fetch(`/api/manga/comic/${slug}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch manga info: ${response.status}`);
      }
      
      const data: ComicResponse = await response.json();
      console.log("✅ [API] Manga info loaded successfully:", data.comic.title);
      
      const newCache = {
        ...mangaInfoCache,
        [slug]: {
          data: data.comic,
          recommendations: data.comic.recommendations || [],
          fetchTime: now
        }
      };
      
      set({ 
        mangaInfoCache: newCache,
        mangaInfoLoading: false,
        apiCallCount: apiCallCount + 1,
        lastFetchTime: { ...get().lastFetchTime, mangaInfo: now }
      }, false, 'fetchMangaInfo/success');
      
      return {
        comic: data.comic,
        recommendations: data.comic.recommendations
      };
      
    } catch (error) {
      console.error("❌ [API] Error fetching manga info:", error);
      set({ 
        mangaInfoError: error instanceof Error ? error.message : "Failed to load manga info",
        mangaInfoLoading: false 
      }, false, 'fetchMangaInfo/error');
      return null;
    }
  },
  
  fetchChapters: async (mangaHid: string, chapterOrder: 0 | 1, forceRefresh = false) => {
    const { chaptersCache, cacheHits, apiCallCount } = get();
    const now = Date.now();
    const cacheKey = `${mangaHid}_${chapterOrder}`;
    if (!forceRefresh) {
      const cached = chaptersCache[cacheKey];
      if (cached) {
        const cacheValidTime = 15 * 60 * 1000; // 15 minutes
        if (now - cached.fetchTime < cacheValidTime) {
          console.log("📋 [Cache] Using cached chapters for:", mangaHid);
          set({ 
            cacheHits: { ...cacheHits, chapters: cacheHits.chapters + 1 }
          }, false, 'fetchChapters/cacheHit');
          return {
            chapters: cached.data,
            total: cached.total
          };
        }
      }
    }
    
    set({ 
      chaptersLoading: true, 
      chaptersError: null 
    }, false, 'fetchChapters/start');
    
    try {
      console.log("📚 [API] Fetching chapters for:", mangaHid, "order:", chapterOrder);
      const response = await fetch(
        `/api/manga/comic/${mangaHid}/chapters?limit=9999&page=1&chap-order=${chapterOrder}&lang=en`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chapters: ${response.status}`);
      }
      
      const data: ChapterResponse = await response.json();
      console.log("✅ [API] Chapters loaded successfully:", data.chapters.length, "chapters");
      
      if (data.chapters.length === 0) {
        set({ 
          chaptersError: "No chapters found.",
          chaptersLoading: false 
        }, false, 'fetchChapters/noChapters');
        return {
          chapters: [],
          total: 0
        };
      }
      
      const newCache = {
        ...chaptersCache,
        [cacheKey]: {
          data: data.chapters,
          total: data.total,
          fetchTime: now,
          chapterOrder
        }
      };
      
      set({ 
        chaptersCache: newCache,
        chaptersLoading: false,
        apiCallCount: apiCallCount + 1,
        lastFetchTime: { ...get().lastFetchTime, chapters: now }
      }, false, 'fetchChapters/success');
      
      return {
        chapters: data.chapters,
        total: data.total
      };
      
    } catch (error) {
      console.error("❌ [API] Error fetching chapters:", error);
      set({ 
        chaptersError: error instanceof Error ? error.message : "Failed to load chapters",
        chaptersLoading: false 
      }, false, 'fetchChapters/error');
      return null;
    }
  },
  
  // Tracking methods
  incrementRefreshCount: () => {
    const { refreshCount } = get();
    set({ refreshCount: refreshCount + 1 }, false, 'incrementRefreshCount');
  },
  
  getStats: () => {
    const state = get();
    const sessionTime = Date.now() - state.sessionStartTime;
    const totalCacheHits = state.cacheHits.hotManga + state.cacheHits.trendingManga + 
                          state.cacheHits.mangaInfo + state.cacheHits.chapters;
    const totalRequests = state.apiCallCount + totalCacheHits;
    
    return {
      totalRefreshes: state.refreshCount,
      totalApiCalls: state.apiCallCount,
      cacheHitRate: totalRequests > 0 ? `${Math.round((totalCacheHits / totalRequests) * 100)}%` : '0%',
      sessionTime: `${Math.floor(sessionTime / 1000)}s`,
      lastFetched: {
        hotManga: state.lastFetchTime.hotManga 
          ? new Date(state.lastFetchTime.hotManga).toLocaleTimeString()
          : 'Never',
        trendingManga: state.lastFetchTime.trendingManga
          ? new Date(state.lastFetchTime.trendingManga).toLocaleTimeString()
          : 'Never',
        mangaInfo: state.lastFetchTime.mangaInfo
          ? new Date(state.lastFetchTime.mangaInfo).toLocaleTimeString()
          : 'Never',
        chapters: state.lastFetchTime.chapters
          ? new Date(state.lastFetchTime.chapters).toLocaleTimeString()
          : 'Never',
      },
    };
  },
}),
{
  name: 'manga-storage',
  partialize: (state: MangaState) => ({
    hotManga: state.hotManga,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    trendingManga: state.trendingManga,
    viewMode: state.viewMode,
    apiCallCount: state.apiCallCount,
    refreshCount: state.refreshCount,
    lastFetchTime: state.lastFetchTime,
    cacheHits: state.cacheHits,
    sessionStartTime: state.sessionStartTime,
    mangaInfoCache: state.mangaInfoCache,
    chaptersCache: state.chaptersCache,
  }),
}
),
{
  name: 'manga-store',
}
)
);
