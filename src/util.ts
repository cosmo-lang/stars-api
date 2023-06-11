import { Request, Response } from "express";

export function errorBody(message: string): { success: boolean; error: string; } {
  return { success: false, error: message };
}

export function assertBodyField(req: Request, res: Response, fieldName: string): boolean {
  const fieldExists = req.body[fieldName];
  if (!fieldExists)
    res.status(400).json(errorBody(`No "${fieldName}" field provided in body.`));

  return fieldExists;
}