const jwt = require('jsonwebtoken')

// aqui pasamos el request
// requireAuth es si queremos que necesariamente este autenticado
export const GetUserId = (request: any, requireAuth = true) => {
    const header = request.req ? request.req.headers.authorization : request.connection.context.Authorization

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

