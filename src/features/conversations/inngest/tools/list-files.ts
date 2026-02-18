import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

interface ListFilesToolOptions {
    internalKey : string;
    projectId : Id<"projects">
}

export const createListFilesTool = ({internalKey , projectId} : ListFilesToolOptions) => {
    return createTool({
        name : "listFiles",
        description : "List all files and folders in the project. Return names,IDs , types , and parentId for each item. Items with parentId : null are at root level. Use the parentId to understand the folder structure items with the same parentId are in the same folder ",
        parameters : z.object({}),
        handler : async() => {
            try{
                const files = await convex.query(api.system.getProjectFiles , {
                    internalKey,
                    projectId
                })
                const sorted = files.sort((a , b) => {
                    if(a.type !== b.type){
                        return a.type === "folder" ? -1 : 1
                    }
                    return a.name.localeCompare(b.name)
                })
                const fileList = sorted.map(f => ({
                    id : f._id , 
                    name : f.name,
                    type : f.type,
                    parentId : f.parentId ?? null
                }))
                return JSON.stringify(fileList)
            }catch(err){
                console.error(err)
                return `Error listing files : ${err instanceof Error ? err.message : "Unknown Error"} `
            }
        }
    })
}
