'use client'

import { useEffect, useRef, useCallback } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands'
import { bracketMatching, foldGutter, indentOnInput, StreamLanguage } from '@codemirror/language'
import { stex } from '@codemirror/legacy-modes/mode/stex'
import { search, searchKeymap, highlightSelectionMatches, openSearchPanel } from '@codemirror/search'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

// Prism-inspired dark theme
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
    padding: '8px 12px',
    fontSize: '13px',
  },
  '& .cm-search label': {
    color: '#999',
    fontSize: '12px',
  },
  '& .cm-textfield': {
    backgroundColor: '#252525 !important',
    color: '#e0e0e0 !important',
    border: '1px solid #3a3a3a !important',
    borderRadius: '4px !important',
    padding: '4px 8px !important',
    fontSize: '13px !important',
    outline: 'none',
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
  },
  '& .cm-search button[name=close]:hover': {
    color: '#e0e0e0',
    backgroundColor: 'transparent !important',
  },
  '& .cm-search br': {
    display: 'none',
  },
})

// Syntax highlighting matching Prism's LaTeX colors
const prismHighlightStyle = HighlightStyle.define([
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

interface CodePanelProps {
  value: string
  onChange: (value: string) => void
  onCompile: () => void
  searchTrigger?: number
}

export default function CodePanel({ value, onChange, onCompile, searchTrigger }: CodePanelProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  const onCompileRef = useRef(onCompile)

  // Keep refs current
  onChangeRef.current = onChange
  onCompileRef.current = onCompile

  const handleCompile = useCallback(() => {
    onCompileRef.current()
    return true
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

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
        StreamLanguage.define(stex),
        prismDarkTheme,
        syntaxHighlighting(prismHighlightStyle),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          indentWithTab,
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

    return () => {
      view.destroy()
      viewRef.current = null
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
      view.dispatch({
        changes: { from: 0, to: currentContent.length, insert: value },
      })
    }
  }, [value])

  // Open search panel when searchTrigger changes
  useEffect(() => {
    if (searchTrigger && viewRef.current) {
      openSearchPanel(viewRef.current)
    }
  }, [searchTrigger])

  return <div ref={editorRef} className="h-full w-full overflow-hidden" />
}
