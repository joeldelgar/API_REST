import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoose from 'mongoose';
import compression from 'compression';
import cors from 'cors';

import indexRoutes from './routes/indexRoutes';
import usersRoutes from './routes/usersRoutes';
import ratingRoutes from './routes/ratingRoutes';
import activityRoutes from './routes/activityRoutes';
import messageRoutes from './routes/messageRoutes';
import authRoutes from './routes/authRoutes';

class Server {
    public app: express.Application;

    //The contructor will be the first code that is executed when an instance of the class is declared.
    constructor(){
        this.app = express();
        this.config();
        this.routes();
    }

    config() {
        //MongoDB settings
        const MONGO_URI = process.env.DB_URL || "mongodb://localhost:27017/tsapi";
        mongoose.connect(MONGO_URI)
        .then(db => console.log("DB is connected"));

        //Settings
        this.app.set('port', process.env.PORT || 3000); 

        //Middlewares
        this.app.use(morgan('dev')); //Allows to see by console the petitions that eventually arrive.
        this.app.use(express.json()); //So that Express parses JSON as the body structure, as it doens't by default.
        this.app.use(express.urlencoded({extended:false}));
        this.app.use(helmet()); //Offers automatically security in front of some cracking attacks.
        this.app.use(compression()); //Allows to send the data back in a compressed format.
        this.app.use(cors()); //It automatically configures and leads with CORS issues and configurations.
    }

    routes() {
        this.app.use(indexRoutes);
        this.app.use('/api/users', usersRoutes);
        this.app.use('/api/ratings',ratingRoutes);
        this.app.use('/api/activities', activityRoutes);
        this.app.use('/api/messages', messageRoutes);
        this.app.use('/api/auth', authRoutes)
    }

    start() {
        this.app.listen(this.app.get('port'), () =>{
            console.log ('Server listening on port', this.app.get('port'));
        });
    }
}

const server = new Server(); 
server.start();