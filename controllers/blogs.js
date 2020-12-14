const blogsRouter = require("express").Router();
const { response } = require("express");
const Blog = require("../models/blog");
const logger = require("../utils/logger");

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await Blog.find({});
    res.json(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const results = await Blog.find({_id: id});
    if(results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send({ error: "No blog found"})
    }
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

blogsRouter.delete("/:id", async (req, res, next) => {
  console.log("deleting...")
  try {
    const id = req.params.id
    const result = await Blog.findByIdAndDelete(id)
    res.status(204).end()
  } catch(e) {
    next(e)
  }
})

module.exports = blogsRouter;
