export type Movie = {
  id: string;
  title: string;
  poster: string;
  rating: number | string;
  duration: number | string;
  genres: string[];
  type: "movie" | "series";
  totalEps?: number;
};

export type MovieDetail = {
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
  embed?: string[];
  eps?: {
    id: string;
    label: string;
  }[];
};

export type SearchResponse = {
  code: number;
  data: {
    status: "success" | "error";
    itemCount?: number;
    items?: Movie[];
    message?: string;
  };
};

export type DetailResponse = {
  code: number;
  data: {
    status: "success" | "error";
    detail?: MovieDetail;
    message?: string;
  };
};
