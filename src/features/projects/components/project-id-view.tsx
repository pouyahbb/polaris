"use client"
import { cn } from "@/lib/utils"
import { Id } from "../../../../convex/_generated/dataModel"
import { useState } from "react"
import { FaGithub } from "react-icons/fa"

const Tab = ({isActive , label , onClick} : {
    label : string
    isActive : boolean
    onClick : () => void
}) => {
    return (
        <div 
            onClick={onClick} 
            className={cn(
                "flex items-center gap-2 h-full px-3 cursor-pointer border-r transition-colors",
                isActive 
                    ? "bg-background text-foreground border-b-2 border-b-foreground" 
                    : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
            )}>
            <span className="text-sm font-medium">{label}</span>
        </div>
    )
}

export const ProjectIdView = ({projectId} : {projectId : Id<"projects">}) => {
    const [activeTab, setActiveTab] = useState<"preview" | "editor">("editor")

    return (
        <div className="h-full flex flex-col">
            <nav className="h-[35px] flex items-center bg-sidebar border-b">
                <Tab label="Preview" isActive={activeTab === "preview"} onClick={() => {setActiveTab("preview")}} />
                <Tab label="Code" isActive={activeTab === "editor"} onClick={() => {setActiveTab("editor")}} />
                <div className="flex-1 flex justify-end h-full">
                    <div className="flex items-center gap-2 h-full px-3 cursor-pointer text-muted-foreground border-r hover:bg-accent/30">
                        <FaGithub className="size-3.5" />
                        <span className="text-sm"> Export </span>
                    </div>
                </div>
            </nav>
            <div className="flex-1 relative">
                <div className={cn("absolute inset-0", activeTab === "editor" ? "visible" : "invisible")}>
                    <div>
                        Editor
                    </div>
                </div>
                <div className={cn("absolute inset-0", activeTab === "preview" ? "visible" : "invisible")}>
                    <div>
                        Preview
                    </div>
                </div>
            </div>
         
        </div>
    )
}
