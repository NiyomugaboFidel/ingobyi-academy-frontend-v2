'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/lib/api/uploads';
import { useAuthStore } from '@/lib/auth/store';
import { getErrorMessage } from '@/lib/api/errors';
import { toast } from 'sonner';

export type RichTextSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<RichTextSize, string> = {
  sm: 'min-h-[80px]',
  md: 'min-h-[140px]',
  lg: 'min-h-[220px]',
};

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  size?: RichTextSize;
  disabled?: boolean;
  className?: string;
  /** Hide toolbar (read-only preview styling). */
  readOnly?: boolean;
};

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded border border-transparent text-brand-muted transition-colors',
        'hover:border-brand-green/12 hover:bg-brand-green/5 hover:text-brand-green',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active && 'border-brand-green/15 bg-brand-green/8 text-brand-green',
      )}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = 'Write here…',
  size = 'md',
  disabled,
  className,
  readOnly,
}: RichTextEditorProps) {
  const token = useAuthStore((s) => s.accessToken);
  const imageRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const lastExternal = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image.configure({ inline: false, allowBase64: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: !disabled && !readOnly,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none px-3 py-2.5 text-sm leading-relaxed',
          SIZE_CLASS[size],
        ),
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items || !token || disabled || readOnly) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              void insertImage(file);
              return true;
            }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastExternal.current = html;
      onChange(html);
    },
    onBlur: () => {
      onBlur?.();
    },
  });

  const insertImage = useCallback(
    async (file: File) => {
      if (!editor || !token) return;
      setUploading(true);
      try {
        const uploaded = await uploadImage(file, token);
        editor.chain().focus().setImage({ src: uploaded.url, alt: file.name }).run();
      } catch (err) {
        toast.error(getErrorMessage(err, 'Image upload failed'));
      } finally {
        setUploading(false);
        if (imageRef.current) imageRef.current.value = '';
      }
    },
    [editor, token],
  );

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled && !readOnly);
  }, [editor, disabled, readOnly]);

  useEffect(() => {
    if (!editor) return;
    const incoming = value || '<p></p>';
    if (incoming !== lastExternal.current) {
      editor.commands.setContent(incoming, { emitUpdate: false });
      lastExternal.current = incoming;
    }
  }, [editor, value]);

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  if (!editor) {
    return (
      <div className={cn('rounded-lg border border-brand-green/12 bg-white', className)}>
        <div className="flex items-center justify-center py-8 text-sm text-brand-muted">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading editor…
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rich-editor overflow-hidden rounded-lg border border-brand-green/12 bg-white shadow-sm',
        (disabled || readOnly) && 'opacity-80',
        className,
      )}
    >
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-brand-green/8 bg-brand-canvas px-2 py-1.5">
          <ToolbarButton
            title="Bold"
            active={editor.isActive('bold')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            active={editor.isActive('italic')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Underline"
            active={editor.isActive('underline')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Strikethrough"
            active={editor.isActive('strike')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>

          <span className="mx-1 h-5 w-px bg-brand-green/12" />

          <ToolbarButton
            title="Heading 2"
            active={editor.isActive('heading', { level: 2 })}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Heading 3"
            active={editor.isActive('heading', { level: 3 })}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarButton>

          <span className="mx-1 h-5 w-px bg-brand-green/12" />

          <ToolbarButton
            title="Bullet list"
            active={editor.isActive('bulletList')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Numbered list"
            active={editor.isActive('orderedList')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Quote"
            active={editor.isActive('blockquote')}
            disabled={disabled}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-3.5 w-3.5" />
          </ToolbarButton>

          <span className="mx-1 h-5 w-px bg-brand-green/12" />

          <ToolbarButton
            title="Align left"
            active={editor.isActive({ textAlign: 'left' })}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Align center"
            active={editor.isActive({ textAlign: 'center' })}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Align right"
            active={editor.isActive({ textAlign: 'right' })}
            disabled={disabled}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-3.5 w-3.5" />
          </ToolbarButton>

          <span className="mx-1 h-5 w-px bg-brand-green/12" />

          <ToolbarButton title="Link" active={editor.isActive('link')} disabled={disabled} onClick={setLink}>
            <Link2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton
            title="Insert image"
            disabled={disabled || uploading || !token}
            onClick={() => imageRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
          </ToolbarButton>

          <span className="mx-1 h-5 w-px bg-brand-green/12" />

          <ToolbarButton title="Undo" disabled={disabled || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
            <Undo className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton title="Redo" disabled={disabled || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
            <Redo className="h-3.5 w-3.5" />
          </ToolbarButton>

          <input
            ref={imageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && void insertImage(e.target.files[0])}
          />
        </div>
      )}

      <EditorContent editor={editor} className="max-h-[480px] overflow-y-auto" />
    </div>
  );
}
