import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Doc, Id } from "../../../../convex/_generated/dataModel"

export const useConversation = (id: Id<"conversations"> | null) => {
    return useQuery(api.conversations.getById, id ? {id} : "skip" )
}

export const useMessages = (conversationId: Id<"conversations"> | null) => {
    return useQuery(api.conversations.getMessages, conversationId ? {conversationId } : "skip" )
}

export const useConversations = (projectId: Id<"projects">) => {
    return useQuery(api.conversations.getByProject, {projectId } )
}

export const useCreateConversation = () => {
    return useMutation(api.conversations.create).withOptimisticUpdate(
        (localStore, args) => {
            const { projectId, title } = args

            const existing = localStore.getQuery(api.conversations.getByProject, {
                projectId,
            })

            if (existing === undefined) return

            const optimisticConversation: Doc<"conversations"> = {
                // @ts-expect-error: temporary optimistic id
                _id: `optimistic-${Math.random().toString(36).slice(2)}`,
                projectId,
                title,
                updatedAt: Date.now(),
            }

            localStore.setQuery(
                api.conversations.getByProject,
                { projectId },
                [optimisticConversation, ...existing]
            )
        }
    )
}