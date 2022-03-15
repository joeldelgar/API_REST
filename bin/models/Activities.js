"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ActivitySchema = new mongoose_1.Schema({
    name: { type: String, unique: true },
    description: { type: String, unique: true },
    users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    language: { type: String, unique: true },
    location: [{ type: String, unique: true }],
    ratings: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Rating' }]
});
exports.default = (0, mongoose_1.model)('Activity', ActivitySchema);
