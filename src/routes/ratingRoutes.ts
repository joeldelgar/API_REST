import {Request, response, Response, Router} from 'express';

import Rating from '../models/Rating';
import User from '../models/User';

class RatingRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getRatings(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allRatings = await Rating.find().populate('rater', 'name').populate('rated', 'name username');
        if (allRatings.length == 0){
            res.status(404).send("There are no ratings yet!")
        }
        else{
            res.status(200).send(allRatings);
        }
    }

    public async getRatingsByName(req: Request, res: Response) : Promise<void> {
        const ratingFound = await Rating.findOne({name: req.params.nameRating}).populate('rater', 'name').populate('rated', 'name username');
        if(ratingFound == null){
            res.status(404).send("The rating doesn't exist!");
        }
        else{
            res.status(200).send(ratingFound);
        }
    }


    public async addRating(req: Request, res: Response) : Promise<void> {
        console.log(req.body);
        const {rater, rated, rating, description} = req.body;
        const newRating = new Rating({rater, rated, rating, description});
        const savedRating = await newRating.save();
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
        const ratingToDelete = await Rating.findOneAndDelete ({name:req.params.nameRating}, req.body);
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
        this.router.post('/', this.addRating);
        this.router.put('/:nameRating', this.updateRating);
        this.router.delete('/:nameRating', this.deleteRating);
    }
}
const ratingRoutes = new RatingRoutes();

export default ratingRoutes.router;