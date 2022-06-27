import { Request, Response, Router } from 'express'
import bcrypt from 'bcryptjs'
import { isOwner, verifyToken } from '../middlewares/authJWT'

import User from '../models/User'

import Role from '../models/Role'

class UserRoutes {
  public router: Router
  constructor () {
    this.router = Router()
    this.routes() // This has to be written here so that the method can actually be configured when called externally.
  }

  public async getUsers (req: Request, res: Response) : Promise<void> { // It returns a void, but internally it's a promise.
    const allUsers = await User.find().populate('personalRatings', 'rating -_id description').populate('messages').populate('roles', '-_id name').populate('peopleliked', 'name').populate('peopledisliked', 'name')
    const activeUsers = allUsers.filter(user => user.active === true)
    if (activeUsers.length === 0) {
      res.status(404).send('There are no users yet!')
    } else {
      res.status(200).send(activeUsers)
    }
  }

  public async getPeopleLikedByID (req: Request, res: Response) : Promise<void> {
    const userFound = await User.findById(req.params.userID).populate('personalRatings', 'rating -_id description').populate('messages').populate('roles', '-_id name').populate('peopleliked', 'name').populate('peopledisliked', 'name')
    const likedUsers : string[] = []
    userFound.peopleliked.forEach(people => likedUsers.push(people.id))
    if (userFound == null || userFound.active === false) {
      res.status(404).send("The user doesn't exist!")
    } else {
      const allUsers = await User.find().populate('personalRatings', 'rating -_id description').populate('messages').populate('roles', '-_id name').populate('peopleliked', 'name').populate('peopledisliked', 'name')
      /* const activeUsers = allUsers.filter(user => (userFound.peopleliked.forEach(people => people.id)) === user.id) */
      const activeUsers = allUsers.filter(user => likedUsers.includes(user.id))

      if (activeUsers.length === 0) {
        res.status(404).send('There are no users yet!')
      } else {
        res.status(200).send(activeUsers)
      }
    }
  }

  public async getUserByName (req: Request, res: Response) : Promise<void> {
    const userFound = await User.findOne({ name: req.params.nameUser }).populate('messages')
    if (userFound == null || userFound.active === false) {
      res.status(404).send("The user doesn't exist!")
    } else {
      res.status(200).send(userFound)
    }
  }

  public async getUserByID (req: Request, res: Response) : Promise<void> {
    const userFound = await User.findById(req.params.userID)
    if (userFound == null || userFound.active === false) {
      res.status(404).send("The user doesn't exist!")
    } else {
      res.status(200).send(userFound)
    }
  }

  public async addUser (req: Request, res: Response) : Promise<void> {
    console.log(req.body)
    const { name, surname, username, password, phone, mail, languages, location, photo, role } = req.body
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(password, salt)
    const newUser = new User({ name, surname, username, password: hashed, phone, mail, languages, location, photo, active: true })
    const roleadded = await Role.findOne({ role })
    newUser.roles = roleadded._id
    await newUser.save()
    res.status(200).send('User added!')
  }

  public async updateUser (req: Request, res: Response) : Promise<void> {
    const salt = await bcrypt.genSalt(10)
    const hashed = await bcrypt.hash(req.body.password, salt)
    const userToUpdate = await User.findOneAndUpdate({ name: req.params.nameUser }, req.body, { password: hashed })
    const userToUpdatePass = await User.findOneAndUpdate({ name: req.params.nameUser }, { password: hashed }) // Temp fix
    if ((userToUpdate && userToUpdatePass) == null) {
      res.status(404).send("The user doesn't exist!")
    } else {
      res.status(200).send('Updated!')
    }
  }

  public async updateUserByID (req: Request, res: Response) : Promise<void> {
    console.log('Trying to find the user by id ' + req.params.userID)
    // const userToUpdate = await User.findOneAndUpdate({ id: req.params.userID }, req.body)
    const userToUpdate = await User.findOneAndUpdate({ _id: req.params.userID }, req.body)
    console.log(userToUpdate)
    console.log('The user has been found')
    // const userToUpdatePass = await User.findOneAndUpdate({ _id: req.params.userID }) // Temp fix
    // if ((userToUpdate && userToUpdatePass) == null) {
    res.status(404).send('The user does not exist!')
    // } else {
    //   res.status(200).send('Updated!')
    // }
  }

  public async deleteUser (req: Request, res: Response) : Promise<void> {
    const userToDelete = await User.findOneAndDelete({ name: req.params.nameUser }, req.body)
    if (userToDelete == null) {
      res.status(404).send("The user doesn't exist!")
    } else {
      res.status(200).send('Deleted!')
    }
  }

  public async disableUser (req: Request, res: Response) : Promise<void> {
    const userToDisable = await User.findOneAndUpdate({ name: req.params.nameUser }, { active: false })
    if (userToDisable == null) {
      res.status(404).send("The user doesn't exist")
    } else {
      res.status(200).send('User disabled')
    }
  }

  public async getUsersByDistance (req: Request, res: Response) : Promise<void> {
    const userFound = await User.findById(req.params.userID)
    console.log(userFound)
    const distance = req.params.maxDistance
    console.log(distance)
    console.log(userFound.location.coordinates[0])
    const usersDistance = await User.find({
      location:
        {
          $near:
            {
              $geometry: { type: 'Point', coordinates: [userFound.location.coordinates[0], userFound.location.coordinates[1]] },
              $minDistance: 0,
              $maxDistance: distance
            }
        }
    })
    if (usersDistance.length === 0) {
      res.status(404).send('No users near you')
    } else {
      res.status(200).send(usersDistance)
    }
  }

  routes () {
    this.router.get('/', this.getUsers)
    this.router.get('/peopleLiked/:userID', this.getPeopleLikedByID)
    this.router.get('/:nameUser', this.getUserByName)
    this.router.get('/byID/:userID', this.getUserByID)
    this.router.post('/', this.addUser)
    this.router.put('/byID/:userID', [verifyToken], this.updateUserByID)
    this.router.put('/:nameUser', [verifyToken, isOwner], this.updateUser)
    this.router.delete('/:nameUser', [verifyToken, isOwner], this.disableUser)
    this.router.delete('/forget/:nameUser', [verifyToken, isOwner], this.deleteUser)
    this.router.get('/:userID/distance/:maxDistance', this.getUsersByDistance)
  }
}
const userRoutes = new UserRoutes()

export default userRoutes.router
