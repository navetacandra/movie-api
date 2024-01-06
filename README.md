## Movie API

A movie API from Web Scrapping.

- Search Result Item Structure

```typescript
{
  id: string;
  title: string;
  poster: string;
  rating: number | string;
  duration: number | string;
  genres: string[];
  type: "movie" | "series";
  totalEps?: number; // For series
}
```

- Item's Detail Structure

```typescript
{
  id: string;
  title: string;
  rating: string | number;
  year: string | number;
  duration: string | number;
  country: string | string[];
  genres: string | string[];
  quality: string;
  release: string;
  synopsis: string;
  poster: string;
  embed?: string[]; // For movie and eps detail
  eps?: {
    id: string;
    label: string;
  }[]; // For series detail
}
```
