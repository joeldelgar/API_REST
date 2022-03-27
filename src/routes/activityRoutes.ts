import {Request, response, Response, Router} from 'express';
import Activities from '../models/Activities';

import Activity from '../models/Activities';
import User from '../models/User';

class ActivityRoutes{
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getActivities(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allActivities = await Activity.find().populate('users', 'name -_id').populate('ratings', 'rating description -_id').populate('organizer').populate('messages');
        if (allActivities.length == 0){
            res.status(404).send("There are no activities created!")
        }
        else{
            res.status(200).send(allActivities);
        }
    }

    public async getActivityByName(req: Request, res: Response) : Promise<void> {
        const activityFound = await Activity.findOne({name: req.params.nameActivity}).populate('users', 'name -_id').populate('ratings', 'rating description -_id').populate('organizer').populate('messages');
        if(activityFound == null){
            res.status(404).send("The activity doesn't exist!");
        }
        else{
            res.status(200).send(activityFound);
        }
    }

    public async addActivity(req: Request, res: Response) : Promise<void> {
        console.log(req.body);
        const {name, description, organizer, language, location} = req.body;
        const newActivity = new Activity({name, description, language, organizer, location});
        await newActivity.save();

        const user = await User.findById(organizer);
        console.log(user);
        user.activitiesOrganized.push(newActivity);
        const userToUpdate = await User.findOneAndUpdate({ name: user.name }, { activitiesOrganized: user.activitiesOrganized});

        res.status(200).send('Activity added!');
    }

    public async updateActivity(req: Request, res: Response) : Promise<void> {        
        console.log(req.body);
        const activityToUpdate = await Activity.findOneAndUpdate ({name: req.params.nameActivity}, req.body);
        if(activityToUpdate == null){
            res.status(404).send("The activity doesn't exist!");
        }
        else{
            res.status(200).send('Updated!');
        }
    }

    public async addUserActivity(req: Request, res: Response) : Promise <void> {
        const{idActivity, idUser} = req.body;

        const user = await User.findById(idUser);
        console.log(user);
        user.activities.push(idActivity);
        const userToUpdate = await User.findOneAndUpdate({_id : idUser}, {activities : user.activities});

        const activity = await Activities.findById(idActivity);
        activity.users.push(idUser);
        const activityToUpdate = await Activities.findOneAndUpdate({_id : idActivity}, {users : activity.users});

        res.status(200).send('User Added to Activity');
    }

    public async deleteActivity(req: Request, res: Response) : Promise<void> {
        const activityToDelete = await Activity.findOneAndDelete ({name :req.params.nameActivity}, req.body);
        if (activityToDelete == null){
            res.status(404).send("The activity doesn't exist!")
        }
        else{
            res.status(200).send('Deleted!');
        }
    } 
    routes(){
        this.router.get('/', this.getActivities);
        this.router.get('/:nameActivity', this.getActivityByName);
        this.router.post('/', this.addActivity);
        this.router.put('/:nameActivity', this.updateActivity);
        this.router.post('/adduseractivity', this.addUserActivity);
        this.router.delete('/:nameActivity', this.deleteActivity);
    }
}

const activityroutes = new ActivityRoutes();

export default activityroutes.router;