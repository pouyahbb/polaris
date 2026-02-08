import { useState } from "react";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { useCreateFile, useCreateFolder, useDeleteFile, useFolderContents, useRenameFile } from "../../hooks/use-files";
import { TreeItemWrapper } from "./tree-item-wrapper";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingRow } from "./loading-row";
import { getItemPadding } from "./constants";
import CreateInput from "./create-input";
import RenameInput from "./rename-input";

export const Tree = ({level , item , projectId} : {level?: number , item : Doc<"files"> , projectId : Id<"projects">}) => {
    const [isOpen , setIsOpen] = useState(false)
    const [isRemaining , setIsRemaining] = useState(false)
    const [creating , setCreating] = useState<"file" | "folder" | null>(null)
    const renameFile = useRenameFile()
    const deleteFile = useDeleteFile()
    const createFile = useCreateFile()
    const createFolder = useCreateFolder()
    
    const folderContents = useFolderContents({
        projectId ,
        parentId : item._id,
        enabled : item.type === "folder" && isOpen
    })

    const startCreating = (type : "file" | "folder") => {
        setIsOpen(true)
        setCreating(type)
    }

    const handleCreate = (name : string) => {
        setCreating(null)
        if(creating === "file"){
            createFile({projectId , parentId : item._id , name , content : ""})
        }else{
            createFolder({projectId , parentId : item._id , name})
        }
    }

    const handleRename = (newName : string) => {
        setIsRemaining(false)
        if(newName === item.name) return
        renameFile({id : item._id , newName})
    }

    if(item.type === "file") {
        const fileName = item.name
        if(isRemaining){
            return (
                <RenameInput 
                    type="file"
                    level={level ?? 0}
                    defaultValue={fileName}
                    isOpen={isOpen}
                    onSubmit={handleRename}
                    onCancel={() => setIsRemaining(false)}
                />
            )
        }
        return (
            <TreeItemWrapper 
                item={item} 
                level={level ?? 0}
                isActive={false}
                onClick={() => {}}
                onDoubleClick={() => {}}
                onRename={() => {setIsRemaining(true)}}
                onDelete={() => {
                    deleteFile({id : item._id})
                }}
                onCreateFile={() => {}}
                onCreateFolder={() => {}}
            >
                <FileIcon fileName={fileName} autoAssign className="size-4" />
                <span className="text-sm truncate"> {fileName}</span>
            </TreeItemWrapper>
        )
    }
    const folderName = item.name
    const folderRender = (
        <>
            <div className="flex items-center gap-0.5">
                <ChevronRightIcon className={cn("size-4 shrink-0 text-muted-foreground" , isOpen && "rotate-90")} />
                <FolderIcon folderName={folderName} className="size-4 " />
            </div>
            <span className="text-sm truncate"> {folderName}</span>
        </>
    )
    if(creating){
        return (
            <>
                <button style={{paddingLeft : getItemPadding(level ?? 0 , false)}} onClick={() =>setIsOpen(prev => !prev)} className="group flex items-center gap-1 h-[22px] hover:bg-accent/30 w-full">
                    {folderRender}
                </button>
                {isOpen && (
                    <>
                        {folderContents === undefined && <LoadingRow level={(level ?? 0) + 1} />}
                        <CreateInput type={creating} level={(level ?? 0) + 1} onSubmit={handleCreate} onCancel={() => setCreating(null)} />
                        {folderContents?.map(subItem => (
                            <Tree 
                                key={subItem._id}
                                level={(level ?? 0) + 1}
                                item={subItem}
                                projectId={projectId}
                            />
                        ))}
                    </>
                )}
            </>
        )
    }

    if(isRemaining){
        return (
            <>
                <RenameInput 
                    type="folder"
                    level={level ?? 0}
                    defaultValue={folderName}
                    isOpen={isOpen}
                    onSubmit={handleRename}
                    onCancel={() => setIsRemaining(false)}
                />
                {isOpen && (
                    <>
                        {folderContents === undefined && <LoadingRow level={(level ?? 0) + 1} />}
                        <CreateInput type={creating} level={(level ?? 0) + 1} onSubmit={handleCreate} onCancel={() => setCreating(null)} />
                        {folderContents?.map(subItem => (
                            <Tree 
                                key={subItem._id}
                                level={(level ?? 0) + 1}
                                item={subItem}
                                projectId={projectId}
                            />
                        ))}
                    </>
                )}
            </>
        )
    }
    return (
        <>
            <TreeItemWrapper 
                item={item}
                level={level ?? 0}
                onClick={() => setIsOpen(prev => !prev)}
                onRename={() => {setIsRemaining(true)}}
                onDelete={() => {
                    deleteFile({id : item._id})
                }}
                onCreateFile={() => {startCreating("file")}}
                onCreateFolder={() => {startCreating("folder")}}
            >
                {folderRender}
            </TreeItemWrapper>
            {isOpen && (
                <>
                    {folderContents === undefined && <LoadingRow level={(level ?? 0) + 1} />}
                    { folderContents !== undefined && folderContents?.map(subItem => (
                        <Tree key={subItem._id} level={(level ?? 0) + 1} item={subItem} projectId={projectId} />
                    ))}
                </>
            )}
        </>
    )
}