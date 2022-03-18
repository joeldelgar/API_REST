import {Schema, model} from 'mongoose';
import User from '../models/User';

const ActivitySchema = new Schema({
    name: {type:String, unique:true},
    description: {type:String},
    organizer: [{type: Schema.Types.ObjectId, required:true, ref: 'User'}],
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    language: {type: String},
    location: [{type: String}],
    ratings: [{type: Schema.Types.ObjectId, ref: 'Rating'}]
})

export default model('Activity', ActivitySchema);