import { Request, Response, NextFunction } from 'express'
import jwt from "jsonwebtoken";
import User from "../models/User";

const _SECRET: string = 'api+jwt';

export async function verifyToken (req: Request, res: Response, next: NextFunction) {
    const token = req.header("x-access-token");
    if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    let jwtPayload = <any>jwt.verify(token, _SECRET);
    res.locals.jwtPayload = jwtPayload;
    const id = jwtPayload.id;
    console.log('I try');
    const user = await User.findById(id);
    console.log(user);
    if (!user) return res.status(404).json({ message: "No user found" });
    
    next();

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized!" });
  }
};

export async function isOwner (req: Request, res: Response, next: NextFunction) {
  try {
    console.log('Verifying if it is owner');
    const user = await User.findById(res.locals.jwtPayload.id);
    console.log(user);

    //const todo = await Todo.findById(todoId);

    //if (!todo) return res.status(403).json({ message: "No user found" });

    //if (todo.user != req.userId) return res.status(403).json({ message: "Not Owner" });

    next();

  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: error });
  }
};