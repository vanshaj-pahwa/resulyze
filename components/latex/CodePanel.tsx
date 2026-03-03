'use client'

import { useEffect, useRef, useCallback } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, GutterMarker, gutter } from '@codemirror/view'
import { EditorState, Compartment, StateEffect, StateField, RangeSetBuilder } from '@codemirror/state'
import { defaultKeymap, indentWithTab, indentLess, history, historyKeymap, copyLineDown, moveLineUp, moveLineDown, deleteLine, toggleLineComment } from '@codemirror/commands'
import { bracketMatching, foldGutter, indentOnInput, StreamLanguage } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { latexCommandCompletions, latexEnvironmentCompletions, latexResumeSnippets } from '@/lib/latex/completions'
import { linter, lintGutter } from '@codemirror/lint'
import { latexLinter } from '@/lib/latex/linter'
import { stex } from '@codemirror/legacy-modes/mode/stex'
import { search, searchKeymap, highlightSelectionMatches, openSearchPanel, closeSearchPanel } from '@codemirror/search'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

// Dark theme
const prismDarkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#0d0d0d',
    color: '#e0e0e0',
    height: '100%',
    fontSize: '14px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
  },
  '.cm-content': {
    caretColor: '#ffffff',
    padding: '8px 0',
  },
  '.cm-gutters': {
    backgroundColor: '#1a1a1a',
    color: '#666666',
    border: 'none',
    borderRight: '1px solid #2a2a2a',
    minWidth: '48px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#252525',
    color: '#999999',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  '.cm-cursor': {
    borderLeftColor: '#ffffff',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#264f78 !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#264f78 !important',
  },
  '.cm-matchingBracket': {
    backgroundColor: '#3a3a3a',
    outline: '1px solid #555',
  },
  '.cm-foldGutter': {
    width: '12px',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    color: '#999',
  },
  '.cm-searchMatch': {
    backgroundColor: '#515c6a',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#515c6a',
    outline: '1px solid #e5c07b',
  },
  '.cm-scroller': {
    overflow: 'auto',
    lineHeight: '1.6',
  },
  '& .cm-panels': {
    backgroundColor: '#1a1a1a',
    color: '#ccc',
  },
  '& .cm-panels-top': {
    borderBottom: '1px solid #2a2a2a',
  },
  '& .cm-search': {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    fontSize: '13px',
  },
  '& .cm-search br': {
    flexBasis: '100%',
    height: '0',
  },
  '& .cm-search label': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#999',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  '& .cm-textfield': {
    backgroundColor: '#252525 !important',
    color: '#e0e0e0 !important',
    border: '1px solid #3a3a3a !important',
    borderRadius: '4px !important',
    padding: '4px 8px !important',
    fontSize: '13px !important',
    outline: 'none',
    width: '200px',
  },
  '& .cm-textfield:focus': {
    borderColor: '#515c6a !important',
  },
  '& .cm-button': {
    backgroundColor: '#2a2a2a !important',
    color: '#ccc !important',
    border: '1px solid #3a3a3a !important',
    borderRadius: '4px !important',
    cursor: 'pointer',
    padding: '3px 10px !important',
    fontSize: '12px !important',
    backgroundImage: 'none !important',
    whiteSpace: 'nowrap',
  },
  '& .cm-button:hover': {
    backgroundColor: '#3a3a3a !important',
    color: '#fff !important',
  },
  '& .cm-search input[type=checkbox]': {
    appearance: 'none',
    width: '14px',
    height: '14px',
    border: '1px solid #555',
    borderRadius: '3px',
    backgroundColor: '#252525',
    cursor: 'pointer',
    verticalAlign: 'middle',
    position: 'relative',
    margin: '0',
    flexShrink: '0',
  },
  '& .cm-search input[type=checkbox]:checked': {
    backgroundColor: '#515c6a',
    borderColor: '#515c6a',
  },
  '& .cm-search input[type=checkbox]:checked::after': {
    content: '""',
    position: 'absolute',
    left: '4px',
    top: '1px',
    width: '4px',
    height: '8px',
    border: 'solid #fff',
    borderWidth: '0 2px 2px 0',
    transform: 'rotate(45deg)',
  },
  '& .cm-search button[name=close]': {
    color: '#666',
    fontSize: '18px',
    padding: '0 6px',
    border: 'none !important',
    backgroundColor: 'transparent !important',
    marginLeft: 'auto',
  },
  '& .cm-search button[name=close]:hover': {
    color: '#e0e0e0',
    backgroundColor: 'transparent !important',
  },
})

