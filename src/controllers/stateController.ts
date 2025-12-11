import { Request, Response, NextFunction } from "express";
import { prisma } from "#config/db.js";
import createError from "http-errors";
import { serialize } from "#utils/serialize.js";

export const createState = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      state_code,
      state_name,
      contact_person,
      contact_phone,
      contact_email,
    } = req.body;

    // Validation
    if (!state_code || !state_name) {
      res.status(400).json({
        message: "state_code and state_name are required",
      });
      return;
    }

    const existingState = await prisma.state_committee.findUnique({
      where: { state_code },
    });

    if (existingState) {
      res.status(409).json({ message: "State with this code already exists" });
      return;
    }

    // Create state
    const state = await prisma.state_committee.create({
      data: {
        state_code,
        state_name,
        contact_person,
        contact_phone,
        contact_email,
        status: "ACTIVE",
      },
    });

    res.status(201).json({
      message: "State created successfully",
      state,
    });
  } catch (error) {
    console.error("Error creating state:", error);
    next(createError(500, "Internal Server Error"));
  }
};



export const getStates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const states = await prisma.state_committee.findMany();

    res.status(200).json({
      message: "States fetched successfully",
      data: serialize(states),
    });
  } catch (error) {
    console.error("Error fetching states:", error);
    next(error);
  }
};


export const getStateById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params; // ✅ FIXED

    console.log("State ID:", id);

    const state = await prisma.state_committee.findUnique({
      where: { id: BigInt(id) }, // ✅ FIXED
      include: {
        district_committee: true, // optional
      },
    });

    if (!state) {
      res.status(404).json({ message: "State not found" });
      return;
    }

    res.status(200).json({
      message: "State fetched successfully",
      data: serialize(state),
    });
  } catch (error) {
    console.error("Error fetching state by ID:", error);
    next(error);
  }
};

