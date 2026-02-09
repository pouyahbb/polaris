import ky from 'ky'
import { toast } from 'sonner'
import { z } from 'zod'

const quickEditRequestSchema = z.object({
    selectedCode : z.string(),
    fullCode : z.string(),
    instruction : z.string(),
})
const quickEditResponseSchema = z.object({
    editedCode : z.string(),
})

type QuickEditRequest = z.infer<typeof quickEditRequestSchema>
type QuickEditResponse = z.infer<typeof quickEditResponseSchema>

export const fetcher = async (payload : QuickEditRequest , signal : AbortSignal) : Promise<string | null> => {
    try{
        const validatePayload = quickEditRequestSchema.parse(payload)
        const response = await ky.post("/api/quick-edit" , {
            json : validatePayload,
            signal,
            timeout : 30_000,
            retry: 0
        }).json<QuickEditResponse>()
        const validatedResponse = quickEditResponseSchema.parse(response)
        return validatedResponse.editedCode || null
    }catch(err){
        // AbortError is expected when user types quickly - don't log or show it
        if(err instanceof Error && err.name === "AbortError"){
            return null
        }
        // Only log and show toast for unexpected errors
        console.error("Failed to fetch AI quick edit:", err)
        toast.error("Failed to fetch AI quick edit")
        return null
    }
}