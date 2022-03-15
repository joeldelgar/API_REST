"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const indexRoutes_1 = __importDefault(require("./routes/indexRoutes"));
const usersRoutes_1 = __importDefault(require("./routes/usersRoutes"));
const ratingRoutes_1 = __importDefault(require("./routes/ratingRoutes"));
const activityRoutes_1 = __importDefault(require("./routes/activityRoutes"));
class Server {
    //The contructor will be the first code that is executed when an instance of the class is declared.
    constructor() {
        this.app = (0, express_1.default)();
        this.config();
        this.routes();
    }
    config() {
        //MongoDB settings
        const MONGO_URI = 'mongodb://localhost/tsapi';
        mongoose_1.default.connect(MONGO_URI || process.env.MONGODB_URL)
            .then(db => console.log("DB is connected"));
        //Settings
        this.app.set('port', process.env.PORT || 3000);
        //Middlewares
        this.app.use((0, morgan_1.default)('dev')); //Allows to see by console the petitions that eventually arrive.
        this.app.use(express_1.default.json()); //So that Express parses JSON as the body structure, as it doens't by default.
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use((0, helmet_1.default)()); //Offers automatically security in front of some cracking attacks.
        this.app.use((0, compression_1.default)()); //Allows to send the data back in a compressed format.
        this.app.use((0, cors_1.default)()); //It automatically configures and leads with CORS issues and configurations.
    }
    routes() {
        this.app.use(indexRoutes_1.default);
        this.app.use('/api/users', usersRoutes_1.default);
        this.app.use('/api/ratings', ratingRoutes_1.default);
        this.app.use('api/activities', activityRoutes_1.default);
    }
    start() {
        this.app.listen(this.app.get('port'), () => {
            console.log('Server listening on port', this.app.get('port'));
        });
    }
}
const server = new Server();
server.start();
