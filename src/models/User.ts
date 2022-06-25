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

const UserSchema = new Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  mail: { type: String },
  languages: [{ type: String }],
  location: {
    type: pointSchema,
    index: '2dshpere'
  },
  photo: { type: String },
  peopleliked: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  peopledisliked: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  personalRatings: [{ type: Schema.Types.ObjectId, ref: 'Rating' }],
  activitiesOrganized: [{ type: Schema.Types.ObjectId, ref: 'Activities' }],
  activities: [{ type: Schema.Types.ObjectId, ref: 'Activities' }],
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  roles: { type: Schema.Types.ObjectId, ref: 'Role' },
  creationDate: { type: Date, default: Date.now },
  active: { type: Boolean, required: true },
  fromGoogle: { type: Boolean, required: true }
})

export default model('User', UserSchema)
