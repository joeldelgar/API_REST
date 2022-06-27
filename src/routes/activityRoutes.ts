import { Request, Response, Router } from 'express'
import { isOwner, verifyToken } from '../middlewares/authJWT'

import Activity from '../models/Activities'
import User from '../models/User'

class ActivityRoutes {
  public router: Router
  constructor () {
    this.router = Router()
    this.routes() // This has to be written here so that the method can actually be configured when called externally.
  }

  public async getActivities (req: Request, res: Response) : Promise<void> { // It returns a void, but internally it's a promise.
    const allActivities = await Activity.find().populate('ratings', 'rating description -_id').populate('organizer', 'username').populate('messages').populate('users', 'username').populate('date')
    // const activitiesOrganizerActive = allActivities.filter(activity => activity.organizer.active === true)
    // console.log(allActivities[1].organizer.name);
    if (allActivities.length === 0) {
      res.status(404).send('There are no activities created!')
    } else {
      res.status(200).send(allActivities)
    }
  }

  public async getActivitiesByDate (req: Request, res: Response) : Promise<void> { // It returns a void, but internally it's a promise.
    const allActivities = await Activity.find({ date: { $lt: Date.now() } }).populate('organizer', 'username').populate('messages').populate('users', 'username').populate('date')
    console.log('data')
    if (allActivities == null) {
      res.status(404).send('There are no past activities.')
    } else {
      res.status(200).send(allActivities)
    }
  }

  public async getActivitiesByOrganizer (req: Request, res: Response) : Promise<void> { // It returns a void, but internally it's a promise.
    const activitiesOrganized = await Activity.find({ organizer: req.params.idOrganizer }).populate('organizer').populate('users', 'username')
    if (activitiesOrganized == null) {
      res.status(404).send("The activity doesn't exist!")
    } else {
      res.status(200).send(activitiesOrganized)
    }
  }

  public async getActivityByName (req: Request, res: Response) : Promise<void> {
    const activityFound = await Activity.findOne({ name: req.params.nameActivity }).populate('users', 'username').populate('ratings', 'rating description -_id').populate('organizer').populate('messages').populate('date')
    if (activityFound == null) {
      // || activityFound.organizer.active === false) {
      res.status(404).send("The activity doesn't exist!")
    } else {
      res.status(200).send(activityFound)
    }
  }

  public async addActivity (req: Request, res: Response) : Promise<void> {
    console.log(req.body)
    const { name, description, organizer, language, location, date } = req.body
    const newActivity = new Activity({ name, description, language, organizer, location, date })

    const allActivities = await Activity.find()
    allActivities.forEach(function (act) {
      if (act.name === newActivity.name) {
        console.log('Activity name taken ' + act.name)
        res.status(400).send('This activity name is already in use.')
      }
    })

    const user = await User.findById(organizer)
    // if (user.active === false) {
    //  res.status(404).send('Organizer not found')
    // } else {
    newActivity.users.push(user)
    newActivity.save()
    user.activitiesOrganized.push(newActivity)
    user.save()
    // }

    res.status(200).send('Activity added!')
  }

  public async updateActivity (req: Request, res: Response) : Promise<void> {
    console.log(req.body)

    const activityToUpdate = await Activity.findByIdAndUpdate(req.params.idActivity, req.body)

    if (activityToUpdate == null) {
      res.status(404).send("The activity doesn't exist!")
    } else {
      // const organizer = await User.findById(activityToUpdate.organizer)
      // if (organizer.active === false) {
      //  res.status(404).send('Organizer not found')
      // } else {
      res.status(200).send('Updated!')
    }
  }

  public async addUserActivity (req: Request, res: Response) : Promise <void> {
    // const { idActivity, idUser } = req.body
    const userJoining = await User.findOne({ _id: req.body.idUser })
    const activity = await Activity.findOne({ _id: req.body.idActivity })

    let joinedOrOrganizer = Boolean(false)

    activity.users.forEach(function (user: any) {
      if (user._id.toString() === userJoining._id.toString()) {
        joinedOrOrganizer = true
      } else if (userJoining._id.toString() === activity.organizer._id.toString()) {
        joinedOrOrganizer = true
      }
    })
    console.log(joinedOrOrganizer)
    if (userJoining === null) {
      // || userJoining.active === false) {
      res.status(404).send('User not found')
    } else if (activity === null) {
      res.status(404).send('Activity not found')
    } else if (joinedOrOrganizer === true) {
      res.status(400).send('Already joined')
    } else {
      userJoining.activities.push(activity)
      activity.users.push(userJoining)
      userJoining.save()
      activity.save()
      res.status(200).send('User Added to Activity')
    }
  }

  public async deleteActivity (req: Request, res: Response) : Promise<void> {
    const activityToDelete = await Activity.findOneAndDelete({ name: req.params.nameActivity }, req.body)
    if (activityToDelete == null) {
      res.status(404).send("The activity doesn't exist!")
    } else {
      const organizer = await User.findOne({ id: req.body.organizer })
      organizer.activitiesOrganized.pull({ id: activityToDelete.id })
      organizer.save()
      activityToDelete.users.forEach(function (user) {
        user.activities.pull({ id: activityToDelete.id })
        user.save()
      })

      res.status(200).send('Deleted!')
    }
  }

  routes () {
    this.router.get('/', this.getActivities)
    this.router.get('/:nameActivity', this.getActivityByName)
    this.router.get('/byOrganizer/:idOrganizer', this.getActivitiesByOrganizer)
    this.router.get('/filter/byDate', this.getActivitiesByDate)
    this.router.post('/', [verifyToken, isOwner], this.addActivity)
    this.router.put('/:idActivity', [verifyToken, isOwner], this.updateActivity)
    this.router.post('/adduseractivity', this.addUserActivity)
    this.router.delete('/:nameActivity', [verifyToken, isOwner], this.deleteActivity)
  }
}

const activityroutes = new ActivityRoutes()

export default activityroutes.router
