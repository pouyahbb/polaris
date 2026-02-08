import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    projects : defineTable({
        name : v.string(),
        ownerId : v.string(),
        importStatus : v.optional(
            v.union(
                v.literal("importing"), 
                v.literal("completed"), 
                v.literal("failed")
            )
        ), 
        exportStatus : v.optional(
            v.union(
                v.literal("importing"), 
                v.literal("completed"), 
                v.literal("failed"),
                v.literal("cancelld")
            )
        ),
        exportRepoUrl : v.optional(v.string()),
        updatedAt : v.number()
    }).index("by_owner", ["ownerId"]),
})