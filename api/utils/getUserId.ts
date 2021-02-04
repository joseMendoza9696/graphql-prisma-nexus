const jwt = require('jsonwebtoken')

export const getUserId = (request: any, requireAuth = true) => {
    const header = request.request ? request.request.headers.authorization : request.connection.context.Authorization

    if (header) {
        const token = header.replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return decoded.userId
    }

    if (requireAuth) {
        throw new Error('Authentication required')
    }

    return null
}

