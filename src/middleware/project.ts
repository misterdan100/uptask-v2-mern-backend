import type { Request, Response, NextFunction } from "express";
import Project, { IProjectType } from "../models/Project";

// Redefine type Request
declare global { // declarate a global type
    namespace Express { // point to global type
        interface Request { // interface to mantein preview types of Request type
            project: IProjectType // add a new Type in Request from Express
        }
    }
}

export async function projectExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;
    // search project in db
    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error("Project not found");
      return res.status(404).json({ error: error.message });
    }
    req.project = project
    next()
  } catch (error) {
    res.status(500).json({ error: "There was an error" });
    console.log("[VALIDATEPROJECTEXISTS]", error.message);
  }
}
