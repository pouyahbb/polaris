import { useEffect, useMemo, useRef } from "react"
import {EditorView , keymap} from '@codemirror/view'
import { oneDark } from "@codemirror/theme-one-dark"
import { customTheme } from "../extentions/theme"
import { getLanguageExtention } from "../extentions/language-extention"
import {indentWithTab} from '@codemirror/commands'
import { minimap } from "../extentions/minimap"
import {indentationMarkers} from "@replit/codemirror-indentation-markers"
import { customSetup } from "../extentions/custom-setup"

interface Props {
  fileName: string
  onChange:(value:string) => void
  initialValue : string
}



const CodeEditor = ({ fileName , onChange , initialValue}: Props) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  const languageExtention = useMemo(
    () => getLanguageExtention(fileName),
    [fileName]
  )


  useEffect(() => {
    if (!editorRef.current) return

    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        customSetup, 
        oneDark, 
        customTheme, 
        languageExtention , 
        keymap.of([indentWithTab]) , 
        minimap() , 
        indentationMarkers() , 
        EditorView.updateListener.of((update) => {
            if(update.docChanged){
                onChange(update.state.doc.toString())
            }
      })],
    })
    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [languageExtention])

  return <div ref={editorRef} className="size-full pl-4 bg-background" />
}

export default CodeEditor