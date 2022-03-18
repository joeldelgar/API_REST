import {Schema, model} from 'mongoose';

const MessageSchema = new Schema({
    message: {type: String, required: true},
    sendingDate: {type: Date, default:Date.now},
    sender: {type: Schema.Types.ObjectId, ref:'User',  required: true},
    receiver: {type: Schema.Types.ObjectId, ref:'User'},
    activity: {type: Schema.Types.ObjectId, ref:'Activity'},   
})

export default model('Message', MessageSchema);