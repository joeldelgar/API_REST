"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String },
    mail: { type: String },
    languages: [{ type: String }],
    location: [{ type: String }],
    photo: { type: String },
    personalRatings: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Rating' }],
    activityRatings: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Rating' }],
    activities: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Activities' }],
    creationDate: { type: Date, default: Date.now },
});
exports.default = (0, mongoose_1.model)('User', UserSchema);
