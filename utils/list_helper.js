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
    let blogsGroupedByAuthor = []
    for(let [author, hisBlogs] of Object.entries(_.groupBy(blogs, 'author'))) {
        blogsGroupedByAuthor.push({
            author,
            blogs: hisBlogs.length
        })
    }        

    logger.info(blogsGroupedByAuthor)

    return blogsGroupedByAuthor.sort((a, b) => {
        return b.blogs - a.blogs
    })[0]
}

const mostLikes = (blogs) => {
    let blogsGroupedByAuthor = []
    for(let [author, hisBlogs] of Object.entries(_.groupBy(blogs, 'author'))) {
        blogsGroupedByAuthor.push({
            author,
            likes: hisBlogs.map(b => b.likes).reduce((sum, item) => sum + item)
        })
    }     

    logger.info(blogsGroupedByAuthor)

    return blogsGroupedByAuthor.sort((a, b) => {
        return b.likes - a.likes
    })[0]
}
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}
