"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  ImageIcon,
  Type,
  Code2,
} from "lucide-react";
import { useCallback, useState, useEffect, useRef } from "react";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content?: object;
  onChange?: (content: object) => void;
  placeholder?: string;
}

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: () => void;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "내용을 입력하세요... ('/' 입력으로 명령어 사용)",
}: TiptapEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [slashQuery, setSlashQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full my-4",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: content || { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[400px] focus:outline-none p-4",
      },
      handleKeyDown: (view, event) => {
        if (showSlashMenu) {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            return true;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            if (filteredCommands[selectedIndex]) {
              filteredCommands[selectedIndex].command();
            }
            return true;
          }
          if (event.key === "Escape") {
            setShowSlashMenu(false);
            return true;
          }
        }

        if (event.key === "/" && view.state.selection.empty) {
          const { from } = view.state.selection;
          const coords = view.coordsAtPos(from);
          const editorRect = view.dom.getBoundingClientRect();
          
          setSlashMenuPosition({
            top: coords.bottom - editorRect.top + 8,
            left: coords.left - editorRect.left,
          });
          setShowSlashMenu(true);
          setSlashQuery("");
          setSelectedIndex(0);
        }
        return false;
      },
    },
  });

  const commands: CommandItem[] = editor ? [
    {
      title: "제목 1",
      description: "큰 제목",
      icon: <Heading1 className="w-4 h-4" />,
      command: () => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1 - slashQuery.length, to: editor.state.selection.from }).toggleHeading({ level: 1 }).run();
        setShowSlashMenu(false);
      },
    },
    {
      title: "제목 2",
      description: "중간 제목",
      icon: <Heading2 className="w-4 h-4" />,
      command: () => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1 - slashQuery.length, to: editor.state.selection.from }).toggleHeading({ level: 2 }).run();
        setShowSlashMenu(false);
      },
    },
    {
      title: "제목 3",
      description: "작은 제목",
      icon: <Heading3 className="w-4 h-4" />,
      command: () => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1 - slashQuery.length, to: editor.state.selection.from }).toggleHeading({ level: 3 }).run();
        setShowSlashMenu(false);
      },
    },
    {
      title: "본문",
      description: "일반 텍스트",
      icon: <Type className="w-4 h-4" />,
      command: () => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1 - slashQuery.length, to: editor.state.selection.from }).setParagraph().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: "글머리 목록",
      description: "순서 없는 목록",
      icon: <List className="w-4 h-4" />,
      command: () => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1 - slashQuery.length, to: editor.state.selection.from }).toggleBulletList().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: "번호 목록",
      description: "순서 있는 목록",
      icon: <ListOrdered className="w-4 h-4" />,
      command: () => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1 - slashQuery.length, to: editor.state.selection.from }).toggleOrderedList().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: "인용문",
      description: "인용 블록",
      icon: <Quote className="w-4 h-4" />,
      command: () => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1 - slashQuery.length, to: editor.state.selection.from }).toggleBlockquote().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: "코드 블록",
      description: "코드 스니펫",
      icon: <Code2 className="w-4 h-4" />,
      command: () => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1 - slashQuery.length, to: editor.state.selection.from }).toggleCodeBlock().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: "구분선",
      description: "수평 구분선",
      icon: <Minus className="w-4 h-4" />,
      command: () => {
        editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1 - slashQuery.length, to: editor.state.selection.from }).setHorizontalRule().run();
        setShowSlashMenu(false);
      },
    },
    {
      title: "이미지",
      description: "이미지 삽입",
      icon: <ImageIcon className="w-4 h-4" />,
      command: () => {
        const url = window.prompt("이미지 URL을 입력하세요:");
        if (url) {
          editor.chain().focus().deleteRange({ from: editor.state.selection.from - 1 - slashQuery.length, to: editor.state.selection.from }).setImage({ src: url }).run();
        }
        setShowSlashMenu(false);
      },
    },
  ] : [];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(slashQuery.toLowerCase()) ||
      cmd.description.toLowerCase().includes(slashQuery.toLowerCase())
  );

  useEffect(() => {
    if (!editor) return;

    const handleInput = () => {
      if (!showSlashMenu) return;
      
      const { from } = editor.state.selection;
      const text = editor.state.doc.textBetween(Math.max(0, from - 20), from);
      const slashIndex = text.lastIndexOf("/");
      
      if (slashIndex === -1) {
        setShowSlashMenu(false);
        return;
      }
      
      const query = text.slice(slashIndex + 1);
      setSlashQuery(query);
      setSelectedIndex(0);
    };

    editor.on("update", handleInput);
    return () => {
      editor.off("update", handleInput);
    };
  }, [editor, showSlashMenu]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowSlashMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addImage = useCallback(() => {
    const url = window.prompt("이미지 URL을 입력하세요:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden bg-[hsl(var(--background))] min-h-[400px] animate-pulse" />
    );
  }

  return (
    <div className="border border-[hsl(var(--border))] rounded-xl overflow-hidden bg-[hsl(var(--background))] relative">
      <div className="flex items-center gap-1 p-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("bold") ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="굵게"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("italic") ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="기울임"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("underline") ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="밑줄"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("strike") ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="취소선"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("code") ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="코드"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[hsl(var(--border))] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("heading", { level: 1 }) ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="제목 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("heading", { level: 2 }) ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="제목 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("heading", { level: 3 }) ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="제목 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[hsl(var(--border))] mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("bulletList") ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="글머리 목록"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("orderedList") ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="번호 목록"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("blockquote") ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="인용문"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors ${editor.isActive("codeBlock") ? "bg-[hsl(var(--secondary))]" : ""}`}
          title="코드 블록"
        >
          <Code2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-[hsl(var(--border))] mx-1" />

        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors"
          title="이미지"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-[hsl(var(--secondary))] transition-colors"
          title="구분선"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="flex-1" />
        <span className="text-xs text-[hsl(var(--muted-foreground))]">
          / 로 명령어
        </span>
      </div>

      <div className="relative">
        <EditorContent editor={editor} />

        {showSlashMenu && filteredCommands.length > 0 && (
          <div
            ref={menuRef}
            className="absolute z-50 w-64 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-xl overflow-hidden"
            style={{
              top: slashMenuPosition.top,
              left: slashMenuPosition.left,
            }}
          >
            <div className="p-2 border-b border-[hsl(var(--border))]">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                블록 타입 선택
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto p-1">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={cmd.title}
                  type="button"
                  onClick={cmd.command}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-[hsl(var(--secondary))]"
                      : "hover:bg-[hsl(var(--secondary))]"
                  }`}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))]">
                    {cmd.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cmd.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {cmd.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
