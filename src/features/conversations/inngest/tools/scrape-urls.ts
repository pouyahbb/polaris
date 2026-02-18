import { firecrawl } from "@/lib/firecrawl";
import { createTool } from "@inngest/agent-kit";
import z from "zod";

const paramsSchema = z.object({
    urls : z.array(z.url("Invalid URL format")).min(1 , "At least one URL is required")
})

export const createScrapeUrlsTool = () => {
    return createTool({
        name : "scrapeUrls",
        description: "Scrape content from URLs to get documentation or refrence material. Use this when the user provides URLs or refrences external documentations. Return markdown content from scraped pages.",
        parameters: z.object({
            urls : z.array(z.string()).describe("Array of URLs to scrape for content")
        }),
        handler : async(params ) => {
            const parsed = paramsSchema.safeParse(params)
            if(!parsed.success){
                return `Error : ${parsed.error.issues[0].message}`
            }
            const {urls} = parsed.data
            try{
                const results : {url : string; content : string}[] = []
                for (const url of urls){
                    try{
                        const result = await firecrawl.scrape(url , {
                            formats : ["markdown"]
                        })
                        if(result.markdown){
                            results.push({url , content : result.markdown})   
                        }
                    }catch(err){
                        console.error(err)
                        results.push({
                            url ,
                            content : `Error scraping URL: ${url} - ${err instanceof Error ? err.message : "Unknown Error"}`
                        })
                    }
                }
                if(results.length === 0){
                    return "No valid content was found in the URLs provided"
                }
                return JSON.stringify(results)
            }catch(err){
                console.error(err)
                return `Error scraping URLs : ${err instanceof Error ? err.message : "Unknown Error"} `
            }
        }
    })
}