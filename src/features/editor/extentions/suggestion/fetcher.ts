import ky from 'ky'
import { toast } from 'sonner'
import { z } from 'zod'

const suggestionRequestSchema = z.object({
    fileName : z.string(),
    code : z.string(),
    currentLine : z.string(),
    previousLines : z.string().optional(),
    textBeforeCursor : z.string(),
    textAfterCursor : z.string(),
    nextLines : z.string().optional(),
    lineNumber : z.number(),
})
const suggestionResponseSchema = z.object({
    suggestion : z.string(),
})

type SuggestionRequest = z.infer<typeof suggestionRequestSchema>
type SuggestionResponse = z.infer<typeof suggestionResponseSchema>

export const fetcher = async (payload : SuggestionRequest , signal : AbortSignal) : Promise<string | null> => {
    try{
        const validatePayload = suggestionRequestSchema.parse(payload)
        const response = await ky.post("/api/suggestion" , {
            json : validatePayload,
            signal,
            timeout : 10_000,
            retry: 0
        }).json<SuggestionResponse>()
        const validatedResponse = suggestionResponseSchema.parse(response)
        return validatedResponse.suggestion || null
    }catch(err){
        // AbortError is expected when user types quickly - don't log or show it
        if(err instanceof Error && err.name === "AbortError"){
            return null
        }
        // Only log and show toast for unexpected errors
        console.error("Failed to fetch AI suggestion:", err)
        toast.error("Failed to fetch AI completion")
        return null
    }
}