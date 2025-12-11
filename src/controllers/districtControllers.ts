import { Request, Response, NextFunction } from "express";
import { prisma } from "#config/db.js";
import createError from "http-errors";
import { serialize } from "##/utils/serialize.js";

export const createDistrict = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      state_id,
      district_code,
      district_name,
      contact_person,
      contact_phone,
      contact_email,
    } = req.body;

    if (!state_id || !district_code || !district_name) {
      res.status(400).json({
        message: "state_id, district_code, district_name are required",
      });
      return;
    }

    // Check if state exists
    const state = await prisma.state_committee.findUnique({
      where: { id: Number(state_id) },
    });

    if (!state) {
      res.status(404).json({ message: "State not found" });
      return;
    }

    const existingDistrict = await prisma.district_committee.findUnique({
      where: { district_code },
    });
    if (existingDistrict) {
      res.status(409).json({ message: "District with this code already exists" });
      return;
    }

    const district = await prisma.district_committee.create({
      data: {
        state_id: Number(state_id),
        district_code,
        district_name,
        contact_person,
        contact_phone,
        contact_email,
        status: "ACTIVE",
      },
    });

    res.status(201).json({
      message: "District created successfully",
      district,
    });
  } catch (error) {
    console.error("Error creating district:", error);
    next(createError(500, "Internal Server Error"));
  }
};


export const getAllDistricts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const states = await prisma.district_committee.findMany();

    res.status(200).json({
      message: "States fetched successfully",
      data: serialize(states),
    });
  } catch (error) {
    console.error("Error fetching states:", error);
    next(error);
  }
};

export const getDistrictsById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { state_id } = req.query;

    const districts = await prisma.district_committee.findMany({
      where: state_id
        ? { state_id: Number(state_id) }
        : {},
    });

    res.status(200).json({
      message: "Districts fetched successfully",
      data: serialize(districts),
    });
  } catch (error) {
    console.error("Error fetching districts:", error);
    next(error);
  }
};