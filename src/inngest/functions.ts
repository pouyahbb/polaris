import { generateText } from "ai"
import { inngest } from "./client"

import { createOpenAI } from "@ai-sdk/openai"
import { firecrawl } from "@/lib/firecrawl";

const openai = createOpenAI({apiKey : process.env.OPENAI_API_KEY})

const URL_REGX = /https?:\/\/[^\s]+/g;

export const demoGenerate = inngest.createFunction(
    {id : "demo-generate"},
    {event : "demo/generate"},
    async ({event,step}) => {
        const {prompt} = event.data as {prompt : string}
        const urls = await step.run("extract-urls", async () => {
            return prompt.match(URL_REGX) ?? [] as string[]
        })
        const scrapedContent = await step.run("scrape-urls", async () => {
            const result = await Promise.all(urls.map(async (url) => {
                const result = await firecrawl.scrape(url , 
                    {
                        formats : ["markdown"]
                    }
                )
                return result.markdown ?? null
            }))
            return result.filter(Boolean).join("\n\n")
        })
        const finalPrompt = scrapedContent ? `Context:\n${scrapedContent}\n\nQuestion: ${prompt}` : prompt

        await step.run("generate-text", async () => {
            return await generateText({
                model : openai("gpt-4o-mini-2024-07-18"),
                prompt : finalPrompt
            })
        })
    }
)