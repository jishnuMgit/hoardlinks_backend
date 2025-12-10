import { prisma } from '#config/db.js'
import { NextFunction, Request, Response } from 'express'
import createError from 'http-errors'
import { COOKIE_NAME, COOKIE_OPTIONS, redisLog } from '#config/index.js'
import jwt from "jsonwebtoken";

import bcrypt from 'bcryptjs'
const JWT_SECRET = process.env.JWT_SECRET as string;

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*  
    #swagger.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/loginSchema" },
          example: { $ref: "#/components/examples/loginSchema" }
        }
      }
    } 
  */

  try {
    const { login_id, password } = req.body;

    // -----------------------------------
    // 🔹 Validate input
    // -----------------------------------
    if (!login_id || !password) {
      return res.status(400).json({
        success: false,
        message: "login_id and password are required."
      });
    }

    // -----------------------------------
    // 🔹 Find user
    // -----------------------------------
    const user = await prisma.user_account.findUnique({
      where: { login_id }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid login_id or password."
      });
    }

    // -----------------------------------
    // 🔹 Compare password
    // -----------------------------------
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid login_id or password."
      });
    }

    // -----------------------------------
    // 🔹 Generate JWT Token
    // -----------------------------------
    const tokenPayload = {
      id: user.id.toString(),
      role_type: user.role_type
    };

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set.");
    }

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "1d"
    });

    // -----------------------------------
    // 🔹 Set token in HTTP-Only Cookie (Session)
    // -----------------------------------
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false, // change true in production (HTTPS)
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // -----------------------------------
    // 🔹 Prepare Response
    // -----------------------------------
    const sanitizedUser = convertBigInt(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      access_token: token,     // frontend can store in localStorage if needed
      role_type: user.role_type,  // send role to frontend
      user: sanitizedUser
    });

  } catch (error) {
    console.error("Login Error:", error);
    next(error);
  }
};

const convertBigInt = (obj: any) =>
  JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

export const Register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      login_id,
      password,
      mobile_number,
      role_type,
      state_id,
      district_id,
      agency_id,
    } = req.body;

    // Logged-in user from middleware
    const loggedUser = req.user; // { id, role_type }
    console.log("Logged User:", loggedUser);

    // ------------------------------
    // 🔹 Basic Validation
    // ------------------------------
    if (!login_id || !password || !mobile_number || !role_type) {
      return res.status(400).json({
        success: false,
        message:
          "login_id, password, mobile_number, and role_type are required.",
      });
    }

    // ------------------------------
    // 🔥 Role-based permission check
    // ------------------------------
    const creatorRole = loggedUser?.role_type; // STATE / DISTRICT / AGENCY

    const allowedRoles: any = {
      STATE: ["STATE", "DISTRICT", "AGENCY"],
      DISTRICT: ["DISTRICT", "AGENCY"],
      AGENCY: ["AGENCY"],
    };

    if (!allowedRoles[creatorRole]?.includes(role_type)) {
      return res.status(403).json({
        success: false,
        message: `You are not allowed to create a user with role_type ${role_type}.`,
      });
    }

    // ------------------------------
    // 🔹 Check Duplicate login_id
    // ------------------------------
    const existingUser = await prisma.user_account.findUnique({
      where: { login_id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Login ID already exists.",
      });
    }

    // 🔹 Check Duplicate Phone Number
    const existingPhone = await prisma.user_account.findFirst({
      where: { mobile_number },
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists.",
      });
    }

    // ------------------------------
    // 🔹 Hash Password
    // ------------------------------
    const password_hash = await bcrypt.hash(password, 10);

    // ------------------------------
    // 🔹 Create User
    // ------------------------------
    const newUser = await prisma.user_account.create({
      data: {
        login_id,
        password_hash,
        mobile_number,
        role_type,
        state_id: role_type === "STATE" ? Number(state_id) : null,
        district_id: role_type === "DISTRICT" ? Number(district_id) : null,
        agency_id: role_type === "AGENCY" ? Number(agency_id) : null,
      },
    });

    const sanitizedUser = convertBigInt(newUser);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: sanitizedUser,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
 try {
  
 } catch (error) {
  next(error)
 }
}
