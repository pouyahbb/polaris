import { convex } from "@/lib/convex-client";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import z from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { inngest } from "@/inngest/client";

const requestSchema = z.object({
    projectId : z.string(),
})

export async function POST(request : Request){
    const {userId} = await auth()
    if(!userId){
        return NextResponse.json({error : "Unauthorized"} , {status : 401})
    }
    const body = await request.json()
    const {projectId} = requestSchema.parse(body)
    const internalKey = process.env.CONVEX_INTERNAL_KEY
    if(!internalKey){
        return NextResponse.json({error : "Internal key not configured"} , {status : 500})
    }
    const processingMessages = await convex.query(api.system.getProcessingMessages , {
        internalKey,
        projectId : projectId as Id<"projects">,
    })
    if(processingMessages.length === 0){
        return NextResponse.json({success  : true, cancelled : false})
    }
    const cancelledIds = await Promise.all(processingMessages.map(async(message) => {
        await inngest.send({
            name : "message/cancel",
            data : {
                messageId : message._id,
            }
        })
        await convex.mutation(api.system.updateMessageStatus , {
            internalKey,
            messageId : message._id,
            status : "cancelled"
        })
        return message._id
    }))
    return NextResponse.json({success  : true, messageIds: cancelledIds})
}