// Light theme
const prismLightTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    height: '100%',
    fontSize: '14px',
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
  },
  '.cm-content': {
    caretColor: '#000000',
    padding: '8px 0',
  },
  '.cm-gutters': {
    backgroundColor: '#f5f5f5',
    color: '#999999',
    border: 'none',
    borderRight: '1px solid #e5e5e5',
    minWidth: '48px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#ebebeb',
    color: '#555555',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  '.cm-cursor': {
    borderLeftColor: '#000000',
    borderLeftWidth: '2px',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#b3d4ff !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#b3d4ff !important',
  },
  '.cm-matchingBracket': {
    backgroundColor: '#e0e0e0',
    outline: '1px solid #bbb',
  },
  '.cm-foldGutter': {
    width: '12px',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: '#e5e5e5',
    border: '1px solid #ccc',
    color: '#666',
  },
  '.cm-searchMatch': {
    backgroundColor: '#fde68a',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#fbbf24',
    outline: '1px solid #d97706',
  },
  '.cm-scroller': {
    overflow: 'auto',
    lineHeight: '1.6',
  },
  '& .cm-panels': {
    backgroundColor: '#f5f5f5',
    color: '#333',
  },
  '& .cm-panels-top': {
    borderBottom: '1px solid #e5e5e5',
  },
  '& .cm-search': {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    fontSize: '13px',
  },
  '& .cm-search br': {
    flexBasis: '100%',
    height: '0',
  },
  '& .cm-search label': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#666',
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  '& .cm-textfield': {
    backgroundColor: '#ffffff !important',
    color: '#1a1a1a !important',
    border: '1px solid #d4d4d4 !important',
    borderRadius: '4px !important',
    padding: '4px 8px !important',
    fontSize: '13px !important',
    outline: 'none',
    width: '200px',
  },
  '& .cm-textfield:focus': {
    borderColor: '#888888 !important',
  },
  '& .cm-button': {
    backgroundColor: '#e5e5e5 !important',
    color: '#333 !important',
    border: '1px solid #cccccc !important',
    borderRadius: '4px !important',
    cursor: 'pointer',
    padding: '3px 10px !important',
    fontSize: '12px !important',
    backgroundImage: 'none !important',
    whiteSpace: 'nowrap',
  },
  '& .cm-button:hover': {
    backgroundColor: '#d4d4d4 !important',
    color: '#000 !important',
  },
  '& .cm-search input[type=checkbox]': {
    appearance: 'none',
    width: '14px',
    height: '14px',
    border: '1px solid #bbbbbb',
    borderRadius: '3px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    verticalAlign: 'middle',
    position: 'relative',
    margin: '0',
    flexShrink: '0',
  },
  '& .cm-search input[type=checkbox]:checked': {
    backgroundColor: '#888888',
    borderColor: '#888888',
  },
  '& .cm-search input[type=checkbox]:checked::after': {
    content: '""',
    position: 'absolute',
    left: '4px',
    top: '1px',
    width: '4px',
    height: '8px',
    border: 'solid #fff',
    borderWidth: '0 2px 2px 0',
    transform: 'rotate(45deg)',
  },
  '& .cm-search button[name=close]': {
    color: '#999',
    fontSize: '18px',
    padding: '0 6px',
    border: 'none !important',
    backgroundColor: 'transparent !important',
    marginLeft: 'auto',
  },
  '& .cm-search button[name=close]:hover': {
    color: '#333',
    backgroundColor: 'transparent !important',
  },
})

// Dark syntax highlighting
const prismDarkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#e5c07b' },
  { tag: tags.name, color: '#e5c07b' },
  { tag: tags.typeName, color: '#e5c07b' },
  { tag: tags.bracket, color: '#56b6c2' },
  { tag: tags.paren, color: '#56b6c2' },
  { tag: tags.squareBracket, color: '#c678dd' },
  { tag: tags.brace, color: '#56b6c2' },
  { tag: tags.string, color: '#98c379' },
  { tag: tags.comment, color: '#5c6370', fontStyle: 'italic' },
  { tag: tags.number, color: '#d19a66' },
  { tag: tags.operator, color: '#c678dd' },
  { tag: tags.meta, color: '#e5c07b' },
  { tag: tags.atom, color: '#d19a66' },
  { tag: tags.content, color: '#e0e0e0' },
  { tag: tags.heading, color: '#e5c07b', fontWeight: 'bold' },
])

