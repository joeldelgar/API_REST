"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RatingSchema = new mongoose_1.Schema({
    rater: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    userRated: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    activityRated: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Activities' },
    rating: { type: Number, required: true },
    description: { type: String, required: true },
});
exports.default = (0, mongoose_1.model)('Rating', RatingSchema);
