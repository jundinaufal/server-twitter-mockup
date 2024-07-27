const { GraphQLError } = require("graphql");
const { verifyToken } = require("./jwt");
const { findUserById } = require("../models/user");


const authentication = async (req) => {
  // console.log('ini authentication di dalam context')
  const authorization = req.headers.authorization 

  if (!authorization) {
    throw new GraphQLError('Invalid Token', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  const token = authorization.split(' ')[1]

  if (!token) {
    throw new GraphQLError('Invalid Token', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  const decodeToken = verifyToken(token)

  const user = await findUserById(decodeToken.id)

  if (!user) {
    throw new GraphQLError('Invalid User', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  return {
    userId: user._id,
    username: user.username
  }
}

module.exports = authentication