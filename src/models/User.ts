import {Schema, model} from 'mongoose';
import Rating from './Rating';
import Activities from './Activities';

const UserSchema = new Schema({
    name: {type: String, required:true},
    surname: {type: String, required:true},
    username: {type: String, required:true, unique: true},
    password: {type: String, required:true},
    phone: {type: String},
    mail: {type: String},
    languages: [{type: String}],
    location: [{type: String}],
    photo: {type: String},
    personalRatings: [{type: Schema.Types.ObjectId, ref:'Rating'}],
    activitiesOrganized: [{type: Schema.Types.ObjectId, ref:'Activities'}],
    activities: [{type: Schema.Types.ObjectId, ref:'Activities'}],
    messages:[{type: Schema.Types.ObjectId, ref:'Message'}],
    creationDate: {type: Date, default:Date.now},
});


export default model('User', UserSchema);