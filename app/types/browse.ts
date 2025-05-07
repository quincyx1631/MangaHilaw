export interface FilterState {
    genres: string[];
    excludes: string[];
    type?: string;
    demographic: number[];
    country: string[];
    status?: number;
    content_rating?: string;
    from?: number;
    to?: number;
    minimum?: number;
    sort?: string;
    completed?: boolean;
    page: number;
    limit: number;
    showall: boolean;
    q: string;
  }

  export const genresList = [
    { name: "Action", slug: "action", count: 11783 },
    { name: "Adventure", slug: "adventure", count: 10766 },
    { name: "Comedy", slug: "comedy", count: 33685 },
    { name: "Crime", slug: "crime", count: 2015 },
    { name: "Drama", slug: "drama", count: 30325 },
    { name: "Fantasy", slug: "fantasy", count: 21180 },
    { name: "Gender Bender", slug: "gender-bender", count: 20 },
    { name: "Historical", slug: "historical", count: 6137 },
    { name: "Horror", slug: "horror", count: 4388 },
    { name: "Isekai", slug: "isekai", count: 3596 },
    { name: "Magical Girls", slug: "magical-girls", count: 550 },
    { name: "Mature", slug: "mature", count: 74 },
    { name: "Mecha", slug: "mecha", count: 1588 },
    { name: "Medical", slug: "medical", count: 593 },
    { name: "Mystery", slug: "mystery", count: 6663 },
    { name: "Philosophical", slug: "philosophical", count: 1343 },
    { name: "Psychological", slug: "psychological", count: 6822 },
    { name: "Romance", slug: "romance", count: 37491 },
    { name: "Sci-Fi", slug: "sci-fi", count: 5035 },
    { name: "Shoujo Ai", slug: "shoujo-ai", count: 10 },
    { name: "Shounen Ai", slug: "shounen-ai", count: 38 },
    { name: "Slice of Life", slug: "slice-of-life", count: 21505 },
    { name: "Sports", slug: "sports", count: 3012 },
    { name: "Superhero", slug: "superhero", count: 551 },
    { name: "Thriller", slug: "thriller", count: 3000 },
    { name: "Tragedy", slug: "tragedy", count: 3365 },
    { name: "Wuxia", slug: "wuxia", count: 629 },
  ];

  export const themesList = [
    { name: "Aliens", slug: "aliens", count: 1188 },
    { name: "Animals", slug: "animals", count: 3557 },
    { name: "Cooking", slug: "cooking", count: 1381 },
    { name: "Crossdressing", slug: "crossdressing", count: 1619 },
    { name: "Delinquents", slug: "delinquents", count: 1759 },
    { name: "Demons", slug: "demons", count: 3129 },
    { name: "Ghosts", slug: "ghosts", count: 1425 },
    { name: "Gyaru", slug: "gyaru", count: 632 },
    { name: "Harem", slug: "harem", count: 2788 },
    { name: "Loli", slug: "loli", count: 828 },
    { name: "Magic", slug: "magic", count: 5141 },
    { name: "Mafia", slug: "mafia", count: 988 },
    { name: "Martial Arts", slug: "martial-arts", count: 3852 },
    { name: "Military", slug: "military", count: 2348 },
    { name: "Monster Girls", slug: "monster-girls", count: 1489 },
    { name: "Monsters", slug: "monsters", count: 4461 },
    { name: "Music", slug: "music", count: 1109 },
    { name: "Ninja", slug: "ninja", count: 552 },
    { name: "Office Workers", slug: "office-workers", count: 2702 },
    { name: "Police", slug: "police", count: 1237 },
    { name: "Post-Apocalyptic", slug: "post-apocalyptic", count: 877 },
    { name: "Reincarnation", slug: "reincarnation", count: 3110 },
    { name: "Reverse Harem", slug: "reverse-harem", count: 591 },
    { name: "Samurai", slug: "samurai", count: 932 },
    { name: "School Life", slug: "school-life", count: 18156 },
    { name: "Supernatural", slug: "supernatural", count: 13146 },
    { name: "Survival", slug: "survival", count: 2536 },
    { name: "Time Travel", slug: "time-travel", count: 1424 },
    { name: "Traditional Games", slug: "traditional-games", count: 404 },
    { name: "Vampires", slug: "vampires", count: 992 },
    { name: "Video Games", slug: "video-games", count: 1842 },
    { name: "Villainess", slug: "villainess", count: 818 },
    { name: "Virtual Reality", slug: "virtual-reality", count: 326 },
    { name: "Zombies", slug: "zombies", count: 478 },
  ];

  export const formatsList = [
    { name: "4-Koma", slug: "4-koma", count: 2089 },
    { name: "Adaptation", slug: "adaptation", count: 9059 },
    { name: "Anthology", slug: "anthology", count: 2713 },
    { name: "Award Winning", slug: "award-winning", count: 1039 },
    { name: "Doujinshi", slug: "doujinshi", count: 3219 },
    { name: "Fan Colored", slug: "fan-colored", count: 159 },
    { name: "Full Color", slug: "full-color", count: 14139 },
    { name: "Official Colored", slug: "official-colored", count: 334 },
    { name: "Oneshot", slug: "oneshot", count: 15967 },
    { name: "Long Strip", slug: "long-strip", count: 14614 },
    { name: "User Created", slug: "user-created", count: 1214 },
    { name: "Web Comic", slug: "web-comic", count: 15937 },
  ];