"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Activities_1 = __importDefault(require("../models/Activities"));
class ActivityRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }
    async getActivities(req, res) {
        const allActivities = await Activities_1.default.find().populate('users');
        if (allActivities.length == 0) {
            res.status(404).send("There are no activities created!");
        }
        else {
            res.status(200).send(allActivities);
        }
    }
    async getActivityByName(req, res) {
        const activityFound = await Activities_1.default.findOne({ name: req.params.nameActivity }).populate('users');
        if (activityFound == null) {
            res.status(404).send("The activity doesn't exist!");
        }
        else {
            res.status(200).send(activityFound);
        }
    }
    async addActivity(req, res) {
        console.log(req.body);
        const { name, description, language, location } = req.body;
        const newActivity = new Activities_1.default({ name, description, language, location });
        await newActivity.save();
        res.status(200).send('Activity added!');
    }
    async updateActivity(req, res) {
        const activityToUpdate = await Activities_1.default.findOneAndUpdate({ name: req.params.nameActivity }, req.body);
        if (activityToUpdate == null) {
            res.status(404).send("The activity doesn't exist!");
        }
        else {
            res.status(200).send('Updated!');
        }
    }
    async deleteActivity(req, res) {
        const activityToDelete = await Activities_1.default.findOneAndDelete({ name: req.params.nameActivity }, req.body);
        if (activityToDelete == null) {
            res.status(404).send("The activity doesn't exist!");
        }
        else {
            res.status(200).send('Deleted!');
        }
    }
    routes() {
        this.router.get('/', this.getActivities);
        this.router.get('/:nameActivity', this.getActivityByName);
        this.router.post('/', this.addActivity);
        this.router.put('/:nameActivity', this.updateActivity);
        this.router.delete('/:nameActivity', this.deleteActivity);
    }
}
const activityroutes = new ActivityRoutes();
exports.default = activityroutes.router;
