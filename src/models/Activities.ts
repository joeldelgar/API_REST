import { Schema, model } from 'mongoose'

const pointSchema = new Schema({
  type: {
    type: String,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true
  }
})

const ActivitySchema = new Schema({
  name: { type: String, unique: true },
  description: { type: String, unique: false },
  organizer: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  language: { type: String, unique: false },
  location: {
    type: pointSchema,
    index: '2dshpere'
  },
  ratings: [{ type: Schema.Types.ObjectId, cref: 'Rating' }],
  messages: [{ type: Schema.Types.ObjectId, cref: 'Message' }],
  date: { type: Date, unique: false }

})

export default model('Activity', ActivitySchema)
