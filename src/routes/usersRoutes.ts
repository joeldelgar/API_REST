import {Request, response, Response, Router} from 'express';
import bcrypt from 'bcryptjs';
import { isOwner, verifyToken } from '../middlewares/authJWT';

import User from '../models/User';
import Activity from '../models/Activities';
import { verify } from 'crypto';
import Role from '../models/Role';

class UserRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getUsers(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allUsers = await User.find().populate('personalRatings', 'rating -_id description').populate('messages').populate('roles','-_id name');
        const activeUsers = allUsers.filter(user => user.active == true);
        if (activeUsers.length == 0) {
            res.status(404).send("There are no users yet!")
        }
        else{
            res.status(200).send(activeUsers);
        }
    }

    public async getUserByName(req: Request, res: Response) : Promise<void> {
        const userFound = await User.findOne({name: req.params.nameUser}).populate('messages');
        if(userFound == null || userFound.active == false){
            res.status(404).send("The user doesn't exist!");
        }
        else{
            res.status(200).send(userFound);
        }
    }

    public async addUser(req: Request, res: Response) : Promise<void> {
        console.log(req.body);
        const {name, surname, username, password, phone, mail, languages, location, photo, role} = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const newUser = new User({name, surname, username, password: hashed, phone, mail, languages, location, photo, active: true});
        const roleadded = await Role.findOne({role});
        newUser.roles = roleadded._id;
        await newUser.save();
        res.status(200).send('User added!');
    }

    public async updateUser(req: Request, res: Response) : Promise<void> {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(req.body.password, salt);
        const userToUpdate = await User.findOneAndUpdate({name: req.params.nameUser}, req.body, {password:hashed});
        const userToUpdatePass = await User.findOneAndUpdate({name: req.params.nameUser}, {password:hashed}); //Temp fix
        if((userToUpdate && userToUpdatePass) == null){
            res.status(404).send("The user doesn't exist!");
        }
        else{
            res.status(200).send('Updated!');
        }
    }

    public async deleteUser(req: Request, res: Response) : Promise<void> {
        const userToDelete = await User.findOneAndDelete ({name:req.params.nameUser}, req.body);
        if (userToDelete == null){
            res.status(404).send("The user doesn't exist!")
        }
        else{
            res.status(200).send('Deleted!');
        }
    } 

    public async disableUser(req: Request, res: Response) : Promise<void> {
        const userToDisable = await User.findOneAndUpdate({name:req.params.nameUser},{active: false});
        if(userToDisable == null){
            res.status(404).send("The user doesn't exist")
        }
        else{
            res.status(200).send('User disabled');
        }        

    }

    routes() {
        this.router.get('/', this.getUsers);
        this.router.get('/:nameUser', this.getUserByName);
        this.router.post('/', this.addUser);
        this.router.put('/:nameUser', [verifyToken, isOwner], this.updateUser);
        this.router.delete('/:nameUser', [verifyToken, isOwner], this.disableUser);
        this.router.delete('/forget/:nameUser', [verifyToken, isOwner], this.deleteUser);
    }
}
const userRoutes = new UserRoutes();

export default userRoutes.router;