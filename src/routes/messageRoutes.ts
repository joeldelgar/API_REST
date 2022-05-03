import {Request, Response, Router} from 'express';
import { isOwner, verifyToken } from '../middlewares/authJWT';

import Message from '../models/Message';
import User from '../models/User';
import Activity from '../models/Activities';

class MessageRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getMessages(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allMessages = await Message.find().populate('sender', 'username').populate('receiver', 'username').populate('activity', 'name');
        if (allMessages.length == 0){
            res.status(404).send("There are no messages yet!")
        }
        else{
            res.status(200).send(allMessages);
        }
    }

    public async getMessagesByReceiver(req: Request, res: Response) : Promise<void> {
                
        const messageFound = await Message.find({receiver: req.params.Id}).populate('sender', 'username').populate('receiver', 'username');
        if(messageFound == null){
            res.status(404).send("The message doesn't exist!");
        }
        else{
            res.status(200).send(messageFound);
        }
    }

    public async getMessagesBySender(req: Request, res: Response) : Promise<void> {
        
        const messageFound = await Message.find({sender: req.params.Id}).populate('sender', 'username').populate('receiver', 'username').populate('activity', 'name');
        
        if(messageFound == null){
            res.status(404).send("The message doesn't exist!");
        }
        else{
            res.status(200).send(messageFound);
        }
    }

    public async getMessagesByActivity(req: Request, res: Response) : Promise<void> {
        
        const messageFound = await Message.find({activity: req.params.Id}).populate('sender', 'username').populate('activity','name');
        
        if(messageFound == null){
            res.status(404).send("The message doesn't exist!");
        }
        else{
            res.status(200).send(messageFound);
        }
    }

    public async addMessageUser(req: Request, res: Response) : Promise<void> {

        console.log(req.body);

        const newSender = await User.findById(req.body.sender).exec();
        const newReceiver = await User.findById(req.body.receiver).exec();

        if (newSender == null) {
            res.status(404).send('Could not find sender!');
            return;
        }
        if (newReceiver == null){
            res.status(404).send('Could not find receiver!');
            return;
        }
        if (req.body.sender == req.body.receiver) {
            res.status(400).send('Could not have same sender and receiver!');
            return;
        }
    
        const {message, sender, receiver, activity} = req.body;
        const newMessage = new Message({message, sender, receiver, activity});
        const savedMessage = await newMessage.save();
    
        newSender.messages.push(newMessage._id);
        const senderUpdate = await User.findOneAndUpdate({ _id : newSender }, { messages: newSender.messages});
        
        newReceiver.messages.push(newMessage._id);
        const receiverUpdate = await User.findOneAndUpdate({ _id : newReceiver }, { messages: newReceiver.messages});

        res.status(200).send('Message added!');    
    }

    public async addMessageUserByName(req: Request, res: Response) : Promise<void> {

        const newSender = await User.findOne({name: req.body.sender});
        const newReceiver = await User.findOne({name: req.body.receiver});
        const message = req.body.message;
        const activity = null;

        if (newSender == null) {
            res.status(404).send('Could not find sender!');
            return;
        }
        if (newReceiver == null){
            res.status(404).send('Could not find receiver!');
            return;
        }
        if (req.body.sender == req.body.receiver) {
            res.status(400).send('Could not have same sender and receiver!');
            return;
        }

        const newMessage = new Message({message, sender: newSender._id, receiver: newReceiver._id, activity});

        const savedMessage = await newMessage.save();

        newSender.messages.push(newMessage._id);

        const senderUpdate = await User.findOneAndUpdate({ name : req.body.sender }, { messages: newSender.messages});

        newReceiver.messages.push(newMessage._id);

        const receiverUpdate = await User.findOneAndUpdate({ name : req.body.receiver }, { messages: newReceiver.messages});

        res.status(200).send('Message added!');   
    }

    public async addMessageActivity(req: Request, res: Response) : Promise<void> {
        
        console.log(req.body);
        const newSender = await User.findById(req.body.sender).exec();
        const newActivity = await Activity.findById(req.body.activity).exec();

        if (newSender == null) {
            res.status(404).send('Could not find sender!');
            return;
        }
        if (newActivity == null){
            res.status(404).send('Could not find activity!');
            return;
        }
    
        const {message, sender, activity} = req.body;
        const newMessage = new Message({message, sender, activity});
        const savedMessage = await newMessage.save();
    
        newSender.messages.push(newMessage._id);
        const senderUpdate = await User.findOneAndUpdate({ _id : newSender }, { messages: newSender.messages});
        
        newActivity.messages.push(newMessage._id);
        const messageUpdate = await Activity.findOneAndUpdate({ _id : newActivity }, { messages: newActivity.messages});

        res.status(200).send('Message added!');    
    }

    public async addMessageActivityByName(req: Request, res: Response) : Promise<void> {
        
        const newSender = await User.findOne({name: req.body.sender});
        const newActivity = await Activity.findOne({name: req.body.activity});
        const message = req.body.message;
        const receiver = null;

        if (newSender == null) {
            res.status(404).send('Could not find sender!');
            return;
        }
        if (newActivity == null){
            res.status(404).send('Could not find activity!');
            return;
        }
        if (req.body.sender == req.body.activity) {
            res.status(400).send('Could not have same sender and activity!');
            return;
        }

        const newMessage = new Message({message, sender: newSender._id, receiver, activity: newActivity._id});

        const savedMessage = await newMessage.save();

        newSender.messages.push(newMessage._id);

        const senderUpdate = await User.findOneAndUpdate({ name : req.body.sender }, { messages: newSender.messages});

        newActivity.messages.push(newMessage._id);

        const receiverUpdate = await User.findOneAndUpdate({ name : req.body.activity }, { messages: newActivity.messages});

        res.status(200).send('Message added!');    
    }

    public async deleteMessage(req: Request, res: Response) : Promise<void> {
        const messageToDelete = await Message.findByIdAndRemove(req.params.messageId);
        
        //També es pot eliminar per usuari -> canviar les rutes a userID
        //const messageToDelete = await Message.findOneAndRemove({receiver: req.params.userId});

        if (messageToDelete == null){
            res.status(404).send("This message doesn't exist!")
        }
        else{
            res.status(200).send('Deleted!');
        }
    } 

    routes() {
        this.router.get('/', this.getMessages);
        this.router.get('/sender/:Id', this.getMessagesBySender);        
        this.router.get('/receiver/:Id', this.getMessagesByReceiver);
        this.router.get('/activity/:Id', this.getMessagesByActivity);
        this.router.post('/user', this.addMessageUser);
        this.router.post('/userName', this.addMessageUserByName);
        this.router.post('/activity', this.addMessageActivity);
        this.router.post('/activityName', this.addMessageActivityByName);
        this.router.delete('/:messageId', [verifyToken, isOwner], this.deleteMessage);
    }
}

const messageRoutes = new MessageRoutes();

export default messageRoutes.router;