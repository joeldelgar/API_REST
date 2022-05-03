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

    public async getRoles(req: Request, res: Response) : Promise<void> {
        const allRoles = await Role.find();
        if (allRoles.length == 0){
            res.status(404).send("There are no roles yet!")
        }
        else{
            res.status(200).send(allRoles);
        }
    }

    public async addRole(req: Request, res: Response){
        const name = req.body.name;
        const newRole = new Role({name});
        await newRole.save();
        res.status(200).send('Role added!');
    }

    public async register(req: Request, res: Response){
        const {name, surname, username, password, phone, mail, languages, location, photo, role} = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const newUser = new User({name, surname, username, password: hashed, phone, mail, languages, location, photo, active: true});
        const roleadded = await Role.findOne({role});
        newUser.roles = roleadded._id;
        await newUser.save();
        
        const userFound = await User.findOne({username: username});
        const token = jwt.sign({id: userFound._id}, _SECRET, {
            expiresIn: 3600
        });
        res.status(200).json({token: token});
    }

    public async login(req: Request, res: Response) {
        const {username, password} = req.body;
        console.log(password);
        const userFound = await User.findOne({username: username});
        if(!userFound) return res.status(400).json({message: "User not found"});

        const matchPassword = await bcrypt.compare(password, userFound.password);
        if(!matchPassword) return res.status(401).json({message: "Invalid password"});

        const token = jwt.sign({id: userFound._id}, _SECRET, {
            expiresIn: 3600
        });
        
        res.status(200).json({token: token});
        console.log(token);
    }
   
    routes() {
        this.router.get('/roles', this.getRoles);
        this.router.post('/roles', this.addRole);
        this.router.post('/login', this.login);
        this.router.post('/register', this.register);
    }

}

const authRoutes = new AuthRoutes();

export default authRoutes.router;