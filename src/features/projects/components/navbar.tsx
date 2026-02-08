import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import { UserButton } from "@clerk/nextjs";
import { useGetProjectById, useRenameProject } from "../hooks/use-projects";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { CloudCheckIcon, Loader2, LoaderIcon, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

const font = Poppins({
    subsets: ["latin"],
    weight : ["400" , "500" , "600" , "700"]
})


export const Navbar = ({projectId} : {projectId : Id<"projects">}) => {
    const project = useGetProjectById(projectId)
    const renameProject = useRenameProject(projectId)
    const [isRenaming, setIsRenaming] = useState(false)
    const [name, setName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleStartRenaming = () => {
        if(!project || isSubmitting) return
        setName(project.name)
        setIsRenaming(true)
    }

    const handleSubmit = async () => {
        if(isSubmitting) return
        
        const trimmedName = name.trim()
        if(!trimmedName) {
            toast.error("Project name cannot be empty")
            setIsRenaming(false)
            setName(project?.name || "")
            return
        }
        
        if(trimmedName === project?.name) {
            setIsRenaming(false)
            return
        }

        setIsSubmitting(true)
        const toastId = toast.loading("Renaming project...")
        
        try {
            await renameProject({name : trimmedName , projectId})
            toast.success("Project renamed successfully", { id: toastId })
            setIsRenaming(false)
        } catch (error) {
            toast.error("Failed to rename project", { id: toastId })
            setName(project?.name || "")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        if(isSubmitting) return
        setIsRenaming(false)
        setName(project?.name || "")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key.toLowerCase() === "enter"){
            e.preventDefault()
            handleSubmit()
        } else if(e.key.toLowerCase() === "escape"){
            e.preventDefault()
            handleCancel()
        }
    }

    useEffect(() => {
        if(isRenaming && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isRenaming])

    return (
        <nav className="flex justify-between items-center p-2 gap-x-2 bg-sidebar border-b ">
            <div className="flex items-center gap-x-2">
                <Breadcrumb>
                    <BreadcrumbList className="gap-0!">
                        <BreadcrumbItem>
                            <BreadcrumbLink className="flex items-center gap-1.5" asChild>
                                <Button variant="ghost" className="w-fit! p-1.5! h-7!" asChild>
                                    <Link href="/">
                                        <Image src="/logo.svg" alt="Polaris-Logo" width={20} height={20} />
                                        <span className={cn("text-sm font-medium" , font.className)}>Polaris</span>
                                    </Link>
                                </Button>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="ml-0! mr-1!" />
                        <BreadcrumbItem >
                        {isRenaming ? (
                            <div className="flex items-center gap-2 max-w-40">
                                <Input 
                                    ref={inputRef}
                                    type="text" 
                                    value={name}
                                    disabled={isSubmitting}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="text-sm bg-background/50 border border-ring text-foreground outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 font-medium h-7 px-2"
                                />
                                {isSubmitting && (
                                    <Loader2 className="size-4 ml-1 animate-spin text-muted-foreground" />
                                )}
                            </div>
                        ) : (
                            <BreadcrumbPage 
                                onClick={handleStartRenaming} 
                                className="text-sm cursor-pointer hover:text-primary font-medium max-w-40 truncate group/project-name flex items-center gap-1.5 transition-colors"
                                title="Click to rename project"
                            >
                                <span className="truncate">
                                    {project?.name ?? <Skeleton  className="w-32 h-5 rounded-md" /> }
                                </span>
                                {project && (
                                    <Pencil className="size-3.5 ml-1 text-muted-foreground opacity-0 group-hover/project-name:opacity-100 transition-opacity" />
                                )}
                            </BreadcrumbPage>
                        )}
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                {project && (
                    <TooltipProvider>
                        {project.importStatus === "importing" ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <LoaderIcon className="size-4 text-muted-foreground animate-spin" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>Importing...</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <CloudCheckIcon className="size-4 text-muted-foreground" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Saved {project.updatedAt ? formatDistanceToNow(project.updatedAt, { addSuffix: true }) : "unknown"}
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </TooltipProvider>
                )}
            </div>
            <div className="flex items-center gap-2">
                <UserButton  />
            </div>
        </nav>
    )
}