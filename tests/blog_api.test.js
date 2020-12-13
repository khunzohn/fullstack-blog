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

  const totalBlogs = await helper.blogsInDB  

  expect(totalBlogs).toHaveLength(helper.initialBlogs.length + 1)

  const authors = totalBlogs.map(b => b.author)
  expect(authors).toContain('Khun Zohn')
});

afterAll(() => {
  mongoose.connection.close();
});
