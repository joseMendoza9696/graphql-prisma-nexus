import { extendType, objectType, stringArg, nonNull, intArg } from "nexus";
import { User } from './User'
import {GetUserId} from "../utils/getUserId";

// aqui creamos nuestro modelo
export const Post = objectType({
    name: 'Post',
    definition(t) {
        t.nonNull.int('id')
        t.string('title')
        t.string('body')
        t.boolean('published')
        t.nonNull.field('createdAt', {
            type: 'DateTime'
        })
        t.nonNull.field('updatedAt', {
            type: 'DateTime'
        })
        t.field('user_id', {
            type: User,
            resolve(root, _args, ctx) {
                // @ts-ignore
                return ctx.context.db.user.findUnique({ where: { id: root.user_id } })
            }
        })
    },
})

// creamos nuestro resolver
export const PostQuery = extendType({
    // tipo de resolver
    type: 'Query',
    definition(t) {
        // le decimos que no puede ser una lista nula
        t.list.field('drafts', {
            type: 'Post',
            async resolve(_root, _args, ctx) {
                // retornamos los posts que sean published:false
                return await ctx.context.db.post.findMany({ where: { published: false } })
            },
        })

        t.list.field('posts', {
            type: 'Post',
            async resolve(_root, _args, ctx) {
                return await ctx.context.db.post.findMany({ where: { published: true } })
            },
        })
    },
})

export const PostMutation = extendType({
    type: 'Mutation',
    definition(t) {
        t.nonNull.field('createDraft', {
            type: 'Post',
            // definimos los argumentos del mutation
            args: {
                // especificaciones de los argumentos
                title: nonNull(stringArg()),
                body: nonNull(stringArg()),
            },
            async resolve(_root, args,ctx ){
                // verificamos la autenticacion
                // sacamos el id de la cabecera
                const userId = await GetUserId(ctx.request)

                // creamos el objeto para meter a la DB
                const draft = {
                    title: args.title,
                    body: args.body,
                    published: false,
                    user_id: userId
                }

                // guardamos en la db (entrara prisma)
                return await ctx.context.db.post.create({ data: draft })
            }
        })

        t.field('publish', {
            type: 'Post',
            args: {
                draftId: nonNull(intArg()),
            },
            async resolve(_root, args, ctx){

                return await ctx.context.db.post.update({
                    where: {
                        id: args.draftId
                    },
                    data: {
                        published: true
                    }
                })
            }
        })
    }
})
