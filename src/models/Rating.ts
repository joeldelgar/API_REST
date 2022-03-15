import {Schema, model} from 'mongoose';

const RatingSchema = new Schema({
    rater: {type: Schema.Types.ObjectId, ref:'User'},
    userRated: {type: Schema.Types.ObjectId, ref:'User'},
    activityRated: {type:Schema.Types.ObjectId, ref:'Activities'},
    rating: {type: Number, required: true },
    description: {type: String, required: true},    
})

export default model('Rating', RatingSchema);