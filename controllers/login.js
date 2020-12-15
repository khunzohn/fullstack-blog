const loginRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const config = require('../utils/config')

loginRouter.post('/', async (req, res) => {
  const body = req.body

  console.log('body', body)
  const user = await User.findOne({ username: body.username })

  console.log('user from db', user)
  let passwordIsValid = false
  try {
    passwordIsValid =
      user === null
        ? false
        : await bcrypt.compare(body.password, user.passwordHash)
  } catch (error) {
    console.log('compare error', error)
  }

  console.log('passowrd is valid', passwordIsValid)
  if (!user || !passwordIsValid) {
    return res.status(401).send({ error: 'Unauthorized' })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, config.ACCESS_TOKEN_SECRET)

  res.status(200).send({
    token,
    username: user.username,
    name: user.name,
  })
})

module.exports = loginRouter
