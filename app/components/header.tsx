"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Book, Menu, Search } from "lucide-react";
import React from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";

export default function header() {
  let pathname = usePathname();

  // if the URL is `/comic/:slug/chapter/:hid` hide the header
  if (pathname?.match(/^\/comic\/[^/]+\/chapter\/[^/]+$/)) {
    return null;
  }
  const categories = [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Mystery",
    "Supernatural",
  ];
  return (
    <div>
      <header className="sticky top-0 z-100 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Book className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl hidden sm:inline-block">
                MangaHilaw
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search manga..." className="pl-8" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Add the theme toggle button */}
              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Categories
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {categories.map((category) => (
                    <DropdownMenuItem key={category}>
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="grid gap-4 py-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search manga..." className="pl-8" />
                    </div>
                    <div className="grid gap-2">
                      <h3 className="text-sm font-medium">Categories</h3>
                      {categories.map((category) => (
                        <Link
                          key={category}
                          href={`/category/${category.toLowerCase()}`}
                          className="text-sm hover:underline"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <div className="mt-4 md:hidden relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search manga..." className="pl-8" />
          </div>
        </div>
      </header>
    </div>
  );
}
