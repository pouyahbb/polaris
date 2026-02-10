import { Button } from "@/components/ui/button"
import { Id } from "../../../../convex/_generated/dataModel"
import { DEFAULT_CONVERSATION_TITLE } from "../../../../convex/constants"
import { useConversation, useConversations, useCreateConversation, useMessages } from "../hooks/use-conversations"
import { CopyIcon, HistoryIcon, LoaderIcon, PlusIcon } from "lucide-react"
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation"
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputMessage, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from "@/components/ai-elements/prompt-input"
import {useState} from 'react'
import { toast } from "sonner"
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from "@/components/ai-elements/message"
import ky from "ky"

type ConversationSidebarProps = {

    projectId: Id<"projects">
}
const ConversationSidebar = ({ projectId }: ConversationSidebarProps) => {
    const [input , setInput] = useState("")
    const [selectedConversationId , setSelectedConversationId] = useState<Id<"conversations"> | null>(null)
    const createConversation = useCreateConversation()
    const conversations = useConversations(projectId)
    
    const activeConversationId = selectedConversationId ?? conversations?.[0]?._id ?? null
    const activeConversation = useConversation(activeConversationId)
    const conversationMessages = useMessages(activeConversationId)

    const isProcessing = conversationMessages?.some((msg) => msg.status === "processing")

    const handleCreateConversation = async () => {
        try{
            const newConversationId = await createConversation({
                projectId , 
                title : DEFAULT_CONVERSATION_TITLE
            })
            setSelectedConversationId(newConversationId)
            return newConversationId
        }catch(err){
            console.error(err)
            toast.error("Unable to create new conversation")
            return null
        }
    }
    const handleSubmit = async (message : PromptInputMessage) => {
        if(isProcessing && !message.text){
            setInput("")
            return 
        }
        let conversationId = activeConversationId
        if(!conversationId){
            conversationId = await handleCreateConversation()
            if(!conversationId){
                return 
            }
        }
        try{
            await ky.post("/api/messages" , { 
                json : {
                    conversationId,
                    message : message.text
                }
            })
        }catch(err){
            toast.error("Message failed to send")
        }
        setInput("")
    }
    return (
        <div className="flex flex-col h-full  bg-sidebar">
            <div className="h-[35px] flex items-center justify-between border-b">
                <div className="text-sm truncate pl-3">
                    {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE!}
                </div>
                <div className="flex items-center px-1 gap-1">
                    <Button size="icon-xs" variant="highlight">
                        <HistoryIcon className="size-3.5" />
                    </Button>
                    <Button onClick={handleCreateConversation} size="icon-xs" variant="highlight">
                        <PlusIcon className="size-3.5" />
                    </Button>
                </div>
            </div>
            <Conversation className="flex-1">
                <ConversationContent>
                    {conversationMessages?.map((message , index) => (
                        <Message key={message._id} from={message.role} >
                            <MessageContent>
                                {message.status === "processing" ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <LoaderIcon className="size-4 animate-spin" />
                                        <span> Thinking... </span>
                                    </div>
                                ) : (
                                    <MessageResponse>{message.content}</MessageResponse>
                                )}
                            </MessageContent>
                                {message.role === "assistant" && message.status === "completed" && index === (conversationMessages?.length ?? 0) - 1 && (
                                    <MessageActions>
                                        <MessageAction onClick={() => navigator.clipboard.writeText(message.content)} label="Copy">
                                            <CopyIcon className="size-3" />
                                        </MessageAction>
                                    </MessageActions>
                                )}
                        </Message>
                    ))}
                </ConversationContent>
                <ConversationScrollButton />
            </Conversation>
            <div className="p-3">
                <PromptInput className="mt-2" onSubmit={handleSubmit}>
                    <PromptInputBody>
                        <PromptInputTextarea 
                        placeholder="Ask Polaris anything..." 
                        onChange={(e) => {
                            setInput(e.target.value)
                        }}  
                        value={input} 
                        disabled={isProcessing} 
                    />
                    </PromptInputBody>
                    <PromptInputFooter>
                        <PromptInputTools />
                        <PromptInputSubmit
                            disabled={isProcessing ? false : !input}
                            status={isProcessing ? "streaming" : undefined}
                        />
                    </PromptInputFooter>
                </PromptInput>
            </div>
        </div>
    )
}

export default ConversationSidebar