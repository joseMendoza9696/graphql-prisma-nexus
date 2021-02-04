const jwt = require('jsonwebtoken')

export const GenerateToken = (userId: any) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET)
}


