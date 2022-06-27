import { Schema, model } from 'mongoose'

const contentSchema = new Schema({
  ismy: { type: Boolean },
  message: { type: String }
}, { timestamps: true })

const receiverSchema = new Schema({
  _id: { type: String },
  messages: [contentSchema]
})

const messageSchema = new Schema({
  _id: { type: String },
  users: [receiverSchema]
})

export default model('Chat', messageSchema)
