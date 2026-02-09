import {Decoration ,DecorationSet , EditorView  , ViewPlugin , ViewUpdate , WidgetType ,keymap} from '@codemirror/view'
import {StateEffect , StateField} from '@codemirror/state'
import { insertTab } from "@codemirror/commands"

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

let dobounceTime : number | null = null
let isWaitingForSuggestion = false
const DEBOUNCE_DELAY= 300


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
    renderPlugin ,
    acceptSuggestionKeymap

]