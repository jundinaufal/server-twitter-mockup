const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/mongoConnection");

const postCollection = () => {
  return getDatabase().collection("posts");
};

const findAllPosts = async () => {
  const agg = [
    {
      '$lookup': {
        'from': 'users',
        'localField': 'authorId',
        'foreignField': '_id',
        'as': 'author'
      }
    }, {
      '$unwind': {
        'path': '$author',
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$project': {
        'author.password': 0,
        'author._id': 0,
        'author.username': 0,
        'author.email': 0
      }
    }, {
      '$sort': {
        'createdAt': -1
      }
    }
  ]

  const posts = await postCollection().aggregate(agg).toArray();

  return posts;
};

const findPostById = async (id) => {

  const post = await postCollection().findOne({ _id: new ObjectId(id) })

  return post
}

const createPost = async (payload) => {
  if (!payload.authorId) {  // contoh validation`
    throw new GraphQLError('authorId is required', {
      extensions: {
        http: { status: 400 }
      }
    })
  }
  const newPost = await postCollection().insertOne(payload);

  const dataPost = await postCollection().findOne({
    _id: new ObjectId(newPost.insertedId),
  });

  return dataPost;
};

const addCommentToPost = async (postId, content, username) => {
  const updatedPost = await postCollection().updateOne(
    { _id: new ObjectId(postId) },
    {
      $push: {
        comments: {
          content,
          username,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }
  );

  const dataPost = await postCollection().findOne({
    _id: new ObjectId(postId),
  });

  return dataPost;
};

const addLikeToPost = async (postId, username) => {
  const updatedPost = await postCollection().updateOne(
    { _id: new ObjectId(postId) },
    {
      $push: {
        likes: {
          username,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }
  );

  const dataPost = await postCollection().findOne({
    _id: new ObjectId(postId),
  });

  return dataPost;
};

module.exports = {
  findAllPosts,
  findPostById,
  createPost,
  addCommentToPost,
  addLikeToPost
};