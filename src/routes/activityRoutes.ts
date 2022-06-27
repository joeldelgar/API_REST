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
    const allActivities = await Activity.find().populate({ path: 'users', match: { active: true }, select: 'name -_id' }).populate('ratings', 'rating description -_id').populate('organizer').populate('messages')
    const activitiesOrganizerActive = allActivities.filter(activity => activity.organizer.active === true)

    if (activitiesOrganizerActive.length === 0) {
      res.status(404).send('There are no activities created!')
    } else {
      res.status(200).send(activitiesOrganizerActive)
    }
  }

  public async getActivityByName (req: Request, res: Response) : Promise<void> {
    const activityFound = await Activity.findOne({ name: req.params.nameActivity }).populate({ path: 'users', match: { active: true }, select: 'name -_id' }).populate('ratings', 'rating description -_id').populate('organizer').populate('messages')
    if (activityFound == null || activityFound.organizer.active === false) {
      res.status(404).send("The activity doesn't exist!")
    } else {
      res.status(200).send(activityFound)
    }
  }

  public async addActivity (req: Request, res: Response) : Promise<void> {
    console.log(req.body)
    const { name, description, organizer, language } = req.body
    const location = { type: 'Point', coordinates: [req.body.location.coordinates[0], req.body.location.coordinates[1]], index: '2dsphere' }
    const newActivity = new Activity({ name, description, language, organizer, location })
    await newActivity.save()

    const user = await User.findById(organizer)
    console.log(user)
    if (user.active === false) {
      res.status(404).send('Organizer not found')
    } else {
      user.activitiesOrganized.push(newActivity)
      // const userToUpdate = await User.findOneAndUpdate({ name: user.name }, { activitiesOrganized: user.activitiesOrganized })
    }

    res.status(200).send('Activity added!')
  }

  public async getActivitiesByDistance (req: Request, res: Response) : Promise<void> {
    const userFound = await User.findById(req.params.userID).populate('personalRatings', 'rating -_id description').populate('messages').populate('roles', '-_id name').populate('peopleliked', 'name').populate('peopledisliked', 'name')
    const distance = req.params.maxDistance
    const activities = await Activity.find({
      location:
        {
          $near:
            {
              $geometry: { type: 'Point', coordinates: [userFound.location.coordinates[0], userFound.location.coordinates[1]] },
              $minDistance: 0,
              $maxDistance: distance
            }
        }
    }).populate({ path: 'users', match: { active: true }, select: 'name -_id' }).populate('ratings', 'rating description -_id').populate('organizer').populate('messages')
    if (activities.length === 0) {
      res.status(404).send('No activities near you')
    } else {
      const difActivities = activities.filter(activity => activity.organizer.name !== userFound.name)
      console.log(difActivities)
      const activitiesOrganizerActive = difActivities.filter(activity => activity.organizer.active === true)
      if (activitiesOrganizerActive.length === 0) {
        res.status(404).send('No activities near you')
      } else {
        res.status(200).send(difActivities)
      }
    }
  }

  public async updateActivity (req: Request, res: Response) : Promise<void> {
    console.log(req.body)
    const activityToUpdate = await Activity.findOneAndUpdate({ name: req.params.nameActivity }, req.body)
    if (activityToUpdate == null) {
      res.status(404).send("The activity doesn't exist!")
    } else {
      const organizer = await User.findById(activityToUpdate.organizer)
      if (organizer.active === false) {
        res.status(404).send('Organizer not found')
      } else {
        res.status(200).send('Updated!')
      }
    }
  }

  public async addUserActivity (req: Request, res: Response) : Promise <void> {
    const { idActivity, idUser } = req.body

    const user = await User.findById(idUser)
    console.log(user)
    if (user == null || user.active === false) {
      res.status(404).send('User not found')
    } else {
      user.activities.push(idActivity)
      // const userToUpdate = await User.findOneAndUpdate({ _id: idUser }, { activities: user.activities })

      const activity = await Activity.findById(idActivity)
      activity.users.push(idUser)
      // const activityToUpdate = await Activity.findOneAndUpdate({ _id: idActivity }, { users: activity.users })

      res.status(200).send('User Added to Activity')
    }
  }

  public async deleteActivity (req: Request, res: Response) : Promise<void> {
    const activityToDelete = await Activity.findOneAndDelete({ name: req.params.nameActivity }, req.body)
    if (activityToDelete == null) {
      res.status(404).send("The activity doesn't exist!")
    } else {
      res.status(200).send('Deleted!')
    }
  }

  routes () {
    this.router.get('/', this.getActivities)
    this.router.get('/:nameActivity', this.getActivityByName)
    this.router.post('/', [verifyToken, isOwner], this.addActivity)
    this.router.put('/:nameActivity', [verifyToken, isOwner], this.updateActivity)
    this.router.post('/adduseractivity', [verifyToken, isOwner], this.addUserActivity)
    this.router.delete('/:nameActivity', [verifyToken, isOwner], this.deleteActivity)
    this.router.get('/:userID/distance/:maxDistance', this.getActivitiesByDistance)
  }
}

const activityroutes = new ActivityRoutes()

export default activityroutes.router
