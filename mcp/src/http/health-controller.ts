import { Request, Response } from "express";

export function healthController(req: Request, res: Response) {
  res.status(200).send({ status: "ok" });
}
