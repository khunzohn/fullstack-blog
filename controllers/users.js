const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.post('/', async (req, res) => {
    const body = req.body

    const hashedPassword = await bcrypt.hash(body.password, 10)

    const newUser = new User({
        username: body.username,
        name: body.name,
        passwordHash: hashedPassword,
        blogs: []
    })  

    const createdUser = await newUser.save()
    res.status(201).send(createdUser)
})

usersRouter.get('/', async (req, res) => {
    const result = await User.find({})
    res.send(result)
})

module.exports = usersRouter

