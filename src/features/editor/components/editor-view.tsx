import { useFile, useUpdateFile } from '@/features/projects/hooks/use-files'
import { Id } from '../../../../convex/_generated/dataModel'
import { useEditor } from '../hooks/use-editor'
import FileBreadcrumbs from './file-breadcrumbs'
import TopNavigation from './top-navigation'
import Image from 'next/image'
import CodeEditor from './code-editor'
import { useRef } from 'react'

const DEBOUNCE_MS = 1500

const getDemoDoc = (fileName: string ): string => {
    const ext = fileName.split(".").pop()?.toLowerCase()
  
    switch (ext) {
      case "js":
      case "jsx":
      case "mjs":
      case "cjs":
        return `import { useState } from "react";
  
  export default function Counter() {
    const [value, setValue] = useState(0);
  
    return (
      <button onClick={() => setValue((v) => v + 1)}>
        Count: {value}
      </button>
    );
  }`
  
      case "ts":
      case "tsx":
        return `type User = {
    id: number;
    name: string;
  };
  
  export const getGreeting = (user: User): string => {
    return \`Hello, \${user.name}!\`;
  };`
  
      case "py":
      case "pyw":
        return `def fibonacci(n: int) -> list[int]:
      seq = [0, 1]
      while len(seq) < n:
          seq.append(seq[-1] + seq[-2])
      return seq
  
  if __name__ == "__main__":
      print(fibonacci(10))`
  
      case "css":
      case "scss":
      case "sass":
        return `:root {
    --primary: #6366f1;
  }
  
  .button {
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    background: var(--primary);
    color: white;
    font-weight: 600;
  }`
  
      case "html":
      case "htm":
        return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>Demo</title>
    </head>
    <body>
      <h1>Hello from Polaris</h1>
      <p>Edit this file to get started.</p>
    </body>
  </html>`
  
      case "json":
        return `{
    "name": "polaris-demo",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "dev": "next dev"
    }
  }`
  
      case "md":
      case "markdown":
      case "mdx":
        return `# Polaris Demo
  
  - Open files from the sidebar
  - Edit content here
  - Changes will appear live in the editor
  
  \`\`\`js
  console.log("Hello from markdown!");
  \`\`\``
  
      default:
        return `// Start typing your code here...`
    }
  }

const EditorView = ({projectId } : {projectId : Id<"projects">}) => {
    const {activeTabId} = useEditor(projectId)
    const activeFile = useFile(activeTabId)
    const updateFile = useUpdateFile()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const demoData = getDemoDoc(activeFile ? activeFile.name : "" )
    const isActiveFileBinary =  activeFile && activeFile.storageId
    const isActiveFileText = activeFile && !activeFile.storageId

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center">
                <TopNavigation projectId={projectId} />
            </div>
            {activeTabId && <FileBreadcrumbs projectId={projectId} />}
            <div className="flex-1 min-h-0 bg-background">
                {!activeTabId && (
                    <div className="size-full flex items-center justify-center flex-col">
                        <Image 
                            src="/logo-alt.svg"
                            alt="Polaris"
                            width={50}
                            height={50}
                            className="opacity-25 mb-4"
                        />
                        <span className="text-sm text-muted-foreground text-center"> Select a file to show contents </span> 
                    </div>
                )}
                {isActiveFileText && (
                    <CodeEditor 
                        key={activeFile._id} 
                        initialValue={activeFile.content ||  demoData} 
                        onChange={(content:string) => {
                            if(timeoutRef.current){
                                clearTimeout(timeoutRef.current)
                            }
                            timeoutRef.current = setTimeout(() => {
                                updateFile({id : activeFile._id , content})
                            } , DEBOUNCE_MS)
                        }} 
                        fileName={activeFile.name} 
                    />
                )}
                {isActiveFileBinary && (
                    <p> Impelement binary preview  </p>
                )}
            </div>
        </div>
  )
}

export default EditorView