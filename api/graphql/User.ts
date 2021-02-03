import { extendType, objectType, stringArg, nonNull, intArg } from "nexus";
import {Post, PostQuery} from "./Post";

export const User = objectType({
    name: 'User',
    definition(t) {
        t.int('id')
        t.string('name')
        t.string('email')
        t.string('password')
        t.list.field('posts', {
            type: Post,
            resolve(root, _args, ctx) {
                return ctx.db.post.findMany({ where: { user_id: root.id } })
            },
        })
    }
})

export const UserQuery = extendType({
    type: 'Query',
    definition(t) {
        t.list.field('users', {
            type: 'User',
            resolve(_root, _args, ctx){
                return ctx.db.user.findMany({})
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
            resolve(_root, args, ctx){
                const newUser = {
                    name: args.name,
                    email: args.email,
                    password: args.password
                }

                return ctx.db.user.create({ data: newUser })
            }
        })
    }
})

