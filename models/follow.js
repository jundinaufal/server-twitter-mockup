const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/mongoConnection");
const { GraphQLError } = require("graphql");

const followCollection = () => {
    return getDatabase().collection("follow");
};

const findAllFollower = async () => {
    const followers = await followCollection().find().toArray();

    return followers;
};

const createFollow = async (payload) => {
    if (!payload.followerId) {  // contoh validation`
      throw new GraphQLError('followerId is required', {
        extensions: {
          http: { status: 400 }
        }
      })
    }
    const newFollow = await followCollection().insertOne(payload);
  
    const dataFollow = await followCollection().findOne({
      _id: new ObjectId(newFollow.insertedId),
    });
  
    return dataFollow;
  };

module.exports = {
    findAllFollower,
    createFollow
    // addFollowToUser
}