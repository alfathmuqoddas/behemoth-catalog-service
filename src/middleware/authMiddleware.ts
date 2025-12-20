import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs";
import path from "path";

const publicKeyPath =
  process.env.JWT_PUBLIC_KEY_PATH ||
  path.join(__dirname, "../../keys/public.pem");

const publicKey = fs.readFileSync(publicKeyPath, "utf8");

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: "admin" | "user";
}

export interface AuthRequest extends Request {
  user?: CustomJwtPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as CustomJwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};
