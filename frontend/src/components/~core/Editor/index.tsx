//** Base Imports
import { useCallback, useMemo, useRef, useState } from 'react';
import './editor.styles.css';
import { EditorState, Klass, LexicalEditor, LexicalNode } from 'lexical';
import { HeadingNode } from '@lexical/rich-text';
import { Icon } from '~/icons/Icon';

/*
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'; */

//** Plugins, Composer and Core Components Imports
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

//** Hooks
import { Popover } from 'antd';
import { ToolbarPlugin } from './ToolbarPlugin';
import { EmojiNode } from './nodes/EmojiNode';
import EmojisPlugin from './plugins/EmojisPlugin';
import { $generateHtmlFromNodes } from '@lexical/html';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useDebounce } from './lib/useDebounce';
import { IS_CLIENT_SIDE } from './lib/isClientSide';
import { updateEditorStateWithHTML } from './lib/updateEditorStateWithHTML';

const theme = {
  heading: {
    h1: 'lexical-heading-h1'
  },
  text: {
    underline: 'lexical-text-underline',
    strikethrough: 'lexical-text-strikethrough'
  }
}

function onError(error: Error): void {
  console.error(error);
}

/* function OnChangePlugin({ onChange }: { onChange: (editorState: EditorState) => void }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState)
    })
  }, [onChange, editor]);
  return null;
} */

function Editor({
  draftKey,
  placeholder = 'Enter your message',
  value,
  disabled = false,
  onChange
}: {
  draftKey?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  onChange: (html: string) => void;
}) {
  const safeOnChage = useRef(onChange);

  /* const onTextChange: (editorState: EditorState) => void = useCallback((editorState) => {
    /* console.log();
    safeOnChage.current(editorState.toJSON()); *//*
}, []);

const onChange = (editorState: EditorState) => {
console.log(editorState);
}*/

  const debouncedSaveToLocal = useDebounce((htmlContent: string) => {
    if (IS_CLIENT_SIDE && draftKey) { window.localStorage.setItem(draftKey, htmlContent); }
  }, 800);

  const onTextChange: (editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => void =
    useCallback((editorState, editor) => {
      editorState.read(() => {
        const $html = $generateHtmlFromNodes(editor);
        safeOnChage.current($html);
        if (draftKey) {
          debouncedSaveToLocal($html);

        }
      });
    },
      [debouncedSaveToLocal, draftKey]
    );

  const initialConfig = useMemo(() => ({
    namespace: 'LexicalEditor',
    theme,
    onError,
    editable: !disabled,
    editorState: (editor: LexicalEditor) => IS_CLIENT_SIDE && updateEditorStateWithHTML(value || '<p></p>', editor),
    nodes: [
      HeadingNode,
      EmojiNode,
    ] as Array<Klass<LexicalNode>>
  }), [disabled, value]);

  return (
    <div className='relative bg-gray-100 p-[8px] rounded-md min-w-[400px] max-w-full mx-auto [&_*]:font-[cursive]'>
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className='lexical-content-editable flex-1 h-[48px] pl-[8px] pr-[132px] py-[10px] bg-white rounded-lg border-2 border-transparent' />
          }
          placeholder={
            <div className='absolute top-1/2 -translate-y-1/2 left-[16px] pointer-events-none text-[#3f4c5c]'>{placeholder}</div>
          }
          ErrorBoundary={LexicalErrorBoundary} />
        <HistoryPlugin />
        {/* <AutoFocusPlugin /> top-[18px] */}
        <OnChangePlugin onChange={onTextChange} />
        {/* <ToolbarPlugin /> */}
        <EmojisPlugin />
        <CtaUtils />
      </LexicalComposer>
    </div>
  );
}

function CtaUtils() {
  const [open, setOpen] = useState(false);
  const [openAttachment, setOpenAttachment] = useState(false);

  return (
    <div className='absolute top-1/2 -translate-y-1/2 right-[12px] flex gap-1 items-center'>
      <Popover
        open={open}
        onOpenChange={setOpen}
        content={<ToolbarPlugin />}
        rootClassName='popover-override'
        trigger={['click']}
      >
        <button className='inline-flex items-center justify-center h-[40px] aspect-square bg-gray-50 p-2 rounded-lg'>
          <Icon icon='lucide:spline' size={22} className='text-primary' />
        </button>
      </Popover>
      <Popover
        open={openAttachment}
        onOpenChange={setOpenAttachment}
        content={<AttachDocument />}
        rootClassName='popover-override'
        trigger={['click']}
      >
        <button className='inline-flex items-center justify-center h-[40px] aspect-square bg-gray-50 p-2 rounded-lg'>
          <Icon icon='lucide:paperclip' size={22} className='text-primary' />
        </button>
      </Popover>
      <button className='inline-flex items-center justify-center h-[40px] aspect-square bg-gray-50 p-2 rounded-lg'>
        <Icon icon='lucide:mic' size={22} className='text-gray-800' />
      </button>
      <button className='inline-flex items-center justify-center h-[40px] aspect-square bg-primary p-2 rounded-lg'>
        <Icon icon='lucide:send' size={22} className='text-white' />
      </button>
    </div>
  )
}

const AttachDocument = () => {
  return (
    <div className='flex gap-2 flex-col [&_*]:font-[cursive]'>
      <button
        className={`lexical-attach-btn`}
      >
        <Icon size={18} icon='lucide:file-plus-2' />
        Document
      </button>
      <button
        className={`lexical-attach-btn`}
      >
        <Icon size={18} icon='lucide:image' />
        Image
      </button>
      <button
        className={`lexical-attach-btn`}
      >
        <Icon size={18} icon='lucide:clapperboard' />
        Video
      </button>
    </div>
  )
}

export default Editor;