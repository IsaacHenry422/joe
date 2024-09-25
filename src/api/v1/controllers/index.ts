import { Request, Response } from "express";

class IndexController {
  welcomeHandler(req: Request, res: Response) {
    const payload = {
      message: "Welcome to the root of VAAD API",
    };

    res.ok(payload);
  }
}

export default new IndexController();
