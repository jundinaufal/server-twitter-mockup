// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.

const { GraphQLError } = require("graphql");
const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

const { findAllUsers, findUserById, createUser, findUserByQuery } = require("../models/user");
// type nya harus singular dan PascalCase
const typeDefs = `#graphql
  type User {
    _id: ID
    name: String
    username: String
    email: String
    password: String
    follower: [User]
    following: [User]
  }

  type ResponseLogin {
    token: String
  }

  input FollowingInput {
    userId: ID
  }
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "users" query returns an array of zero or more Users (defined above).
  # Query ini digunakan untuk MEMBACA DATA
  type Query {
    getUsers: [User]       # endpoint "users" mereturn array of User
    getUserById(id: ID): User
    searchUser(query: String!): User
  }

  # Mutation ini digunakan untuk MENGUBAH / MEMANIPULASI DATA
  type Mutation {
    addUser(name: String, username: String!, email: String!, password: String!): User
    login(username: String!, password: String!): ResponseLogin
  }
`;

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves users from the "users" array above.
// untuk melakukan fetching terhadap Query yang ada di dalam typeDefs
const resolvers = {
  Query: {
    getUsers: async () => {
      const users = await findAllUsers()

      return users
    },
    getUserById: async (_parent, _args, contextValue) => {
      const userLogin = await contextValue.authentication()
      console.log(userLogin, `data userlogin di user by id`);
      // const { id } = args;

      const user = await findUserById(userLogin.userId);
      // console.log(user);
      return user;
    },
    searchUser: async (_parent, args) => {
      const { query } = args;

      const user = await findUserByQuery(query);

      return user;
    },
  },
  Mutation: {
    addUser: async (_parent, args) => {
      // console.log(args, `<<< args`);
      const { name, username, email, password } = args;

      const newUser = await createUser({
        name,
        username,
        email,
        password: hashPassword(password),
      });

      return newUser;
    },
    login: async (_parent, args) => {
      const { username, password } = args;
      console.log(args, "<<<<< args")
      const user = await findUserByQuery(username);

      // console.log(user, `<<< data user`);
      if (!user) {
        throw new GraphQLError('Invalid username/password', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }

      const isValidPassword = comparePassword(password, user.password);

      if (!isValidPassword) {
        throw new GraphQLError('Invalid username/password', {
          extensions: {
            code: 'UNAUTHENTICATED',
            http: { status: 401 },
          },
        });
      }

      const payload = {
        id: user._id,
        email: user.email
      }

      const token = signToken(payload)
      // console.log(user, `data user`);
      return {
        username: user.username,
        token
      };
    },
  },
};

module.exports = {
  userTypeDefs: typeDefs,
  userResolvers: resolvers,
};
