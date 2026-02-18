import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

interface CreateFolderToolOptions {
    internalKey : string
    projectId : Id<"projects">
}

const paramsSchema = z.object({
    name : z.string().min(1 , "Folder name cannot be empty"),
    parentId : z.string(),
})

export const createCreateFolderTool = ({internalKey , projectId} : CreateFolderToolOptions) => {
    return createTool({
        name : "createFolder",
        description : "Create a new folder in the project",
        parameters : z.object({
            name : z.string().describe("The name of the folder to create"),
            parentId : z.string().describe("The ID(not name!) of parent folder from listFiles. or empty string for root level.")
        }),
        handler : async(params) => {
            const parsed = paramsSchema.safeParse(params)
            if(!parsed.success){
                return `Error : ${parsed.error.issues[0].message}`
            }
            const {name , parentId} = parsed.data

            try{
                if(parentId){
                    try{
                        const parentFolder = await convex.query(api.system.getFileById , {
                            internalKey,
                            fileId : parentId as Id<"files">
                        })
                        if(!parentFolder){
                            return `Error : Parent folder with ID "${parentId}" not found. Use listFiles to get valid folder IDs`
                        }
                        if(parentFolder.type !== "folder"){
                            return `Error : "${parentId}" is a file, not a folder. You can only create folders inside folders. Use a folder ID as parentId`
                        }
                    }catch(err){
                        console.error(err)
                        return `Error : Invalid parentID "${parentId}". use listFiles to get valid folder IDs , Or use empty string for root level. `
                    }
                }

                const newFolderId = await convex.mutation(api.system.createdFolder , {
                    internalKey,
                    projectId,
                    name,
                    parentId : parentId ? (parentId as Id<"files">) : undefined
                })
                return `Successfully created folder "${name}" (ID: ${newFolderId})`
            }catch(err){
                console.error(err)
                return `Error creating folder : ${err instanceof Error ? err.message : "Unknown Error"} `
            }
        }
    })
}
