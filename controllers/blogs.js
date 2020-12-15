const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const logger = require('../utils/logger')
const User = require('../models/user')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1})
  res.json(blogs)
})

blogsRouter.get('/:id', async (req, res) => {
  const id = req.params.id
  const results = await Blog.find({ _id: id })
    .populate('user', { name: 1, username: 1})

  if (results.length > 0) {
    res.json(results[0])
  } else {
    res.status(404).send({ error: 'No blog found' })
  }
})

const extractToken = (bearToken) => {
  if (bearToken && bearToken.toLowerCase().startsWith('bearer')) {
    return bearToken.split(' ')[1]
  } else {
    return null
  }
}

blogsRouter.post('/', async (req, res) => {
  const bearToken = req.headers['authorization']
  const token = extractToken(bearToken)

  if (!token) {
    return res.status(401).send({ error: 'Unauthorized' })
  }
  const decodedUser = jwt.verify(token, config.ACCESS_TOKEN_SECRET)

  if (!decodedUser.id) {
    return res.status(401).send({ error: 'Unauthorized' })
  }

  const user = await User.findById(decodedUser.id)
  console.log('user',user)

  const body = req.body
  const blog = new Blog({
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes ? body.likes : 0,
    user: decodedUser.id
  })

  const savedBlogs = await blog.save()
  user.blogs = user.blogs.concat(savedBlogs._id)
  await user.save()

  res.status(201).json(savedBlogs)
})

blogsRouter.delete('/:id', async (req, res) => {
  const id = req.params.id
  const result = await Blog.findByIdAndDelete(id)
  res.status(204).end()
})

blogsRouter.put('/:id', async (req, res) => {
  const id = req.params.id

  const body = req.body

  const updatedBlog = await Blog.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
    context: 'query',
  })

  if (updatedBlog) {
    res.json(updatedBlog)
  } else {
    res.status(400).send({ error: 'Bad request' })
  }
})

module.exports = blogsRouter
