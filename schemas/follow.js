const { ObjectId } = require("mongodb");
const { addFollowToUser, findAllFollower, createFollow } = require("../models/follow");

const typeDefs = `#graphql
  type Follow {
    _id: ID
    followingId: ID
    followerId: ID
    createdAt: String
    updatedAt: String
  }

  input FollowingInput {
    followingId: ID
  }
  
  # Query ini digunakan untuk MEMBACA DATA
  type Query {
    getFollowing: [Follow]       # endpoint "follower" mereturn array of User
  }

  # Mutation ini digunakan untuk MENGUBAH / MEMANIPULASI DATA
  type Mutation {
    followings(input: FollowingInput): Follow
  }
`;

const resolvers = {
    Query: {
        getFollowing: async () => {
            const following = await findAllFollower()

            return following
        },
    },
    Mutation: {
        followings: async (_parent, args, contextValue) => {
            const userLogin = await contextValue.authentication()
            // console.log(userLogin, `data user login di follow`);
            const { followingId } = args.input
            // console.log(args, `data hardcode input user id`);

            const newFollowing = await createFollow({
                followingId: new ObjectId(followingId),
                followerId: new ObjectId(userLogin.userId),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            // console.log(newFollowing, `data following`);
            return newFollowing
        },
    },
};

module.exports = {
    followTypeDefs: typeDefs,
    followResolvers: resolvers,
};