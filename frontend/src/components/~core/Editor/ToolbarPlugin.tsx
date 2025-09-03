//** Base Imports
import { useCallback, useEffect, useState } from 'react';
import './editor.styles.css';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import { Icon } from '~/icons/Icon';
import { mergeRegister } from '@lexical/utils';
/*
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'; */

//** Hooks
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsHighlighted(selection.hasFormat('highlight'));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1,
      )
    )
  }, [editor, updateToolbar]);

  return (
    <div className='flex gap-2 flex-col [&_*]:font-[cursive]'>
      <button
        className={`lexical-toolbar-btn ${isBold ? 'lexical-toolbar-btn-active' : ''}`}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
      >
        Bold
        <Icon size={18} icon='lucide:bold' />
      </button>
      <button
        className={`lexical-toolbar-btn ${isItalic ? 'lexical-toolbar-btn-active' : ''}`}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
      >
        Italic
        <Icon size={18} icon='lucide:italic' />
      </button>
      <button
        className={`lexical-toolbar-btn ${isStrikethrough ? 'lexical-toolbar-btn-active' : ''}`}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
      >
        Strikethrough
        <Icon size={18} icon='lucide:strikethrough' />
      </button>
      <button
        className={`lexical-toolbar-btn ${isUnderline ? 'lexical-toolbar-btn-active' : ''}`}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
      >
        Underline
        <Icon size={18} icon='lucide:underline' />
      </button>
      <button
        className={`lexical-toolbar-btn ${isHighlighted ? 'lexical-toolbar-btn-active' : ''}`}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'highlight');
        }}
      >
        Highlight
        <Icon size={18} icon='lucide:highlighter' />
      </button>
    </div>
  )
}