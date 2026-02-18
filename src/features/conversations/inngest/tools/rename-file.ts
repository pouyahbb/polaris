import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

interface RenameFileToolOptions {
    internalKey : string
}

const paramsSchema = z.object({
    fileId : z.string().min(1 , "File ID cannot be empty"),
    newName : z.string().min(1 , "New name cannot be empty"),
})

export const createRenameFileTool = ({internalKey} : RenameFileToolOptions) => {
    return createTool({
        name : "renameFile",
        description : "Rename a file or folder",
        parameters : z.object({
            fileId : z.string().describe("The ID of the file to update"),
            newName : z.string().describe("The new name for the file or folder")
        }),
        handler : async(params) => {
            const parsed = paramsSchema.safeParse(params)
            if(!parsed.success){
                return `Error : ${parsed.error.issues[0].message}`
            }
            const {fileId , newName} = parsed.data

            try{
                // First check if file exists and is not a folder
                const file = await convex.query(api.system.getFileById , {
                    internalKey , 
                    fileId : fileId as Id<"files">
                })
                if(!file){
                    return `Error : File with ID "${fileId}" not found. Use listFiles to get valid file IDs`
                }

                // Update the file
                await convex.mutation(api.system.renameFile , {
                    internalKey,
                    fileId : fileId as Id<"files">,
                    newName
                })

                return `Successfully renamed file "${file.name}" to "${newName}" (ID: ${fileId})`
            }catch(err){
                console.error(err)
                return `Error renaming file : ${err instanceof Error ? err.message : "Unknown Error"} `
            }
        }
    })
}
