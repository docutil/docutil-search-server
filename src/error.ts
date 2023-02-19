import { Request, Response, Handler } from "express"

export function error(err: Error, req: Request, res: Response, next: Handler) {
  res.status(500)
  res.send({message: err.message})
}