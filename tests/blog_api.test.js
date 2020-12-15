const mongoose = require("mongoose")
const supertest = require("supertest")
const helper = require("./test_helper")
const Blog = require("../models/blog")
const app = require("../app")
const logger = require("../utils/logger")

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  logger.info("cleared")

  const savedBlogs = helper.initialBlogs
    .map((b) => new Blog(b))
    .map((bb) => bb.save())
  await Promise.all(savedBlogs)
  logger.info("saved all blogs")
})

describe("when there is initially some blogs saved", () => {
  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/)
  })

  test("all blogs are returned", async () => {
    const response = await api.get("/api/blogs")

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test("a specific blog is within returned blogs", async () => {
    const response = await api.get("/api/blogs")

    const authors = response.body.map((b) => b.author)

    expect(authors).toContain("Michael Chan")
  })

  test("identifier of blog posts are named id", async () => {
    const blogs = await api.get("/api/blogs")

    blogs.body.forEach((b) => {
      expect(b.id).toBeDefined()
    })
  })
})

describe("viewing a specific blog", () => {
  test("succeeds with a valid id", async () => {
    const blogsAtStart = await helper.blogsInDB()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/)

    const processedBlog = JSON.parse(JSON.stringify(blogToView))

    expect(resultBlog.body).toEqual(processedBlog)
  })

  test("fails with 404 if blog does not exist", async () => {
    const validNonExistingId = await helper.nonExistingId()
    await api.get(`/api/blogs/${validNonExistingId}`).expect(404)
  })

  test("fails with 400 if id is invalid", async () => {
    const invalidId = "12hjj"
    await api.get(`/api/blogs/${invalidId}`).expect(400)
  })
})

describe("adding a new blog", () => {
  test("succeeds with valid data", async () => {
    const newBlog = {
      author: "Khun Zohn",
      title: "Eating patterns",
      url: "https://reactpatterns.com/",
      likes: 7,
    }

    const response = await api.post("/api/blogs").send(newBlog)

    const totalBlogs = await helper.blogsInDB()

    expect(totalBlogs).toHaveLength(helper.initialBlogs.length + 1)

    const authors = totalBlogs.map((b) => b.author)
    expect(authors).toContain("Khun Zohn")
  })

  test("returns 400 if title and url are missing from the request", async () => {
    const newBlog = {
      author: "Khun Zohn",
      likes: 13,
    }

    await api.post("/api/blogs").send(newBlog).expect(400)

    const response = await api.get("/api/blogs")
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test("defaults likes value to 0 when likes property is missing in request", async () => {
    const newBlog = {
      author: "Khun Zohn",
      title: "Eating patterns",
      url: "https://reactpatterns.com/",
    }

    const response = await api.post("/api/blogs").send(newBlog)

    const postedBlog = response.body

    expect(postedBlog.likes).toBeDefined()
    expect(postedBlog.likes).toBe(0)
  })
})

describe("deletion of a blog", () => {
  test("succeeds with 204 if id is valid", async () => {
    const deletingNote = await helper.blogsInDB()

    const result = await api
      .delete(`/api/blogs/${deletingNote[0].id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDB()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
  })
})

describe("updating a blog", () => {
  test("succeeds with valid data", async () => {
    const updatingBlog = {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    }
  })
})

afterAll(() => {
  mongoose.connection.close()
})
