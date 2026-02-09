import {Decoration ,DecorationSet , EditorView  , ViewPlugin , ViewUpdate , WidgetType ,keymap} from '@codemirror/view'
import {StateEffect , StateField} from '@codemirror/state'
import { insertTab } from "@codemirror/commands"
import { fetcher } from './fetcher'

const setSuggestionEffect = StateEffect.define<string | null>()
const suggestionState = StateField.define<string | null>({
    create() {
        return null
    },
    update(value , transaction){
        for(const effect of transaction.effects){
            if(effect.is(setSuggestionEffect)){
                return effect.value
            }
        }
        return value
    }
})

class SuggestionWidget extends WidgetType{
    constructor(readonly text :string) {
        super()
    }
    toDOM() {
        const span = document.createElement("span")
        span.textContent = this.text
        span.style.opacity = "0.4"
        span.style.pointerEvents = "none"
        return span
    }
}

let debounceTimer : number | null = null
let isWaitingForSuggestion = false
const DEBOUNCE_DELAY= 300

let currentAbortController : AbortController | null = null

const generatePayload = (view : EditorView , fileName : string) => {
    const code = view.state.doc.toString()
    if(!code || code.trim().length === 0) return null
    const cursorPosition = view.state.selection.main.head
    const currentLine = view.state.doc.lineAt(cursorPosition)
    const cursorLine = cursorPosition - currentLine.from

    const previousLines:string[] = []
    const previousLinesToFectch = Math.min(5 , currentLine.number  - 1)
    
    for(let i = previousLinesToFectch; i >= 1; i--){
        previousLines.push(view.state.doc.line(currentLine.number - i).text)
    }

    const nextLines:string[] = []
    const totalLines = view.state.doc.lines
    const linesToFetch = Math.min(5 , totalLines - currentLine.number)

    for(let i = 1; i <= linesToFetch; i++){
        nextLines.push(view.state.doc.line(currentLine.number + i).text)
    }

    return {
        fileName,
        code , 
        currentLine : currentLine.text,
        previousLines : previousLines.join("\n"),
        textBeforeCursor : currentLine.text.slice(0, cursorLine),
        textAfterCursor : currentLine.text.slice(cursorLine),
        nextLines : nextLines.join("\n"),
        lineNumber : currentLine.number,
    }

}

const createDebouncePlugin = (fileName : string) => {
    return ViewPlugin.fromClass(
        class {
            constructor(view : EditorView) {
                this.triggerSuggestion(view)
            
            }
            update(update : ViewUpdate) {
                if(update.docChanged || update.selectionSet){
                    this.triggerSuggestion(update.view)
                }
            }
            triggerSuggestion(view : EditorView) {
                if(debounceTimer !== null){
                    clearTimeout(debounceTimer)
                }
                if(currentAbortController !== null){
                    // Abort previous request silently - this is expected behavior
                    const controller = currentAbortController
                    currentAbortController = null
                    if(!controller.signal.aborted){
                        try {
                            controller.abort()
                        } catch {
                            // Ignore any errors from aborting
                        }
                    }
                }
                isWaitingForSuggestion = true
                debounceTimer= window.setTimeout(async() => {
                    const payload = generatePayload(view , fileName)
                    if(!payload){
                        isWaitingForSuggestion = false
                        view.dispatch({
                            effects : setSuggestionEffect.of(null)
                        })
                        return
                    }
                    currentAbortController = new AbortController()
                    const controller = currentAbortController
                    try {
                        const suggestion = await fetcher(payload , controller.signal)
                        // Only update if this is still the current request
                        if(controller === currentAbortController){
                            isWaitingForSuggestion = false
                            view.dispatch({
                                effects : setSuggestionEffect.of(suggestion)
                            })
                        }
                    } catch (error) {
                        // Ignore abort errors - they're expected when user types quickly
                        if(error instanceof Error && error.name === "AbortError"){
                            return
                        }
                        // Only update if this is still the current request
                        if(controller === currentAbortController){
                            isWaitingForSuggestion = false
                            view.dispatch({
                                effects : setSuggestionEffect.of(null)
                            })
                        }
                    } finally {
                        if(controller === currentAbortController){
                            currentAbortController = null
                        }
                    }
                } , DEBOUNCE_DELAY)
            }
            destroy() {
                if(debounceTimer !== null){
                    clearTimeout(debounceTimer)
                    debounceTimer = null
                }
                if(currentAbortController !== null){
                    // Abort previous request silently - this is expected behavior
                    const controller = currentAbortController
                    currentAbortController = null
                    if(!controller.signal.aborted){
                        try {
                            controller.abort()
                        } catch {
                            // Ignore any errors from aborting
                        }
                    }
                }
                isWaitingForSuggestion = false
            }
        }
    )
}

const renderPlugin = ViewPlugin.fromClass(
    class {
        decorations : DecorationSet;
        constructor(view : EditorView) {
            this.decorations = this.build(view)
        }
        update(update : ViewUpdate) {
            const suggestionChanged = update.transactions.some((transaction) => {
                return transaction.effects.some(effect => effect.is(setSuggestionEffect))
            })
            const shouldRebuild = update.docChanged || update.selectionSet || suggestionChanged

            if(shouldRebuild){
                this.decorations = this.build(update.view)
            }
        }
        build (view : EditorView) : DecorationSet {
            if(isWaitingForSuggestion){
                return Decoration.none
            }

            const suggestion = view.state.field(suggestionState)
            if(!suggestion){
                return Decoration.none
            }
            const cursor = view.state.selection.main.head
            const deco = Decoration.widget({
                widget : new SuggestionWidget(suggestion),
                side : 1
            }).range(cursor)
            return Decoration.set([deco])
        }
    },
    {
        decorations : (plugin) => plugin.decorations
    }
)

const acceptSuggestionKeymap = keymap.of([
    {
        key : "Tab",
        run : (view) => {
            const suggestion = view.state.field(suggestionState)
            if(!suggestion){
                return insertTab(view)
            }
            const cursor = view.state.selection.main.head
            view.dispatch({
                changes : {from : cursor , insert : suggestion},
                selection : {anchor : cursor + suggestion.length},
                effects : setSuggestionEffect.of(null)
            })
            return true
        }
    }
])

export const suggestion = (fileName : string) => [
    suggestionState ,
    createDebouncePlugin(fileName),
    renderPlugin ,
    acceptSuggestionKeymap
]