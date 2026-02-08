import { ChevronRightIcon} from "lucide-react"
import { useState } from "react"
import {FileIcon , FolderIcon} from '@react-symbols/icons/utils'
import { getItemPadding } from "./constants"

interface CreateInputProps {
    type : "file" | "folder" | null, 
    level : number , 
    onSubmit : (name : string) => void , 
    onCancel : () => void
}

const CreateInput = ({type , level , onSubmit , onCancel} :CreateInputProps ) => {
    const [value , setValue] = useState("")
    const handleSubmit = () => {
        const trimmedValue  = value.trim()
        if(trimmedValue){
            onSubmit(trimmedValue)
        }else{
            onCancel()
        }
    }

  return (
    <div 
        className="w-full flex items-center gap-1 h-[22px] bg-accent/30"
        style={{paddingLeft : getItemPadding(level , type === "file")}}
    >
        <div className="flex items-center gap-0.5 ">
            {type === "folder" && (
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            )}
            {type === "file" && (
                <FileIcon fileName={value} autoAssign className="size-4"  />
            )}
            {type === "folder" && (
                <FolderIcon folderName={value} className="size-4 shrink-0 text-muted-foreground" />
            )}
        </div>
        <input 
            autoFocus 
            type="text" 
            value={value} 
            onChange={(e) => setValue(e.target.value)}  
            onBlur={handleSubmit}
            onKeyDown={(e) => {
                if(e.key === "Enter"){
                    handleSubmit()
                }
                if(e.key === "Escape"){
                    onCancel()
                }
            }}
            className="flex-1 bg-transparent text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
        />
    </div>
  )
}

export default CreateInput
