import { load } from "cheerio";
import { serialize } from "./serialize";
import { Movie } from "../types";

export default function getMovies(html: string): Movie[] {
  const $ = load(html);
  const movies: Movie[] = $(
    'article[class="item-infinite col-md-20 item has-post-thumbnail"]'
  )
    .map((i, el) => {
      const title = $(el).find(".entry-title > a").text() ?? "";
      const href = $(el).find(".entry-title > a").attr("href") ?? "";
      const id = serialize(href);
      const poster =
        $(el).find(".content-thumbnail.text-center img").attr("src") ?? "";
      const rating = Number(
        ($(el).find(".gmr-rating-item").text() ?? "").replace(/[^0-9\.]/g, "")
      );
      const duration = Number(
        ($(el).find(".gmr-duration-item").text() ?? "").replace(/[^0-9\.]/g, "")
      );
      const genres: string[] = $(el)
        .find('.gmr-movie-on a[rel="category tag"]')
        .map((_, gr) => $(gr).text())
        .toArray()
        .map((g) => g.toString());

      let detail: Movie = {
        id,
        title,
        poster,
        rating: isNaN(rating) ? "-" : rating,
        duration: isNaN(duration) ? "-" : duration,
        genres,
        type:
          id.startsWith("tv/") || id.startsWith("eps/") ? "series" : "movie",
      };

      if (id.startsWith("tv/")) {
        const totalEps = Number(
          ($(".gmr-numbeps").text() ?? "").replace(/[^0-9\.]/g, "")
        );

        if (!isNaN(totalEps)) detail["totalEps"] = totalEps;
      }

      return detail;
    })
    .toArray()
    .map((e: any) => {
      let detail: Movie = {
        id: e.id as string,
        title: e.title as string,
        poster: e.poster as string,
        rating: e.rating as number | number,
        duration: e.duration as number | number,
        genres: e.genres as string[],
        type: e.type as "movie" | "series",
      };

      if (e.totalEps) {
        detail["totalEps"] = e.totalEps as number;
      }

      return detail;
    });

  return movies;
}
