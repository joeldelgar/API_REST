import {Request, response, Response, Router} from 'express';

import Activity from '../models/Activities';

class ActivityRoutes{
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getActivities(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allActivities = await Activity.find().populate('users');
        if (allActivities.length == 0){
            res.status(404).send("There are no activities created!")
        }
        else{
            res.status(200).send(allActivities);
        }
    }

    public async getActivityByName(req: Request, res: Response) : Promise<void> {
        const activityFound = await Activity.findOne({name: req.params.nameActivity}).populate('users');
        if(activityFound == null){
            res.status(404).send("The activity doesn't exist!");
        }
        else{
            res.status(200).send(activityFound);
        }
    }

    public async addActivity(req: Request, res: Response) : Promise<void> {
        console.log(req.body);
        const {name, description, language, location} = req.body;
        const newActivity = new Activity({name, description, language, location});
        await newActivity.save();
        res.status(200).send('Activity added!');
    }

    public async updateActivity(req: Request, res: Response) : Promise<void> {
        const activityToUpdate = await Activity.findOneAndUpdate ({name: req.params.nameActivity}, req.body);
        if(activityToUpdate == null){
            res.status(404).send("The activity doesn't exist!");
        }
        else{
            res.status(200).send('Updated!');
        }
    }

    public async deleteActivity(req: Request, res: Response) : Promise<void> {
        const activityToDelete = await Activity.findOneAndDelete ({name:req.params.nameActivity}, req.body);
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
        this.router.delete('/:nameActivity', this.deleteActivity);
    }
}

const activityroutes = new ActivityRoutes();

export default activityroutes.router;