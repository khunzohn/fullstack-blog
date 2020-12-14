const blogsRouter = require("express").Router();
const { response } = require("express");
const Blog = require("../models/blog");

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await Blog.find({});
    res.json(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.post("/", async (req, res, next) => {
  try {
    const body = req.body;
    const blog = new Blog({
      author: body.author,
      title: body.title,
      url: body.url,
      likes: body.likes ? body.likes : 0,
    });
    const result = await blog.save();
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = blogsRouter;
