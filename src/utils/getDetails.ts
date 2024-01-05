import { load } from "cheerio";
import { serialize } from "./serialize";
import { MovieDetail } from "../types";

export function getDetails(html: string, series = false): MovieDetail | null {
  const $ = load(html);

  // Invalid / Not Found Movie
  if (($(".page-title.screen-reader-text").text() ?? "") === "Kesalahan 404") {
    return null;
  }

  let details: MovieDetail = {
    id: serialize($('meta[property="og:url"]').attr("content") ?? ""),
    title: $(".gmr-movie-data-top .entry-title").text() ?? "",
    rating: "-",
    synopsis: ($('[itemprop="description"] > p').text() ?? "").trim(),
    poster: $("figure .attachment-thumbnail").attr("src") ?? "",
    year: "-",
    duration: "-",
    country: "-",
    genres: "-",
    quality: "-",
    release: "-",
  };

  const rating = Number(
    ($('[itemprop="ratingValue"]').text() ?? "").replace(/[^0-9\.]/g, ""),
  );
  details["rating"] = isNaN(rating) ? "-" : rating;

  $('[itemprop="description"] .gmr-moviedata').each((_, el) => {
    const currentElement = $(el);
    const currentText = currentElement.text() ?? "";

    // Duration
    if (currentText.includes("Durasi:")) {
      const duration = Number(currentText.replace(/[^0-9\.]/g, ""));
      details["duration"] = isNaN(duration) ? "-" : duration;
    }

    // Country
    if (currentText.includes("Negara:")) {
      details["country"] = currentText
        .replace("Negara:", "")
        .split(",")
        .map((el) => el.trim());
    }

    // Genre
    if (currentText.includes("Genre:")) {
      details["genres"] = currentText
        .replace("Genre:", "")
        .split(",")
        .map((el) => el.trim());
    }

    // Year
    if (currentText.includes("Tahun:")) {
      const year = Number(currentText.replace(/Tahun: ?/, ""));
      details["year"] = isNaN(year) ? "-" : year;
    }

    // Quality
    if (currentText.includes("Kualitas:")) {
      const quality = currentText.replace(/Kualitas: ?/, "");
      details["quality"] = quality;
    }

    // Release
    if (currentText.includes("Rilis:")) {
      const release = currentText.replace(/Rilis: ?/, "");
      details["release"] = release;
    }
  });

  if (!series) {
    const iframe = $("iframe");
    if (iframe.map((i) => i).toArray().length > 0) {
      details["embed"] = iframe
        .map((i, el) => $(el).attr("src") ?? "")
        .toArray()
        .map((e) => e.toString());
    }
  } else {
    details["eps"] = $(".gmr-listseries a")
      .map((_, el) => {
        const title = $(el).attr("title") ?? "";
        const href = $(el).attr("href") ?? "";
        const label = $(el).text() ?? "";
        if (title.length > 1) {
          return {
            id: serialize(href),
            label: label.trim(),
          };
        }
      })
      .toArray()
      .map((e: any) => ({ id: e.id, label: e.label }))
      .filter((f) => f.id);
  }

  return details;
}
