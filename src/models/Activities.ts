import {Schema, model} from 'mongoose';

const ActivitySchema = new Schema({
    name: {type:String, unique:true},
    description: {type:String, unique:false},
    organizer: {type: Schema.Types.ObjectId, required:true, ref: 'User'},
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    language: {type: String, unique:false},
    location: [{type: String, unique:false}],
    ratings: [{type: Schema.Types.ObjectId, cref: 'Rating'}],
    messages: [{type: Schema.Types.ObjectId, cref: 'Message'}]

})

export default model('Activity', ActivitySchema);