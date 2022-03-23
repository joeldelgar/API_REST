import {Request, response, Response, Router} from 'express';

import User from '../models/User';
import Activity from '../models/Activities';

class UserRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getUsers(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allUsers = await User.find().populate('personalRatings', 'rating -_id description').populate('messages');
        if (allUsers.length == 0){
            res.status(404).send("There are no users yet!")
        }
        else{
            res.status(200).send(allUsers);
        }
    }

    public async getUserByName(req: Request, res: Response) : Promise<void> {
        const userFound = await User.findOne({name: req.params.nameUser}).populate('messages');
        if(userFound == null){
            res.status(404).send("The user doesn't exist!");
        }
        else{
            res.status(200).send(userFound);
        }
    }

    public async addUser(req: Request, res: Response) : Promise<void> {
        console.log(req.body);
        const {name, surname, username, password, phone, mail, languages, location, photo} = req.body;
        const newUser = new User({name, surname, username, password, phone, mail, languages, location, photo});
        await newUser.save();
        res.status(200).send('User added!');
    }

    public async updateUser(req: Request, res: Response) : Promise<void> {
        const userToUpdate = await User.findOneAndUpdate ({name: req.params.nameUser}, req.body);
        if(userToUpdate == null){
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
    routes() {
        this.router.get('/', this.getUsers);
        this.router.get('/:nameUser', this.getUserByName);
        this.router.post('/', this.addUser);
        this.router.put('/:nameUser', this.updateUser);
        this.router.delete('/:nameUser', this.deleteUser);
    }
}
const userRoutes = new UserRoutes();

export default userRoutes.router;