import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import UserModel, { IUser } from "../models/user.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import cloudinary from "cloudinary";

import {
  accessTokenOptions,
  refreshTokenOptions,
  SendToken,
} from "../utils/JwtToken";
import { redis } from "../database/redis";
import { ActivateSendMail } from "../utils/Mailer";
// ---Registion-User--

interface UserRegistionBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

interface IactivationToken {
  token: string;
  activationCode: string;
}

export const creationActivationToken = (user: any): IactivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_TOKEN_SECRET as Secret,
    {
      expiresIn: "10m",
    }
  );
  return { token, activationCode };
};

export const createNewUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;

    const isExitsEmail = await UserModel.findOne({ email });
    if (isExitsEmail) {
      return next(new ErrorHandler(`User Already Exits`, 400));
    }

    const newUser: UserRegistionBody = {
      name,
      email,
      password,
    };

    const activeationToken = creationActivationToken(newUser);

    const activationCode = activeationToken.activationCode;

    try {
      ActivateSendMail({
        name: newUser.name,
        email: newUser.email,
        subject: "Actiavtion Your Account",
        activationCode,
      });
      res.status(200).json({
        success: true,
        message: `Please Check Your Email ${newUser.email} to Activate Your Account`,
        activeationToken: activeationToken.token,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ---Actaivate-User-----
interface UserActivationRequest {
  activation_token: string;
  activation_code: string;
}
export const activateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { activation_token, activation_code } =
      req.body as UserActivationRequest;

    const newUser: { user: IUser; activationCode: string } = jwt.verify(
      activation_token,
      process.env.ACTIVATION_TOKEN_SECRET as string
    ) as { user: IUser; activationCode: string };

    const { name, email, password } = newUser.user;

    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler(`Invalid Activation Code`, 400));
    }

    const exitsingUser = await UserModel.findOne({ email });

    if (exitsingUser) {
      return next(new ErrorHandler(`User Already Exits`, 400));
    }

    const user = await UserModel.create({
      name,
      email,
      password,
    });
    res.status(200).json({
      success: true,
      message: "User Activation SuccesFull",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----Login--User---
interface UserLoginBody {
  email: string;
  password: string;
}

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body as UserLoginBody;

    if (!email || !password) {
      return next(new ErrorHandler(`Please Provide Email And Passowrd`, 400));
    }

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler(`Invalid Email Or Password `, 400));
    }
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
      return next(new ErrorHandler(`Please provide the correct Password`, 400));
    }

    SendToken(user, 200, res);
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----Logout--User------

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.cookie("accessToken", "", { maxAge: 1 });
    res.cookie("refreshToken", "", { maxAge: 1 });

    await redis.del(req.user?._id as string);
    res.status(200).json({
      success: true,
      message: "Log Out SuccessFull",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// -----Update-Access-Token-----

export const updateAccesssToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_Token = req.cookies.refreshToken;

    if (!refresh_Token) {
      return next(new ErrorHandler(`Please Login to Access This Token`, 400));
    }
    const decoded = jwt.verify(
      refresh_Token,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as JwtPayload;

    if (!decoded) {
      return next(
        new ErrorHandler(
          `
        Could Not Refresh Token`,
          400
        )
      );
    }
    const session = await redis.get(decoded.id as string);

    if (!session) {
      return next(
        new ErrorHandler(
          `
        Could Not Refresh Token`,
          400
        )
      );
    }

    const user = JSON.parse(session);

    const accessToken = jwt.sign(
      {
        id: user?._id,
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "30m",
      }
    );
    const refreshToken = jwt.sign(
      {
        id: user?._id,
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "30d",
      }
    );
    req.user = user;

    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
    await redis.set(user?._id, JSON.stringify(user), "EX", 604800);

    next();
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----get-User-Info---

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userJson = await redis.get(req.user?._id as string);

    if (userJson) {
      const user = JSON.parse(userJson);
      res.status(200).json({
        success: true,
        user,
      });
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// --Soical-Sing-in-----
interface socailAuthBody {
  name: string;
  email: string;
  avatar: string;
}
export const createUserSocial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, avatar } = req.body as socailAuthBody;
    console.log(`SocailAuth Run`);
    const isExitsUser = await UserModel.findOne({ email });
    if (!isExitsUser) {
      const newUser = await UserModel.create({
        email,
        name,
        avatar: {
          url: avatar,
        },
      });

      await SendToken(newUser, 200, res);
    } else {
      console.log(isExitsUser);
      await SendToken(isExitsUser, 200, res);
    }
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// -------Update-User-Info-----

interface updateInfoBody {
  name?: string;
}

export const updateUserInformation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body as updateInfoBody;

    const userId = req?.user?._id;
    const user = await UserModel.findById(userId);

    if (name && user) {
      user.name = name as string;
    }
    await user?.save();
    redis.set(userId as string, JSON.stringify(user));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// -----Update-Password----
interface changePasswordBody {
  oldPassword: string;
  newPassword: string;
}
export const changeUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { newPassword, oldPassword } = req.body as changePasswordBody;

    const user = await UserModel.findById(req?.user?._id).select("+password");
    if (user?.password == undefined) {
      return next(new ErrorHandler("Invalid User", 400));
    }
    const isPasswordMatched = await user?.comparePassword(oldPassword);

    if (!isPasswordMatched) {
      return next(new ErrorHandler("Old password is incorrect!", 400));
    }
    user.password = newPassword;
    await user?.save();

    redis.set(user._id as string, JSON.stringify(user));

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----Update-Profile-Picture----
interface changeAvatarBody {
  avatar: string;
}
export const updateProfilePicture = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { avatar } = req.body as changeAvatarBody;

    const user = await UserModel.findById(req.user?._id);

    if (avatar && user) {
      if (user?.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
        const myUpload = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
        });
        user.avatar = {
          public_id: myUpload.public_id,
          url: myUpload.secure_url,
        };
      } else {
        const myUpload = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
        });
        user.avatar = {
          public_id: myUpload.public_id,
          url: myUpload.secure_url,
        };
      }
    }

    const updateUser = await user?.save();

    await redis.set(req.user?._id as string, JSON.stringify(user) as string);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// ----get-all-User---

export const getAllUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// -------Update-User-Role-----

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, role } = req.body;

    const user = await UserModel.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );
    res.status(200).json({
      success: true,
      // user,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};

// -----Delete-User----

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return next(new ErrorHandler(`User Not Found`, 404));
    }
    await redis.del(req.params.id);
    res.status(200).json({
      success: true,
      message: "Course Delete SuccessFull",
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
};
