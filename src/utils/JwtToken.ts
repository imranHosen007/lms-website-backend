import jwt from "jsonwebtoken";
import { IUser } from "../models/user.model";
import { Response } from "express";
import { redis } from "../database/redis";

export interface TokenOpetions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  samSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

const accessTokenExpiry = parseInt(
  process.env.ACCESS_TOKEN_EXPIRY || "300",
  10
);
const refreshTokenExpiry = parseInt(
  process.env.REFRESH_TOKEN_EXPIRY || "300",
  10
);
export const accessTokenOptions: TokenOpetions = {
  expires: new Date(Date.now() + accessTokenExpiry * 60 * 1000),
  maxAge: accessTokenExpiry * 60 * 1000,
  httpOnly: true,
  samSite: "none",
  secure: true,
};
export const refreshTokenOptions: TokenOpetions = {
  expires: new Date(Date.now() + refreshTokenExpiry * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpiry * 24 * 60 * 60 * 1000,
  httpOnly: true,
  samSite: "none",
  secure: true,
};

export const SendToken = async (
  user: IUser,
  StatusCode: number,
  res: Response
) => {
  const accessToken = await user.signAccessToken();
  const refreshToken = await user.signRefreshToken();

  //   --Upload-Redis----

  await redis.set(user._id as any, JSON.stringify(user) as any);

  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);
  res.status(StatusCode).json({
    success: true,
    user,
    accessToken,
  });
};
