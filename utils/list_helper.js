const _ = require('lodash/collection')
const logger  =require('../utils/logger')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.length === 0
    ? 0
    : blogs
        .map(b => b.likes)
        .reduce((sum, item) => sum + item)
}

const favoriteBlog = (blogs) => {
    const blog = blogs.sort((a, b) => b.likes - a.likes)[0]
    return {
        title: blog.title,
        author: blog.author,
        likes: blog.likes
    }
}

const mostBlogs = (blogs) => {
    let blogsGroupByAuthor = []
    for(let [author, hisBlogs] of Object.entries(_.groupBy(blogs, 'author'))) {
        blogsGroupByAuthor.push({
            author,
            blogs: hisBlogs.length
        })
    }        

    logger.info(blogsGroupByAuthor)

    return blogsGroupByAuthor.sort((a, b) => {
        return b.blogs - a.blogs
    })[0]
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs
}
