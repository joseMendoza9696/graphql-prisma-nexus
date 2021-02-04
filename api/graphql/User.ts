import { extendType, objectType, stringArg, nonNull, intArg } from "nexus";
import {Post} from "./Post";
import { HashPassword, ComparePassword } from "../utils/hashPassword";
import { GenerateToken } from "../utils/GenerateToken"

export const User = objectType({
    name: 'User',
    definition(t) {
        t.nonNull.int('id')
        t.nonNull.string('name')
        t.nonNull.string('email')
        t.string('password')
        t.nonNull.field('createdAt', {
            type: 'DateTime'
        })
        t.nonNull.field('updatedAt', {
            type: 'DateTime'
        })
        t.list.field('posts', {
            type: Post,
            async resolve(root, _args, ctx) {
                return await ctx.context.db.post.findMany({ where: { user_id: root.id } })
            },
        })
        t.string('token')
    }
})

export const UserQuery = extendType({
    type: 'Query',
    definition(t) {
        t.list.field('users', {
            type: 'User',
            async resolve(_root, _args, ctx) {
                return await ctx.context.db.user.findMany({})
            }
        })
    }
})

export const UserMutation = extendType({
    type: 'Mutation',
    definition(t){
        t.nonNull.field('createUser', {
            type: 'User',
            args: {
                name: nonNull(stringArg()),
                email: nonNull(stringArg()),
                password: nonNull(stringArg())
            },
            async resolve(_root, args, ctx) {
                const newUser = {
                    name: args.name,
                    email: args.email,
                    // hasheamos el password
                    password: await HashPassword(args.password)
                }
                let createdUser = await ctx.context.db.user.create({data: newUser})
                createdUser = {
                    ...createdUser,
                    token: await GenerateToken(createdUser.id)
                }

                return createdUser
            }
        });

        t.nonNull.field('login', {
            type: 'User',
            args: {
                email: nonNull(stringArg()),
                password: nonNull(stringArg())
            },
            async resolve(_root, args,ctx){
                let user = await ctx.context.db.user.findUnique({
                    where: {
                        email: args.email,
                    }
                })

                if(!user) {
                    throw new Error('User not found: email')
                }

                const isMatch = await ComparePassword(args.password, user.password)
                if(!isMatch) {
                    throw new Error('User not found: password')
                }

                user = {
                    ...user,
                    token: await GenerateToken(user.id)
                }

                return user
            }
        })
    }
})

