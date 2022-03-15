"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = __importDefault(require("../models/User"));
class UserRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }
    async getUsers(req, res) {
        const allUsers = await User_1.default.find();
        if (allUsers.length == 0) {
            res.status(404).send("There are no users yet!");
        }
        else {
            res.status(200).send(allUsers);
        }
    }
    async getUserByName(req, res) {
        const userFound = await User_1.default.findOne({ name: req.params.nameUser });
        if (userFound == null) {
            res.status(404).send("The user doesn't exist!");
        }
        else {
            res.status(200).send(userFound);
        }
    }
    async addUser(req, res) {
        console.log(req.body);
        const { name, surname, username, password } = req.body;
        const newUser = new User_1.default({ name, surname, username, password });
        await newUser.save();
        res.status(200).send('User added!');
    }
    async updateUser(req, res) {
        const userToUpdate = await User_1.default.findOneAndUpdate({ name: req.params.nameUser }, req.body);
        if (userToUpdate == null) {
            res.status(404).send("The user doesn't exist!");
        }
        else {
            res.status(200).send('Updated!');
        }
    }
    async deleteUser(req, res) {
        const userToDelete = await User_1.default.findOneAndDelete({ name: req.params.nameUser }, req.body);
        if (userToDelete == null) {
            res.status(404).send("The user doesn't exist!");
        }
        else {
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
exports.default = userRoutes.router;
