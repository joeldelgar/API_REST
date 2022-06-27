/* eslint-disable object-shorthand */
/* eslint-disable quote-props */
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import mongoose from 'mongoose'
import compression from 'compression'
import cors from 'cors'
import Server from 'socket.io'

import indexRoutes from './routes/indexRoutes'
import usersRoutes from './routes/usersRoutes'
import ratingRoutes from './routes/ratingRoutes'
import activityRoutes from './routes/activityRoutes'
import messageRoutes from './routes/messageRoutes'
import authRoutes from './routes/authRoutes'
import Chat from './models/Chat'

class Service {
  public app: express.Application

  // The contructor will be the first code that is executed when an instance of the class is declared.
  constructor () {
    this.app = express()
    this.config()
    this.routes()
  }

  config () {
    // MongoDB settings
    const MONGO_URI = process.env.DB_URL || 'mongodb://localhost:27017/tsapi'
    mongoose.connect(MONGO_URI)
      .then(db => console.log('DB is connected'))

    // Settings
    this.app.set('port', process.env.PORT || 3000)

    // Middlewares
    this.app.use(morgan('dev')) // Allows to see by console the petitions that eventually arrive.
    this.app.use(express.json()) // So that Express parses JSON as the body structure, as it doens't by default.
    this.app.use(express.urlencoded({ extended: false }))
    this.app.use(helmet()) // Offers automatically security in front of some cracking attacks.
    this.app.use(compression()) // Allows to send the data back in a compressed format.
    this.app.use(cors()) // It automatically configures and leads with CORS issues and configurations.
  }

  routes () {
    this.app.use(indexRoutes)
    this.app.use('/api/users', usersRoutes)
    this.app.use('/api/ratings', ratingRoutes)
    this.app.use('/api/activities', activityRoutes)
    this.app.use('/api/messages', messageRoutes)
    this.app.use('/api/auth', authRoutes)
  }

  start () {
    const httpServer = this.app.listen(this.app.get('port'), () => {
      console.log('Server listening on port', this.app.get('port'))
    })

    const io = new Server(httpServer)
    const connectedUsers:any[] = []

    io.on('connection', function (client: any) {
      console.log('Connected...', client.id)

      client.on('chatID', function (data: any) {
        const chatID = data.id

        client.join(chatID)
        connectedUsers.push(chatID)

        client.broadcast.emit('onlineUsers', { 'users': connectedUsers })

        // listens when a user is disconnected from the server
        client.on('disconnect', function () {
          // Remove ConnectedUsers
          const index = connectedUsers.indexOf(chatID)
          if (index > -1) { connectedUsers.splice(index, 1) }

          // Leave From Room
          client.leave(chatID)
          client.broadcast.emit('onlineUsers', { 'users': connectedUsers })
          console.log('Disconnected...', client.id)
        })

        // listens for new broadcast messages coming in
        client.on('message', function name (data: any) {
          console.log(data)
          io.emit('message', data)
        })

        client.on('send_message', function (message: any) {
          const receiverChatID = message.receiverChatID
          const senderChatID = message.senderChatID
          const content = message.content

          saveChat(content, senderChatID, receiverChatID, true)

          client.in(receiverChatID).emit('receive_message', {
            'content': content,
            'senderChatID': senderChatID,
            'receiverChatID': receiverChatID
          })
          saveChat(content, receiverChatID, senderChatID, false)
        })
      })

      // listens when there's an error detected and logs the error on the console
      client.on('error', function (err: any) {
        console.log('Error detected', client.id)
        console.log(err)
      })
    })
  }
}

function saveChat (content: any, sender: any, receiver: any, isMy: boolean) {
  const chat = new Chat({
    _id: sender,
    users: [{
      _id: receiver,
      messages: {
        ismy: isMy,
        message: content
      }
    }
    ]
  })

  Chat.findOne({ _id: sender }, (_err: any, doc: any) => {
    if (!doc) {
      chat.save()
    } else {
      const receiverIndex = doc.users.findIndex((element: any) => element._id === receiver)
      if (receiverIndex !== undefined && receiverIndex !== -1) {
        doc.users[receiverIndex].messages.push({ ismy: isMy, message: content })
        doc.save()
      } else {
        doc.users.push({ _id: receiver, messages: { ismy: isMy, message: content } })
        doc.save()
      }
    }
    console.log('saveChat OK, isMy: ' + isMy)
  }).catch((err) => {
    console.log('Error saveChat (isMy: ' + isMy + '): ' + err.chat)
  })
}

const service = new Service()
service.start()
