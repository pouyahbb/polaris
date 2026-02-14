import { inngest  } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";
import {CODING_AGENT_SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT} from '../inngest/constants'
import { DEFAULT_CONVERSATION_TITLE } from "../../../../convex/constants";
import {createAgent , createNetwork, openai} from '@inngest/agent-kit'
import { createReadFilesTool } from "./tools/read-files";
import { createListFilesTool } from "./tools/list-files";
import { createUpdateFileTool } from "./tools/update-file";

interface MessageEvent   {
    messageId : Id<"messages">,
    conversationId : Id<"conversations">,
    projectId : Id<"projects">,
    message : string
}

export const processMessage = inngest.createFunction(
    {
        id : "process-message",
        cancelOn: [{
            event : "message/cancel",
            if: "event.data.messageId == async.data.messageId"
        }],
        onFailure : async ({event, step}) => {
            const {messageId} = event.data.event.data as MessageEvent
            const internalKey = process.env.CONVEX_INTERNAL_KEY
            if(internalKey){
                await step.run("update-message-on-failure" , async() => {
                    await convex.mutation(api.system.updateMessageContent , {
                        internalKey,
                        messageId,
                        content : "My apologies, I encountered an error while processing your request. Let me know if you need anything else"
                    })
                })
            }

        }
    },
    {
        event : "message/sent"
    },
    async ({event,step}) => {
        const {messageId, conversationId, projectId, message} = event.data as MessageEvent
        const internalKey = process.env.CONVEX_INTERNAL_KEY
        if(!internalKey){
            throw new NonRetriableError("CONVEX_INTERNAL_KEY is missing or not configured")
        }
        // check if this is needed
        await step.sleep("Waiting-for-ai-processing" , "1s")
        const conversation = await step.run("get-conversation" , async () => {
            return await convex.query(api.system.getConversationById , {
                internalKey ,
                conversationId
            })
        })
        if(!conversation){
            throw new NonRetriableError("Conversation not found")
        }
        const recentMessages = await step.run("get-recent-messages" , async () => {
            return await convex.query(api.system.getRecentMessages , {
                internalKey,
                conversationId,
                projectId,
                limit : 10
            })
        })

        let systemPrompt = CODING_AGENT_SYSTEM_PROMPT
        const contextMessages = recentMessages.filter(msg => msg._id !== messageId && msg.content.trim() !== "")
        if(contextMessages.length > 0){
             const historyText = contextMessages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n")
             systemPrompt= `\n\n## Previous Conversation (for context only - do NOT repeat these responses): \n${historyText}\n## Current Request:\n Respond ONLY to the user's new message below. Do not repeat or refrence your previous response.`
             
        }
        const shouldGenerateTitle = conversation.title === DEFAULT_CONVERSATION_TITLE
        let generatedTitle: string | null = null
        if(shouldGenerateTitle){
            const titleAgent = createAgent({
                name : "title-generator",
                system : TITLE_GENERATOR_SYSTEM_PROMPT,
                model : openai({
                    model : "gpt-4o-mini",
                }),
            })
            const {output} = await step.run("generate-title", async () => {
                return await titleAgent.run(message , {step})
            })
            const textMessage = output.find(m => m.type === "text" && m.role === "assistant")
            if(textMessage?.type === "text"){
                generatedTitle = typeof textMessage.content === "string" ? textMessage.content.trim() : textMessage.content.map(c => c.text).join("").trim()
            }
        }
        
        if(generatedTitle){
            await step.run("update-conversation-title" , async() => {
                await convex.mutation(api.system.updateConversationTitle, { 
                    internalKey , 
                    conversationId , 
                    title: generatedTitle!
                })
            })
        }

        const codingAgent = createAgent({
            name : "polaris",
            description : "An expert AI coding assistant",
            system : systemPrompt,
            model : openai({
                model : "gpt-4o",
                defaultParameters : {temperature : 0.3 , max_completion_tokens : 16000}
            }),
            tools : [
                createListFilesTool({projectId , internalKey}),
                createReadFilesTool({internalKey}),
                createUpdateFileTool({internalKey})
            ]
        })

        const network = createNetwork({
            name : "polaris-network",
            agents : [codingAgent],
            maxIter : 20,
            router : ({network}) => {
                const lastResult = network.state.results.at(-1)
                const hasTextResponse = lastResult?.output.some(m => m.type === "text" && m.role === "assistant")
                const hasToolCalls = lastResult?.output.some(m => m.type === "tool_call")
                if(hasTextResponse && !hasToolCalls) return undefined
                return codingAgent
            }
        })

        const result = await network.run(message)

        const lastResult = result.state.results.at(-1)
        const textMessage = lastResult?.output.find(m => m.type === "text" && m.role === "assistant")
        let assistantResponse = `I processed your request. Let me know if you need anything else!`
        if(textMessage?.type === "text"){
            assistantResponse = typeof textMessage.content === "string" ? textMessage.content : textMessage.content.map(c => c.text).join("")

        }

        await step.run("update-assistant-message", async() => {
            await convex.mutation(api.system.updateMessageContent , {
                internalKey,
                messageId,
                content : assistantResponse
            })
        })
        return {success : true , messageId , conversationId}
    }
)