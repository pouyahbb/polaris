import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

interface ReadFilesToolOptions {
    internalKey : string
}

const paramsSchema = z.object({
    fileIds : z.array(z.string().min(1 , "File ID cannot be empty")).min(1 , "Provide at least one file ID"),
})

export const createReadFilesTool = ({internalKey} : ReadFilesToolOptions) => {
    return createTool({
        name : "readFiles",
        description : "Read the content of files from the project , Returns files contents.",
        parameters : z.object({
            fileIds : z.array(z.string()).describe("Array of file IDs to read"),
        }),
        handler : async(params) => {
            const parsed = paramsSchema.safeParse(params)
            if(!parsed.success){
                return `Error : ${parsed.error.issues[0].message}`
            }
            const {fileIds} = parsed.data

            try{
                const results : {id : string; name : string; content:string}[] = []
                const errors : string[] = []
                
                for(const fileId of fileIds){
                    try{
                        const file = await convex.query(api.system.getFileById , {
                            internalKey , 
                            fileId : fileId as Id<"files">
                        })
                        
                        if(!file){
                            errors.push(`File with ID "${fileId}" not found`)
                            continue
                        }
                        
                        if(file.type === "folder"){
                            errors.push(`"${file.name}" (ID: ${fileId}) is a folder, not a file. You can only read file contents`)
                            continue
                        }
                        
                        if(file.content === null || file.content === undefined || file.content === ""){
                            errors.push(`File "${file.name}" (ID: ${fileId}) exists but has no content`)
                            continue
                        }
                        
                        results.push({
                            id : file._id ,
                            name : file.name,
                            content : file.content
                        })
                    }catch(fileError){
                        console.error(`Error reading file ${fileId}:`, fileError)
                        errors.push(`Error reading file "${fileId}": ${fileError instanceof Error ? fileError.message : "Unknown Error"}`)
                    }
                }
                
                if(results.length === 0){
                    const errorMessage = errors.length > 0 
                        ? `Failed to read files:\n${errors.join("\n")}\n\nUse listFiles to get valid file IDs.`
                        : `No files found with provided IDs. Use listFiles to get valid fileIDs`
                    return errorMessage
                }
                
                const response = JSON.stringify(results)
                if(errors.length > 0){
                    return `${response}\n\nNote: Some files had errors:\n${errors.join("\n")}`
                }
                
                return response
            }catch(err){
                console.error("Error in readFiles tool:", err)
                return `Error reading files : ${err instanceof Error ? err.message : "Unknown Error"} `
            }
        }
    })
}
