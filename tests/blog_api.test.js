const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const Blog = require("../models/blog");
const app = require("../app");
const logger = require("../utils/logger");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  logger.info("cleared");

  const savedBlogs = helper.initialBlogs
    .map((b) => new Blog(b))
    .map((bb) => bb.save());
  await Promise.all(savedBlogs);
  logger.info("saved all blogs");
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("identifier of blog posts is named id", async () => {
  const blogs = await api.get("/api/blogs");

  blogs.body.forEach((b) => {
    expect(b.id).toBeDefined();
  });
});

test("POST request creates a new blog post", async () => {
  const newBlog = {
    author: "Khun Zohn",
    title: "Eating patterns",
    url: "https://reactpatterns.com/",
    likes: 7
  }

  const response = await api.post('/api/blogs')
    .send(newBlog)

  const totalBlogs = await api.get('/api/blogs')

  expect(totalBlogs.body).toHaveLength(helper.initialBlogs.length + 1)

  const authors = totalBlogs.body.map(b => b.author)
  expect(authors).toContain('Khun Zohn')
});

test('likes value is 0 when likes property is missing in request', async () => {
  const newBlog = {
    author: "Khun Zohn",
    title: "Eating patterns",
    url: "https://reactpatterns.com/"
  }

  const response = await api.post('/api/blogs')
    .send(newBlog)

  const postedBlog = response.body
  
  expect(postedBlog.likes).toBeDefined()
  expect(postedBlog.likes).toBe(0)
})

test('return 400 if title and url are missing from the request', async () => {
  const newBlog = {
    author: "Khun Zohn",
    likes: 13
  }

  await api.post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

afterAll(() => {
  mongoose.connection.close();
});
