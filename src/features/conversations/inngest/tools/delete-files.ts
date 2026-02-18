import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

interface DeleteFilesToolOptions {
    internalKey : string
}

const paramsSchema = z.object({
    fileIds : z.array(z.string().min(1 , "File ID cannot be empty")).min(1 , "At least one file ID is required")
})

export const createDeleteFilesTool = ({internalKey} : DeleteFilesToolOptions) => {
    return createTool({
        name : "deleteFiles",
        description : "Delete files and folders from the project. If deleting a folder, all contents will be deleted recursively.",
        parameters : z.object({
            fileIds : z.array(z.string()).describe("Array of file or folders IDs to delete") 
        }),
        handler : async(params) => {
            const parsed = paramsSchema.safeParse(params)
            if(!parsed.success){
                return `Error : ${parsed.error.issues[0].message}`
            }
            const {fileIds} = parsed.data
            const filesToDelete : {
                id : string;
                name : string;
                type : string
            }[] = []
            for(const fileId of fileIds){
                const file = await convex.query(api.system.getFileById , {
                    internalKey,
                    fileId : fileId as Id<"files">
                })
                if(!file){
                    return `Error : File with ID "${fileId}" not found. Use listFiles to get valid file IDs`
                }
                filesToDelete.push({
                    id : file._id,
                    name : file.name,
                    type : file.type
                })
            }

            try{

                const results:string[] = []
                for (const file of filesToDelete){
                    await convex.mutation(api.system.deleteFile , {
                        internalKey,
                        fileId : file.id as Id<"files">
                    })
                    results.push(`Successfully deleted ${file.type === "folder" ? "folder" : "file"} "${file.name}" (ID: ${file.id})`)
                }
                return results.join("\n")
            }catch(err){
                console.error(err)
                return `Error deleting files : ${err instanceof Error ? err.message : "Unknown Error"} `
            }
        }
    })
}
