import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

interface UpdateFileToolOptions {
    internalKey : string
}

const paramsSchema = z.object({
    fileId : z.string().min(1 , "File ID cannot be empty"),
    content : z.string()
})

export const createUpdateFileTool = ({internalKey} : UpdateFileToolOptions) => {
    return createTool({
        name : "updateFile",
        description : "Update the content of an existing file. Use listFiles to get valid file IDs.",
        parameters : z.object({
            fileId : z.string().describe("The ID of the file to update"),
            content : z.string().describe("The new content for the file")
        }),
        handler : async(params) => {
            const parsed = paramsSchema.safeParse(params)
            if(!parsed.success){
                return `Error : ${parsed.error.issues[0].message}`
            }
            const {fileId , content} = parsed.data

            try{
                // First check if file exists and is not a folder
                const file = await convex.query(api.system.getFileById , {
                    internalKey , 
                    fileId : fileId as Id<"files">
                })
                if(!file){
                    return `Error : File with ID "${fileId}" not found. Use listFiles to get valid file IDs`
                }
                if(file.type === "folder"){
                    return `Error : "${fileId}" is a folder, not a file. You can only update file contents`
                }

                // Update the file
                await convex.mutation(api.system.updateFile , {
                    internalKey,
                    fileId : fileId as Id<"files">,
                    content
                })

                return `Successfully updated file "${file.name}" (ID: ${fileId})`
            }catch(err){
                console.error(err)
                return `Error updating file : ${err instanceof Error ? err.message : "Unknown Error"} `
            }
        }
    })
}
