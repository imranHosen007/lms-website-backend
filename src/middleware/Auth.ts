import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel from "../models/user.model";
import { redis } from "../database/redis";
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return next(new ErrorHandler(`Please Login to Access This Token`, 400));
  }

  const decoded = (await jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET as string
  )) as JwtPayload;

  if (!decoded) {
    return next(new ErrorHandler(`Access Token Is Not Valid`, 400));
  }

  const user = await redis.get(decoded.id);

  if (!user) {
    return next(new ErrorHandler(`User Not Found`, 400));
  }

  req.user = JSON.parse(user);
  next();
};

// -------User-Role-----

export const authorizationRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req?.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role ${req?.user?.role} is not allowed to access`,
          400
        )
      );
    }
    next();
  };
};