// Light syntax highlighting
const prismLightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#7c4dff' },
  { tag: tags.name, color: '#7c4dff' },
  { tag: tags.typeName, color: '#7c4dff' },
  { tag: tags.bracket, color: '#0097a7' },
  { tag: tags.paren, color: '#0097a7' },
  { tag: tags.squareBracket, color: '#9c27b0' },
  { tag: tags.brace, color: '#0097a7' },
  { tag: tags.string, color: '#2e7d32' },
  { tag: tags.comment, color: '#9e9e9e', fontStyle: 'italic' },
  { tag: tags.number, color: '#e65100' },
  { tag: tags.operator, color: '#9c27b0' },
  { tag: tags.meta, color: '#7c4dff' },
  { tag: tags.atom, color: '#e65100' },
  { tag: tags.content, color: '#1a1a1a' },
  { tag: tags.heading, color: '#7c4dff', fontWeight: 'bold' },
])

// ---------------------------------------------------------------------------
// Diff gutter — highlights lines changed by AI (green bar, auto-clears)
// ---------------------------------------------------------------------------
const setChangedLines = StateEffect.define<Set<number>>()

const changedLinesField = StateField.define<Set<number>>({
  create: () => new Set(),
  update(value, tr) {
    // Clear markers when the user starts typing
    if (tr.docChanged && (tr.isUserEvent('input') || tr.isUserEvent('delete'))) {
      return new Set()
    }
    for (const effect of tr.effects) {
      if (effect.is(setChangedLines)) return effect.value
    }
    return value
  },
})

class DiffMarker extends GutterMarker {
  constructor(private readonly color: string) { super() }
  toDOM() {
    const el = document.createElement('div')
    el.style.cssText = `width:3px;height:100%;background:${this.color};border-radius:0 2px 2px 0;margin-left:1px`
    return el
  }
}

const addedMarker = new DiffMarker('#22c55e')   // green  — line added/changed
const modifiedMarker = new DiffMarker('#f59e0b') // amber  — line modified in-place

const diffGutterExtension = gutter({
  class: 'cm-diff-gutter',
  markers(view) {
    const changedLines = view.state.field(changedLinesField)
    if (changedLines.size === 0) return new RangeSetBuilder<GutterMarker>().finish()
    return buildRangeSet(view, changedLines)
  },
  initialSpacer: () => new DiffMarker('transparent'),
})

function buildRangeSet(view: EditorView, changedLines: Set<number>) {
  const builder = new RangeSetBuilder<GutterMarker>()
  for (let i = 1; i <= view.state.doc.lines; i++) {
    if (changedLines.has(i)) {
      const line = view.state.doc.line(i)
      builder.add(line.from, line.from, changedLines.has(-(i)) ? modifiedMarker : addedMarker)
    }
  }
  return builder.finish()
}

/** Return the set of 1-based line numbers that differ between old and new text. */
function diffLines(oldText: string, newText: string): Set<number> {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  const changed = new Set<number>()
  const len = Math.max(oldLines.length, newLines.length)
  for (let i = 0; i < len; i++) {
    if (oldLines[i] !== newLines[i]) changed.add(i + 1)
  }
  return changed
}

function isDark() {
  return document.documentElement.classList.contains('dark')
}

interface CodePanelProps {
  value: string
  onChange: (value: string) => void
  onCompile: () => void
  searchTrigger?: number
  navigateToLine?: number
}

