const supertest = require('supertest')
const helper = require('../tests/test_helper')
const logger = require('../utils/logger')
const app = require('../app')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  logger.info("Users cleared")

  const hashedPassword = await bcrypt.hash('sekret', 10)
  const user = new User({
    username: 'root',
    name: 'root user',
    passwordHash: hashedPassword,
  })

  await user.save()
  logger.info('root user saved')
})

describe('getting user', () => {
    test('succeeds with correct users count in db', async () => {
        const usersInDB = await helper.usersInDB()

        const usersFromApi = await api.get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(usersFromApi.body).toHaveLength(usersInDB.length)    
    })
})

describe("creating a new user", () => {

  test('succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      username: 'Khin Ko ko',
      password: 'hhehh',
      name: 'ko ko',
    }

    const createdUser = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDB()
    const usernames = usersAtEnd.map((u) => u.username)

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    expect(usernames).toContain('Khin Ko ko')
    expect(createdUser.body.username).toBe('Khin Ko ko')
  })

  test('fails if username is not unique', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      username: 'root',
      password: 'hhehh',
      name: 'ko ko',
    }

    const createUserResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      

    const usersAtEnd = await helper.usersInDB()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
    expect(createUserResponse.body.error).toContain("`username` to be unique")
  })

  test('fails if username is not in', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      password: 'hhehh',
      name: 'ko ko',
    }

    const createUserResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      

    const usersAtEnd = await helper.usersInDB()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
    expect(createUserResponse.body.error).toContain("`username` is required")
  })

  test('fails if password is not in', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      username: "khin khin",
      name: 'ko ko',
    }

    const createUserResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      

    const usersAtEnd = await helper.usersInDB()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
    expect(createUserResponse.body.error).toContain("`password` is required")
  })

  test('fails if username is less than 3 characters long', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      username: "kh",
      password: "1212kjk",
      name: 'ko ko',
    }

    const createUserResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      

    const usersAtEnd = await helper.usersInDB()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('fails if password is less than 3 characters long', async () => {
    const usersAtStart = await helper.usersInDB()

    const newUser = {
      username: "khin",
      password: "12",
      name: 'ko ko',
    }

    const createUserResponse = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      

    const usersAtEnd = await helper.usersInDB()

    expect(usersAtEnd).toHaveLength(usersAtStart.length)
    expect(createUserResponse.body.error).toContain("`password` is too short")
  })
})

afterAll(() => {
  mongoose.connection.close()
})
