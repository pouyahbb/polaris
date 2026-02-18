import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Doc, Id } from "../../../../convex/_generated/dataModel"

// Helper to check if an ID is an optimistic (temporary) ID
const isOptimisticId = (id: string | null): boolean => {
    return id !== null && typeof id === "string" && id.startsWith("optimistic-")
}

export const useConversation = (id: Id<"conversations"> | null) => {
    // Skip query if ID is optimistic (temporary) - it will be replaced when mutation completes
    return useQuery(api.conversations.getById, id && !isOptimisticId(id) ? {id} : "skip" )
}

export const useMessages = (conversationId: Id<"conversations"> | null) => {
    // Skip query if ID is optimistic (temporary) - it will be replaced when mutation completes
    return useQuery(api.conversations.getMessages, conversationId && !isOptimisticId(conversationId) ? {conversationId } : "skip" )
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