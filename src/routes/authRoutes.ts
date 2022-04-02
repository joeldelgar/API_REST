import {NextFunction, Request, Response, Router} from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Role from '../models/Role';
import { ROLES } from '../models/Role';
import { match } from 'assert';

const _SECRET: string = 'api+jwt';

class AuthRoutes{

    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    public async addRole(req: Request, res: Response){
        const name = req.body.namerole;
        const newRole = new Role({name});
        await newRole.save();
        res.status(200).send('Role added!');

    }

    public async login(req: Request, res: Response) {
        const name = req.body.name;
        const password = req.body.password;
        console.log(password);
        const userFound = await User.findOne({name: name});
        if(!userFound) return res.status(400).json({message: "User not found"});
        console.log(userFound);

        const matchPassword = await bcrypt.compare(password, userFound.password);
        if(!matchPassword) return res.status(401).json({token: null, message: "Invalid password"});

        const token = jwt.sign({id: userFound._id}, _SECRET, {
            expiresIn: 3600
        });

        res.json({token: token});
        console.log(token);
    }
   
    public async comparePassword(password: any, recievedPassword: any){
        return await bcrypt.compare(password, recievedPassword); //returns true if passwords coincide
    }

    routes() {
        this.router.post('/login', this.login);
        this.router.post('/role', this.addRole);
    }

}

const authRoutes = new AuthRoutes();

export default authRoutes.router;