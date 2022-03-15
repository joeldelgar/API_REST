import {Schema, model} from 'mongoose';
import User from '../models/User';

const ActivitySchema = new Schema({
    name: {type:String, unique:true},
    description: {type:String, unique:true},
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    language: {type: String, unique:true},
    location: [{type: String, unique:true}],
    ratings: [{type: Schema.Types.ObjectId,cref: 'Rating'}]
})

export default model('Activity', ActivitySchema);