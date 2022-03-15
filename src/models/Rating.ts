import {Schema, model} from 'mongoose';

const RatingSchema = new Schema({
    rater: {type: Schema.Types.ObjectId, ref:'User'},
    rated: {type: Schema.Types.ObjectId, ref:'User'},
    rating: {type: Number, required: true },
    description: {type: String, required: true},    
})

export default model('Rating', RatingSchema);