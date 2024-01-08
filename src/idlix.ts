import { load } from "cheerio";
import { DetailResponse, SearchResponse } from "./types";
import axios, { AxiosRequestConfig } from "axios";
import getMovies from "./utils/getMovies";
import getDetails from "./utils/getDetails";
import "dotenv/config";

export default class IDLIX {
  private home: string;
  private requestInit: AxiosRequestConfig<any>;

  constructor() {
    this.home = process.env.IDLIX_URL ?? "";
    this.requestInit = {
      responseType: "text",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9,id;q=0.8",
        "cache-control": "max-age=0",
        "upgrade-insecure-requests": "1",
      },
    };
  }

  async featured(): Promise<SearchResponse> {
    try {
      const fetchRes = await axios.get(this.home, this.requestInit);
      const html = fetchRes.data as string;
      const results = getMovies(html);

      return {
        code: results.length < 1 ? 404 : 200,
        data: {
          status: results.length < 1 ? "error" : "success",
          itemCount: results.length,
          items: results,
        },
      };
    } catch (err) {
      console.log(`[ERROR] ${err?.toString()}`);
      return {
        code: 500,
        data: {
          status: "error",
          message: err?.toString() ?? "Internal Server Error",
        },
      };
    }
  }

  async search(query: string, page = 1, maxPage = 20): Promise<SearchResponse> {
    query = query.trim();
    if (query.length < 1) {
      return {
        code: 400,
        data: { status: "error", message: "query is required!" },
      };
    }

    const targetURL = `${this.home}page/1?s=${encodeURIComponent(
      query
    )}&search=advanced&post_type=&index=&orderby=&genre=&movieyear=&country=&quality=`;

    try {
      const fetchRes = await axios.get(targetURL, this.requestInit);
      const html = fetchRes.data as string;
      const $ = load(html);

      const pages = $(".page-numbers li")
        .map((_, el) => {
          const href = $(el).find("a").attr("href") ?? "";
          const matched = Object.values(href?.match(/page\/(\d+)/) ?? {});
          return matched.length > 1 ? Number(matched[1]) : null;
        })
        .toArray()
        .filter((f) => f)
        .map((num) => Number(num));

      const startPage = page - 1;
      const lastPage = pages.length > 3 ? pages[pages.length - 2] : 1;
      let totalPage = lastPage - startPage;
      totalPage = totalPage > maxPage ? maxPage : totalPage;

      const responses =
        lastPage > 1
          ? await Promise.all(
              Array.from({ length: totalPage }).map((_, i) =>
                axios.get(
                  `${this.home}page/${i + page}?s=${encodeURIComponent(
                    query
                  )}&search=advanced&post_type=&index=&orderby=&genre=&movieyear=&country=&quality=`,
                  this.requestInit
                )
              )
            )
          : [fetchRes];

      const results = Array.from(
        new Set(
          responses.map((response) => getMovies(response.data as string)).flat()
        )
      );

      return {
        code: results.length < 1 ? 404 : 200,
        data: {
          status: results.length < 1 ? "error" : "success",
          hasNext: lastPage > page + totalPage,
          itemCount: results.length,
          items: results,
        },
      };
    } catch (err) {
      console.log(`[ERROR] ${err?.toString()}`);
      return {
        code: 500,
        data: {
          status: "error",
          message: err?.toString() ?? "Internal Server Error",
        },
      };
    }
  }

  async details(id: string): Promise<DetailResponse> {
    id = id.trim();
    if (id.length < 1) {
      return {
        code: 400,
        data: { status: "error", message: "id is required." },
      };
    }

    try {
      const fetchRes = await axios.get(this.home + id, this.requestInit);
      const html = fetchRes.data;
      const isSeries = id.startsWith("tv/");
      const details = getDetails(html, isSeries);

      if (details === null) {
        return {
          code: 404,
          data: { status: "error", message: "id not found!" },
        };
      }

      return {
        code: 200,
        data: {
          status: "success",
          detail: details,
        },
      };
    } catch (err) {
      console.log(`[ERROR] ${err?.toString()}`);
      return {
        code: 500,
        data: {
          status: "error",
          message: err?.toString() ?? "Internal Server Error",
        },
      };
    }
  }
}
