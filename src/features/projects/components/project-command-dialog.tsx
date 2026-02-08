"use client"

import { useRouter } from "next/navigation"
import { useProjects } from "../hooks/use-projects"
import { Doc } from "../../../../convex/_generated/dataModel"
import { FaGithub } from "react-icons/fa"
import { AlertCircle, GlobeIcon, Loader2Icon } from "lucide-react"
import { CommandDialog,  CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface ProjectCommandDialogProps {
    open : boolean
    onOpenChange : (open : boolean) => void
}


const getProjectIcon = (project : Doc<"projects">) => {
    if(project.importStatus === "completed"){
        return <FaGithub className="size-4 text-muted-foreground" />
    }
    if(project.importStatus === "failed"){
        return <AlertCircle className="size-4 text-muted-foreground" />
    }
    if(project.importStatus === "importing"){
        return <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
    }
    return <GlobeIcon className="size-4 text-muted-foreground" />
}

export const ProjectCommandDialog = ({open , onOpenChange} : ProjectCommandDialogProps) => {
    const router = useRouter()
    const projects = useProjects()
    
    

    const handleSelect = (projectId : string) => {
        router.push(`/projects/${projectId}`)
        onOpenChange(false)
    }    
    return(
        <CommandDialog title="Search Projects" description="Search and navigate to your projects" open={open} onOpenChange={onOpenChange}>
            <CommandInput placeholder="Search projects..."/>
            <CommandList>
                <CommandEmpty>
                    No projects found.
                </CommandEmpty>
                <CommandGroup heading="Projects">
                    {projects?.map(project => (
                        <CommandItem key={project._id} onSelect={() => handleSelect(project._id)} value={`${project.name}-${project._id}`}>
                            {getProjectIcon(project)}
                            <span>{project.name}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}