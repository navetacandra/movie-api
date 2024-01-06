import { Router, Request, Response, NextFunction } from "express";
import IDLIX from "./idlix";

const router = Router();
const idlix = new IDLIX();

function validateParams(
  req: Request,
  res: Response,
  next: NextFunction,
  required: string[]
) {
  const missing = required.filter((key) => !req.query[key]);
  if (missing.length > 0) {
    return res
      .status(400)
      .json({ status: "error", message: "missing parameter" });
  }
  next();
}

router.get(
  "/search",
  (req: Request, res: Response, next: NextFunction) =>
    validateParams(req, res, next, ["q"]),
  async (req: Request, res: Response) => {
    const query = req.query.q as string;
    try {
      const { code, data } = await idlix.search(query);
      return res.status(code).json(data);
    } catch (err) {
      return res
        .status(500)
        .json({ status: "error", message: err?.toString() ?? "" });
    }
  }
);

router.get(
  "/detail",
  (req: Request, res: Response, next: NextFunction) =>
    validateParams(req, res, next, ["id"]),
  async (req: Request, res: Response) => {
    const id = req.query.id as string;
    try {
      const { code, data } = await idlix.details(id);
      return res.status(code).json(data);
    } catch (err) {
      return res
        .status(500)
        .json({ status: "error", message: err?.toString() ?? "" });
    }
  }
);

router.get("*", (req: Request, res: Response) => {
  return res.status(404).json({ status: "error", message: "not found" });
});

export default router;
