"use client";

import { Input } from "@/components/ui/input";
import {
  Book,
  Loader2,
  Search,
  User,
  ChevronDown,
  LogOut,
  ArrowRight,
} from "lucide-react";
import type React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { ThemeToggle } from "@/app/components/header/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  type MangaSearchResult,
  searchManga,
  getCoverImageUrl,
  debounce,
} from "@/app/components/header/search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SignInModal from "@/app/components/auth/signin";
import RegisterModal from "@/app/components/auth/register";
import { useAuth } from "@/context/auth-context";
import { getStatusText, getStatusColor } from "@/app/utils/helpers";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MangaSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchMobileContainerRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  const fetchSearchResults = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchManga({ query });
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      fetchSearchResults(query);
    }, 500),
    [fetchSearchResults]
  );

  useEffect(() => {
    if (searchQuery.length >= 2) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        searchMobileContainerRef.current &&
        !searchMobileContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Clear search when navigating to a non-search page
    if (pathname && !pathname.startsWith("/search")) {
      setSearchQuery("");
      setSearchResults([]);
      setShowResults(false);
    }
  }, [pathname]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length === 0) {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.length >= 2) {
      setShowResults(true);
    }
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim().length >= 2) {
      e.preventDefault();
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setShowMobileSearch(false);
    }
  };

  const handleAdvancedSearch = () => {
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push("/search");
    }
    setShowResults(false);
    setShowMobileSearch(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    if (!showMobileSearch) {
      setTimeout(() => {
        const searchInput = document.getElementById("mobile-search-input");
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  };

  const openSignInModal = () => {
    setShowSignInModal(true);
  };

  const openRegisterModal = () => {
    setShowRegisterModal(true);
  };

  const closeSignInModal = () => {
    setShowSignInModal(false);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const SearchResultsList = ({ results }: { results: MangaSearchResult[] }) => {
    if (results.length === 0 && searchQuery.length >= 2) {
      return (
        <div className="p-2 text-sm text-center text-muted-foreground">
          No results found
        </div>
      );
    }

    return (
      <>
        {results.map((result) => {
          const coverKey =
            result.md_covers && result.md_covers.length > 0
              ? result.md_covers[0].b2key
              : null;

          return (
            <Link
              href={`/comic/${result.slug}`}
              key={result.id}
              className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded"
              onClick={() => {
                setShowResults(false);
                setSearchQuery("");
                setShowMobileSearch(false);
              }}
            >
              {/* Cover image */}
              <div className="relative h-20 w-14 overflow-hidden rounded-md flex-shrink-0 border">
                {coverKey ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={getCoverImageUrl(coverKey) || "/placeholder.svg"}
                      alt={result.title || "Manga cover"}
                      fill
                      className="object-cover"
                      sizes="56px"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Book className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium line-clamp-2">
                  {result.highlight ? (
                    <span
                      dangerouslySetInnerHTML={{ __html: result.highlight }}
                    />
                  ) : (
                    result.title
                  )}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {result.status && (
                    <span
                      className={`text-xs font-medium ${getStatusColor(
                        result.status
                      )}`}
                    >
                      {getStatusText(result.status)}
                    </span>
                  )}
                  {result.rating && (
                    <span className="text-xs text-muted-foreground">
                      ★ {result.rating}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </>
    );
  };

  if (pathname?.match(/^\/comic\/[^/]+\/chapter\/[^/]+$/)) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Book className="h-5 w-5 text-primary" />
              <span className="font-bold text-lg text-primary">MangaHilaw</span>
            </Link>

            {/* Desktop Search bar */}
            <div
              className="hidden md:flex flex-1 max-w-md relative"
              ref={searchContainerRef}
            >
              <div className="relative w-full">
                {isLoading ? (
                  <Loader2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  placeholder="Search manga..."
                  className="pl-8 pr-8 h-9 bg-muted/50 border-muted"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onKeyDown={handleSearchKeyDown}
                />
                {searchQuery.length > 0 && (
                  <button
                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                    onClick={handleSearchClear}
                    aria-label="Clear search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showResults && (
                  <div
                    className={cn(
                      "absolute top-full mt-1 w-full bg-background border rounded-md shadow-md z-50 max-h-96 overflow-y-auto",
                      searchResults.length === 0 &&
                        searchQuery.length < 2 &&
                        "hidden"
                    )}
                  >
                    {isLoading ? (
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        {/* Advanced Search Link */}
                        <div className="p-2 border-t">
                          <Button
                            variant="ghost"
                            className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10"
                            onClick={handleAdvancedSearch}
                          >
                            <span>
                              Advanced search for{" "}
                              {searchQuery.length >= 2 ? searchQuery : "manga"}
                            </span>
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>

                        <SearchResultsList results={searchResults} />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Search Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:hidden"
                onClick={toggleMobileSearch}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Theme toggle button */}
              <ThemeToggle />

              {/* Browse button */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-9 border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
              >
                <Link href="/browse">Browse</Link>
              </Button>

              {/* Account dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-2 md:px-3"
                  >
                    <User className="h-4 w-4 md:mr-2" />
                    <span className="hidden sm:inline ml-1 md:ml-0">
                      {isAuthenticated
                        ? user?.username || "Account"
                        : "Account"}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAuthenticated ? (
                    <>
                      <DropdownMenuItem className="font-medium">
                        <User className="mr-2 h-4 w-4" />
                        <span>{user?.username}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bookmarks">Bookmarks</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/history">Reading History</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem className="text-muted-foreground">
                        <User className="mr-2 h-4 w-4" />
                        <span>Not logged in</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={openSignInModal}>
                        Sign in
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={openRegisterModal}>
                        Register
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 p-4"
          ref={searchMobileContainerRef}
        >
          <div className="container mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                {isLoading ? (
                  <Loader2 className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  id="mobile-search-input"
                  placeholder="Search manga..."
                  className="pl-8 pr-8 h-9"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  autoFocus
                />
                {searchQuery.length > 0 && (
                  <button
                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                    onClick={handleSearchClear}
                    aria-label="Clear search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSearch(false)}
              >
                Cancel
              </Button>
            </div>

            {/* Mobile Search Results */}
            <div
              className={cn(
                "bg-background rounded-md overflow-y-auto max-h-[calc(100vh-120px)]",
                searchResults.length === 0 && searchQuery.length < 2 && "hidden"
              )}
            >
              {isLoading ? (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Advanced Search Link for Mobile */}
                  <div className="p-2 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-between text-primary hover:text-primary hover:bg-primary/10"
                      onClick={handleAdvancedSearch}
                    >
                      <span>
                        Advanced search for{" "}
                        {searchQuery.length >= 2 ? searchQuery : "manga"}
                      </span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  <SearchResultsList results={searchResults} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modals */}
      {showSignInModal && (
        <SignInModal
          isOpen={showSignInModal}
          onClose={closeSignInModal}
          onRegisterClick={() => {
            closeSignInModal();
            openRegisterModal();
          }}
        />
      )}

      {showRegisterModal && (
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={closeRegisterModal}
          onSignInClick={() => {
            closeRegisterModal();
            openSignInModal();
          }}
        />
      )}
    </>
  );
}
