import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

interface CreateFilesToolOptions {
    internalKey : string
    projectId : Id<"projects">
}

const paramsSchema = z.object({
    parentId : z.string(),
    files : z.array(z.object({
        name : z.string().min(1 , "File name cannot be empty"),
        content : z.string()
    })).min(1 , "At least one file is required")
})

export const createCreateFilesTool = ({internalKey , projectId} : CreateFilesToolOptions) => {
    return createTool({
        name : "createFiles",
        description : "Create multiple files at once in the same folder. Use this to batch create files that share the same parent folder. More efficient than creating files one by one.",
        parameters : z.object({
            parentId : z.string().describe("The ID of parent folder. use empty string for root level. Must be a valid folder ID from listFiles"),
            files : z.array(z.object({
                name : z.string().describe("The file name including extension."),
                content : z.string().describe("The file content")
            })).describe("Array of files to create")
        }),
        handler : async(params) => {
            const parsed = paramsSchema.safeParse(params)
            if(!parsed.success){
                return `Error : ${parsed.error.issues[0].message}`
            }
            const {parentId , files} = parsed.data

            try{
                let resolvedParentId : Id<"files"> | undefined
                if(parentId && parentId !== ""){
                    try{
                        resolvedParentId = parentId as Id<"files">
                        const parentFolder = await convex.query(api.system.getFileById , {
                            internalKey,
                            fileId : resolvedParentId
                        })
                        if(!parentFolder){
                            return `Error : Parent folder with ID "${parentId}" not found. Use listFiles to get valid folder IDs`
                        }
                        if(parentFolder.type !== "folder"){
                            return `Error : "${parentId}" is a file, not a folder. You can only create files in folders. Use a folder ID as parentId`
                        }
                    }catch(err){
                        console.error(err)
                        return `Error : Invalid parentID "${parentId}". use listFiles to get valid folder IDs , Or use empty string for root level. `
                    }
                }

                const result = await convex.mutation(api.system.createFiles , {
                    internalKey,
                    projectId,
                    parentId : resolvedParentId ?? undefined,
                    files
                })
                const created = result.filter(r => !r.error)
                const failed = result.filter(r => r.error)
                let response = `Created ${created.length} files successfully`
                if(created.length > 0){
                    response += `\nCreated files : ${created.map(f => `${f.name} (ID: ${f.fileId})`).join(", ")}`
                }
                if(failed.length > 0){
                    response += `\nFailed to create files : ${failed.map(f => `${f.name} (Error: ${f.error})`).join(", ")}`
                }
                return response
            }catch(err){
                console.error(err)
                return `Error creating files : ${err instanceof Error ? err.message : "Unknown Error"} `
            }
        }
    })
}
