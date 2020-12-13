const blogsRouter = require("../controllers/blogs");
const listHelper = require("../utils/list_helper");
const blogs = require('./test_helper').blogs

test("dummy returns one", () => {
  const blogs = [];
  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

const listWithOneBlog = [
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url:
      "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
];

describe("total likes", () => {
  test("of empty list is zero", () => {
    const result = listHelper.totalLikes([]);
    expect(result).toBe(0);
  });

  test("when list has only one blog, equals the likes of that", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    expect(result).toBe(5);
  });

  test("of a bigger list is calculated right", () => {
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(36);
  });
});

describe("favorite blog", () => {
  const favBlog = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    likes: 12,
  }

  test("of all the blogs", () => {
      const result = listHelper.favoriteBlog(blogs)
      expect(result).toEqual(favBlog)
  });
});

describe("most blogs", () => {
    const mostBlogs = {
      author: "Robert C. Martin",
      blogs: 3,
    }
  
    test("by an author", () => {
        const result = listHelper.mostBlogs(blogs)
        expect(result).toEqual(mostBlogs)
    });
  });

  describe("most likes", () => {
    const mostLikes = {
      author: "Edsger W. Dijkstra",
      likes: 17,
    }
  
    test("by an author", () => {
        const result = listHelper.mostLikes(blogs)
        expect(result).toEqual(mostLikes)
    });
  });
