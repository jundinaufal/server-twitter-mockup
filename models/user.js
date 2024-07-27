const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/mongoConnection");

const userCollection = () => {
  return getDatabase().collection("users");
};

const findAllUsers = async () => {
  const agg = [
    {
      '$project': {
        'password': 0,
      }
    }
  ]

  const users = await userCollection().aggregate(agg).toArray();

  return users;
};

const findUserById = async (id) => {
  const agg = [
    {
      '$project': {
        'password': 0,
      }
    }, {
      '$lookup': {
        'from': 'follow',
        'localField': '_id',
        'foreignField': 'followerId',
        'as': 'follower'
      }
    }, {
      '$lookup': {
        'from': 'follow',
        'localField': '_id',
        'foreignField': 'followingId',
        'as': 'following'
      }
    }, {
      '$lookup': {
        'from': 'users',
        'localField': 'following.followerId',
        'foreignField': '_id',
        'as': 'following'
      }
    }, {
      '$lookup': {
        'from': 'users',
        'localField': 'follower.followingId',
        'foreignField': '_id',
        'as': 'follower'
      }
    }, {
      '$project': {
        'following.password': 0,
        'follower.password': 0
      }
    }, {
      '$match': {
        '_id': new ObjectId('669e681fd66917b30160e472')
      }
    }
  ]
  const user = await userCollection().aggregate(agg).toArray();

  // console.log(user);
  return user[0];
};

const findUserByQuery = async (query) => {
  const user = await userCollection().findOne({
    $or: [
      { username: { $regex: `(?i)${query}(?-i)` } },
      { name: { $regex: `(?i)${query}(?-i)` } },
    ],
  });
  return user;
};

const createUser = async (payload) => {
  const newUser = await userCollection().insertOne(payload);

  const dataUser = await userCollection().findOne({
    _id: new ObjectId(newUser.insertedId),
  },
    {
      projection: {
        password: 0
      }
    });

  return dataUser;
};

const findUserByEmail = async (email) => {
  const user = await userCollection().findOne({ email });
  return user;
};

module.exports = {
  findAllUsers,
  findUserById,
  createUser,
  findUserByEmail,
  findUserByQuery
};
