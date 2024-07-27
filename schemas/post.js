const { ObjectId } = require("mongodb");
const { findAllPosts, createPost, addCommentToPost, addLikeToPost, findPostById } = require("../models/post");
const redis = require("../config/redis");

const typeDefs = `#graphql
  type Post {
    _id: ID
    content: String
    tags: [String]     #embedded document
    imgUrl: String
    authorId: ID
    comments: [Comment]
    likes: [Like]
    createdAt: String
    updatedAt: String
  }

  type Comment {
    content: String
    username: String
    createdAt: String
    updatedAt: String
  }

  type Like {
    username: String
    createdAt: String
    updatedAt: String
  }

  input CreatePostInput {
    content: String!
    tags: [String]     # embedded document
    imgUrl: String
  }

  input CommentInput {
    postId: ID
    content: String!
  }

  input LikeInput {
    postId: ID
  }
  # Query ini digunakan untuk MEMBACA DATA
  type Query {
    getPosts: [Post]       # endpoint "posts" mereturn array of Post
    getPostById(id: ID): Post
  }

  # Mutation ini digunakan untuk MENGUBAH / MEMANIPULASI DATA
  type Mutation {
    addPost(input: CreatePostInput): Post
    addComment(input: CommentInput): Post
    addLike(input: LikeInput): Post
  }
`;

const resolvers = {
  Query: {
    getPosts: async () => {

      const postCache = await redis.get(process.env.DATA_POST_KEY);

      console.log(postCache, "<<< postCache");

      if (postCache) {
        return JSON.parse(postCache);
      }

      const posts = await findAllPosts()

      await redis.set(process.env.DATA_POST_KEY, JSON.stringify(posts));

      return posts
    },
    getPostById: async (_parent, args) => {
      console.log(args, `data args post by id`);
      const { id } = args;

      const post = await findPostById(id);
      console.log(post, `data post dari Id`);

      return post;
    }
  },
  Mutation: {
    addPost: async (_parent, args, contextValue) => {
      const userLogin = await contextValue.authentication()

      // console.log(userLogin, `user login data`);

      const { content, imgUrl, tags } = args.input;

      const newPost = await createPost({
        content,
        imgUrl,
        tags,
        comments: [],
        likes: [],
        authorId: new ObjectId(userLogin.userId),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      redis.del(process.env.DATA_POST_KEY)

      return newPost
    },
    addComment: async (_parent, args, contextValue) => {
      const userLogin = await contextValue.authentication()
      const { postId, content } = args.input

      const newComment = await addCommentToPost(postId, content, userLogin.username)

      redis.del(process.env.DATA_POST_KEY)

      return newComment
    },
    addLike: async (_parent, args, contextValue) => {
      const userLogin = await contextValue.authentication()
      const { postId } = args.input

      const newLike = await addLikeToPost(postId, userLogin.username)

      redis.del(process.env.DATA_POST_KEY)

      return newLike
    },
  }
};

module.exports = {
  postTypeDefs: typeDefs,
  postResolvers: resolvers,
};
