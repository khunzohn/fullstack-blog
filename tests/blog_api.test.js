const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const app = require('../app')
const logger = require('../utils/logger')

const api = supertest(app)
const token =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QyIiwiaWQiOiI1ZmQ5MDViMjAxYzE4YzA3NzgxMTU1MGIiLCJpYXQiOjE2MDgwNjUwMjd9.CTMuV4PRfwU1A3-v-7IvcS68RsqySs9rBXC3UZpfHE8'
beforeEach(async () => {
  await Blog.deleteMany({})
  logger.info('cleared')

  const savedBlogs = helper.initialBlogs
    .map((b) => new Blog(b))
    .map((bb) => bb.save())
  await Promise.all(savedBlogs)
  logger.info('saved all blogs')
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const authors = response.body.map((b) => b.author)

    expect(authors).toContain('Michael Chan')
  })

  test('identifier of blog posts are named id', async () => {
    const blogs = await api.get('/api/blogs')

    blogs.body.forEach((b) => {
      expect(b.id).toBeDefined()
    })
  })
})

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDB()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlog = JSON.parse(JSON.stringify(blogToView))

    expect(resultBlog.body).toEqual(processedBlog)
  })

  test('fails with 404 if blog does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId()
    await api.get(`/api/blogs/${validNonExistingId}`).expect(404)
  })

  test('fails with 400 if id is invalid', async () => {
    const invalidId = '12hjj'
    await api.get(`/api/blogs/${invalidId}`).expect(400)
  })
})

describe('adding a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      author: 'Khun Zohn',
      title: 'Eating patterns',
      url: 'https://reactpatterns.com/',
      likes: 7,
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', token)
      .send(newBlog)

    const totalBlogs = await helper.blogsInDB()

    expect(totalBlogs).toHaveLength(helper.initialBlogs.length + 1)

    const authors = totalBlogs.map((b) => b.author)
    expect(authors).toContain('Khun Zohn')
  })

  test('returns 400 if title and url are missing from the request', async () => {
    const newBlog = {
      author: 'Khun Zohn',
      likes: 13,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', token)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('fails with 401 if there\'s no Authrization token', async () => {
    const newBlog = {
      author: 'Khun Zohn',
      title: 'Eating patterns',
      url: 'https://reactpatterns.com/',
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(401)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with 204 if id is valid', async () => {
    const deletingNote = await helper.blogsInDB()

    const result = await api
      .delete(`/api/blogs/${deletingNote[0].id}`)
      .set('Authorization', token)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDB()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
  })
})

describe('updating a blog', () => {
  test('succeeds with valid data', async () => {
    const blogsInDb = await helper.blogsInDB()
    const firstBlog = blogsInDb[0]

    const updatingBlogId = firstBlog.id
    const updatingBlog = {
      title: firstBlog.title,
      author: 'Khin Khin Kyi',
      url: firstBlog.url,
      likes: firstBlog.likes,
    }

    const result = await api
      .put(`/api/blogs/${updatingBlogId}`)
      .send(updatingBlog)
      .expect(200)

    expect(result.body.author).toBe('Khin Khin Kyi')

    const updatedBlogRes = await api.get(`/api/blogs/${updatingBlogId}`)

    expect(updatedBlogRes.body.author).toBe('Khin Khin Kyi')
  })

  test('also succeeds with partial payload', async () => {
    const blogsInDb = await helper.blogsInDB()
    const firstBlog = blogsInDb[0]

    const updatingBlogId = firstBlog.id
    const updatingBlog = {
      author: 'Khin Khin Kyi',
    }

    const result = await api
      .put(`/api/blogs/${updatingBlogId}`)
      .send(updatingBlog)
      .expect(200)

    expect(result.body.author).toBe('Khin Khin Kyi')
    expect(result.body.title).toBe(firstBlog.title)
    expect(result.body.likes).toBe(firstBlog.likes)
    expect(result.body.url).toBe(firstBlog.url)

    const updatedBlogRes = await api.get(`/api/blogs/${updatingBlogId}`)

    expect(updatedBlogRes.body.author).toBe('Khin Khin Kyi')
    expect(updatedBlogRes.body.title).toBe(firstBlog.title)
    expect(updatedBlogRes.body.likes).toBe(firstBlog.likes)
    expect(updatedBlogRes.body.url).toBe(firstBlog.url)
  })

  test('fails with 400 for invalid id', async () => {
    const invalidId = '121'

    const result = await api.put(`/api/blogs/${invalidId}`).send({}).expect(400)
  })

  test('fails with 400 for nonexisting id', async () => {
    const nonExistingId = await helper.nonExistingId()

    const result = await api
      .put(`/api/blogs/${nonExistingId}`)
      .send({})
      .expect(400)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
