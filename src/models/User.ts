import {Schema, model} from 'mongoose';
import Rating from './Rating';
import Activity from './Activities';

const UserSchema = new Schema({
    name: {type: String, required:true},
    surname: {type: String, required:true},
    username: {type: String, required:true},
    password: {type: String, required:true},
    phone: {type: String},
    mail: {type: String},
    languages: [{type: String}],
    location: [{type: String}],
    photo: {type: String},
    personalRatings: [{type: Schema.Types.ObjectId, ref:'Rating'}],
    activityRatings: [{type: Schema.Types.ObjectId, ref:'Rating'}],
    activities: [{type: Schema.Types.ObjectId, ref:'Activities'}],
    creationDate: {type: Date, default:Date.now},
});


export default model('User', UserSchema);