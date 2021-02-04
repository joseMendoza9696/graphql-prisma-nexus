const bcrypt = require('bcrypt');

export const HashPassword = (password: string) => {
    if (password.length < 8) {
        throw new Error('Password must be 8 characters or longer.')
    }

    return bcrypt.hash(password, 10)
}

export const ComparePassword = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword)
}
