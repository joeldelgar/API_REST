"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Rating_1 = __importDefault(require("../models/Rating"));
class RatingRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }
    async getRatings(req, res) {
        const allRatings = await Rating_1.default.find().populate('rater', 'name').populate('rated', 'name username');
        if (allRatings.length == 0) {
            res.status(404).send("There are no ratings yet!");
        }
        else {
            res.status(200).send(allRatings);
        }
    }
    async getRatingsByName(req, res) {
        const ratingFound = await Rating_1.default.findOne({ name: req.params.nameRating }).populate('rater', 'name').populate('rated', 'name username');
        if (ratingFound == null) {
            res.status(404).send("The rating doesn't exist!");
        }
        else {
            res.status(200).send(ratingFound);
        }
    }
    async addRating(req, res) {
        console.log(req.body);
        const { rater, rated, rating, description } = req.body;
        const newRating = new Rating_1.default({ rater, rated, rating, description });
        const savedRating = await newRating.save();
        res.status(200).send('Rating added!');
    }
    async updateRating(req, res) {
        const ratingToUpdate = await Rating_1.default.findOneAndUpdate({ name: req.params.nameRating }, req.body);
        if (ratingToUpdate == null) {
            res.status(404).send("The rating doesn't exist!");
        }
        else {
            res.status(200).send('Updated!');
        }
    }
    async deleteRating(req, res) {
        const ratingToDelete = await Rating_1.default.findOneAndDelete({ name: req.params.nameRating }, req.body);
        if (ratingToDelete == null) {
            res.status(404).send("This rating doesn't exist!");
        }
        else {
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
exports.default = ratingRoutes.router;
