import {Request, response, Response, Router} from 'express';
import { isOwner, verifyToken } from '../middlewares/authJWT';

import Activity from '../models/Activities';
import Rating from '../models/Rating';
import User from '../models/User';

class RatingRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getRatings(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allRatings = await Rating.find().populate('rater', 'name').populate('userRated', 'name username').populate('activityRated', 'name');
        if (allRatings.length == 0){
            res.status(404).send("There are no ratings yet!")
        }
        else{
            res.status(200).send(allRatings);
        }
    }

    public async getRatingsByName(req: Request, res: Response) : Promise<void> {
        const ratingFound = await Rating.findOne({name: req.params.nameRating}).populate('rater', 'name').populate('userRated', 'name username').populate('activityRated', 'name');
        if(ratingFound == null){
            res.status(404).send("The rating doesn't exist!");
        }
        else{
            res.status(200).send(ratingFound);
        }
    }


    public async addRatingUser(req: Request, res: Response) : Promise<void> {
        const {tittle, rater, userRated, rating, description} = req.body;
        const user = await User.findById(userRated);

        const newRating = new Rating({tittle, rater, userRated, rating, description});
        const savedRating = await newRating.save();

        user.personalRatings.push(newRating._id);

        const userToUpdate = await User.findOneAndUpdate({ _id : userRated }, { personalRatings: user.personalRatings});

        res.status(200).send('Rating added!');
    }

    public async addRatingActivity(req: Request, res: Response) : Promise<void> {
        const {tittle, rater, activityRated, rating, description} = req.body;
        const activity = await Activity.findById(activityRated);
        console.log(activity);

        const newRating = new Rating({tittle, rater, activityRated, rating, description});
        const savedRating = await newRating.save();

        activity.ratings.push(newRating._id);

        const activityToUpdate = await Activity.findOneAndUpdate({ _id : activityRated }, { ratings: activity.ratings});

        res.status(200).send('Rating added!');
    }

    public async updateRating(req: Request, res: Response) : Promise<void> {
        const ratingToUpdate = await Rating.findOneAndUpdate ({name: req.params.nameRating}, req.body);
        if(ratingToUpdate == null){
            res.status(404).send("The rating doesn't exist!");
        }
        else{
            res.status(200).send('Updated!');
        }
    }

    public async deleteRating(req: Request, res: Response) : Promise<void> {
        const ratingToDelete = await Rating.findOneAndDelete ({name:req.params._id}, req.body);
        if (ratingToDelete == null){
            res.status(404).send("This rating doesn't exist!")
        }
        else{
            res.status(200).send('Deleted!');
        }
    } 
    
    routes() {
        this.router.get('/', this.getRatings);
        this.router.get('/:nameRating', this.getRatingsByName);
        this.router.post('/ratinguser', this.addRatingUser);
        this.router.post('/ratingactivity', this.addRatingActivity);
        this.router.put('/:nameRating', [verifyToken, isOwner], this.updateRating);
        this.router.delete('/:nameRating', [verifyToken, isOwner], this.deleteRating);
    }
}
const ratingRoutes = new RatingRoutes();

export default ratingRoutes.router;