export default function CodePanel({ value, onChange, onCompile, searchTrigger, navigateToLine }: CodePanelProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const onCompileRef = useRef(onCompile)
  const themeCompartment = useRef(new Compartment())
  const prevValueRef = useRef(value)
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep refs current
  onChangeRef.current = onChange
  onCompileRef.current = onCompile

  const handleCompile = useCallback(() => {
    onCompileRef.current()
    return true
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

    const dark = isDark()
    const themeExtensions = dark
      ? [prismDarkTheme, syntaxHighlighting(prismDarkHighlightStyle)]
      : [prismLightTheme, syntaxHighlighting(prismLightHighlightStyle)]

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        bracketMatching(),
        foldGutter(),
        indentOnInput(),
        history(),
        highlightSelectionMatches(),
        search({ top: true }),
        // Auto-close brackets: {}, [], (), and $$
        closeBrackets(),
        // Diff gutter: green/amber bars on AI-changed lines
        changedLinesField,
        diffGutterExtension,
        // LaTeX linting: brace balance, environment mismatches, missing packages
        lintGutter(),
        linter(latexLinter, { delay: 400 }),
        // LaTeX autocomplete: commands, environments, resume snippets
        autocompletion({
          override: [latexCommandCompletions, latexEnvironmentCompletions, latexResumeSnippets],
          activateOnTyping: true,
          maxRenderedOptions: 20,
        }),
        // Teach CodeMirror that LaTeX line comments use %
        EditorState.languageData.of(() => [{ commentTokens: { line: '%' } }]),
        StreamLanguage.define(stex),
        themeCompartment.current.of(themeExtensions),
        keymap.of([
          // Auto-close bracket keybindings (Backspace smart-delete)
          ...closeBracketsKeymap,
          // Autocomplete navigation (Tab to accept, Escape to close, arrows)
          ...completionKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          indentWithTab,
          // Smart editing shortcuts
          { key: 'Ctrl-/', mac: 'Cmd-/', run: toggleLineComment },
          { key: 'Ctrl-Shift-d', mac: 'Cmd-Shift-d', run: copyLineDown },
          { key: 'Alt-ArrowUp', run: moveLineUp },
          { key: 'Alt-ArrowDown', run: moveLineDown },
          { key: 'Ctrl-Shift-k', mac: 'Cmd-Shift-k', run: deleteLine },
          { key: 'Shift-Tab', run: indentLess },
          {
            key: 'Ctrl-Enter',
            mac: 'Cmd-Enter',
            run: handleCompile,
          },
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        EditorView.lineWrapping,
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    // Watch for dark/light class changes on <html>
    const observer = new MutationObserver(() => {
      const view = viewRef.current
      if (!view) return
      const nowDark = isDark()
      const newTheme = nowDark
        ? [prismDarkTheme, syntaxHighlighting(prismDarkHighlightStyle)]
        : [prismLightTheme, syntaxHighlighting(prismLightHighlightStyle)]
      view.dispatch({
        effects: themeCompartment.current.reconfigure(newTheme),
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      observer.disconnect()
      view.destroy()
      viewRef.current = null
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
    }
    // Only create editor once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external value changes into CodeMirror (e.g., after AI optimization)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentContent = view.state.doc.toString()
    if (value !== currentContent) {
      // Compute which lines changed before replacing the document
      const changed = diffLines(prevValueRef.current, value)

      view.dispatch({
        changes: { from: 0, to: currentContent.length, insert: value },
        effects: changed.size > 0 ? setChangedLines.of(changed) : [],
      })

      // Auto-clear diff markers after 8s
      if (changed.size > 0) {
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
        clearTimerRef.current = setTimeout(() => {
          viewRef.current?.dispatch({ effects: setChangedLines.of(new Set()) })
        }, 8000)
      }
    }

    prevValueRef.current = value
  }, [value])

  // Scroll editor to a specific 1-based line (triggered by outline panel clicks)
  useEffect(() => {
    if (!navigateToLine || !viewRef.current) return
    const view = viewRef.current
    const lineCount = view.state.doc.lines
    const targetLine = Math.max(1, Math.min(navigateToLine, lineCount))
    const pos = view.state.doc.line(targetLine).from
    view.dispatch({
      selection: { anchor: pos },
      effects: EditorView.scrollIntoView(pos, { y: 'center' }),
    })
    view.focus()
  }, [navigateToLine])

  // Toggle search panel when searchTrigger changes
  useEffect(() => {
    if (searchTrigger && viewRef.current) {
      const view = viewRef.current
      const searchOpen = view.dom.querySelector('.cm-search')
      if (searchOpen) {
        closeSearchPanel(view)
      } else {
        openSearchPanel(view)
      }
    }
  }, [searchTrigger])

  return <div ref={editorRef} className="h-full w-full overflow-hidden" />
}
