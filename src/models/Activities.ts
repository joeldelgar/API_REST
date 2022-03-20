import {Schema, model} from 'mongoose';

const ActivitySchema = new Schema({
    name: {type:String, unique:true},
    description: {type:String, unique:true},
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    language: {type: String, unique:true},
    location: [{type: String, unique:true}],
    ratings: [{type: Schema.Types.ObjectId,cref: 'Rating'}],
    messages: [{type: Schema.Types.ObjectId,cref: 'Message'}]
})

export default model('Activity', ActivitySchema);