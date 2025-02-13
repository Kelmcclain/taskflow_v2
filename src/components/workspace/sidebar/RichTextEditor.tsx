// RichTextEditor.tsx
import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Extension } from "@tiptap/core";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Palette,
  Highlighter,
  Indent,
  Outdent,
} from "lucide-react";
import {
  colors,
  FONT_FAMILIES,
  FONT_SIZES,
} from "./manage_workspace_modal/constants";

// Custom extension for font size
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font size
       */
      setFontSize: (size: string) => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ commands }) => {
          return commands.setMark("textStyle", { fontSize });
        },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

type MenuButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip?: string;
};

type ColorPickerProps = {
  onChange: (color: string) => void;
  type: "text" | "background";
};

type FontSizePickerProps = {
  editor: Editor;
};

type FontFamilyPickerProps = {
  editor: Editor;
};

const TEXT_COLORS = colors;
const BG_COLORS = colors;

const MenuButton: React.FC<MenuButtonProps> = ({
  onClick,
  isActive,
  disabled,
  children,
  tooltip,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={tooltip}
    className={[
      "p-1.5 rounded transition-colors",
      isActive
        ? "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
    ].join(" ")}
  >
    {children}
  </button>
);

const ColorPicker: React.FC<ColorPickerProps> = ({ onChange, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <MenuButton
        onClick={() => setIsOpen(!isOpen)}
        tooltip={type === "text" ? "Text Color" : "Background Color"}
      >
        {type === "text" ? (
          <Palette className="w-4 h-4" />
        ) : (
          <Highlighter className="w-4 h-4" />
        )}
      </MenuButton>
      <div
        className={`absolute ${
          isOpen ? "flex" : "hidden"
        } flex-wrap w-48 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 top-full left-0 mt-1`}
      >
        {(type === "text" ? TEXT_COLORS : BG_COLORS).map((color) => (
          <button
            key={color}
            className="w-6 h-6 m-1 rounded border border-gray-200 dark:border-gray-700"
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
          />
        ))}
      </div>
    </div>
  );
};

const FontSizePicker: React.FC<FontSizePickerProps> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      <MenuButton onClick={() => setIsOpen(!isOpen)} tooltip="Font Size">
        <Type className="w-4 h-4" />
      </MenuButton>
      <div
        className={`absolute ${
          isOpen ? "flex" : "hidden"
        } flex-col w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 top-full left-0 mt-1`}
      >
        {FONT_SIZES.map((size) => (
          <button
            key={size}
            className="px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              editor.chain().focus().setFontSize(size).run();
            }}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

const FontFamilyPicker: React.FC<FontFamilyPickerProps> = ({ editor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const activeFont = editor.getAttributes('textStyle').fontFamily;
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          pickerRef.current &&
          !pickerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    return (
      <div className="relative" ref={pickerRef}>
        <MenuButton onClick={() => setIsOpen(!isOpen)} tooltip="Font Family">
          <span className="text-sm" style={{ fontFamily: activeFont || 'inherit' }}>
            {activeFont || 'Font'}
          </span>
        </MenuButton>
        <div
          className={`absolute ${
            isOpen ? "flex" : "hidden"
          } flex-col w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 top-full left-0 mt-1 max-h-64 overflow-y-auto`}
        >
          {FONT_FAMILIES.map((font) => (
            <button
              key={font}
              className={`px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                activeFont === font ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
              style={{ fontFamily: font }}
              onClick={() => {
                editor.chain().focus().setFontFamily(font).run();
                setIsOpen(false);
              }}
            >
              {font}
            </button>
          ))}
        </div>
      </div>
    );
  };

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: [
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[120px] p-4",
          "prose-headings:mt-4 prose-headings:mb-2",
          "prose-p:my-2 prose-p:leading-relaxed",
          "prose-a:text-purple-600 dark:prose-a:text-purple-400",
          "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600",
          "prose-blockquote:pl-4 prose-blockquote:my-4 prose-blockquote:italic",
          "prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5",
          "prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5",
          "prose-li:my-1",
          "prose-img:rounded-lg",
          "sm:prose-base",
          "lg:prose-lg",
        ].join(" "),
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden w-full">
      <div className="border-b border-gray-200 dark:border-gray-800 p-1.5 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-0.5">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            tooltip="Bold"
          >
            <Bold className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            tooltip="Italic"
          >
            <Italic className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 self-center" />

        <div className="flex items-center gap-0.5">
          <FontSizePicker editor={editor} />
          <FontFamilyPicker editor={editor} />
          <ColorPicker
            onChange={(color) => editor.chain().focus().setColor(color).run()}
            type="text"
          />
          <ColorPicker
            onChange={(color) =>
              editor.chain().focus().setHighlight({ color }).run()
            }
            type="background"
          />
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 self-center" />

        <div className="flex items-center gap-0.5">
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            tooltip="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            tooltip="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            tooltip="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            tooltip="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 self-center" />

        <div className="flex items-center gap-0.5">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            tooltip="Bullet List"
          >
            <List className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            tooltip="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 self-center" />

        <div className="flex items-center gap-0.5">
          <MenuButton
            onClick={() =>
              editor
                .chain()
                .focus()
                .lift("listItem")
                .sinkListItem("listItem")
                .run()
            }
            tooltip="Indent"
          >
            <Indent className="w-4 h-4" />
          </MenuButton>
          <MenuButton
            onClick={() =>
              editor.chain().focus().liftListItem("listItem").run()
            }
            tooltip="Outdent"
          >
            <Outdent className="w-4 h-4" />
          </MenuButton>
        </div>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 self-center" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          tooltip="Quote"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 self-center" />

        <div className="flex items-center gap-0.5">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            tooltip="Undo"
          >
            <Undo className="w-4 h-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            tooltip="Redo"
          >
            <Redo className="w-4 h-4" />
          </MenuButton>
        </div>
      </div>

      <EditorContent editor={editor} className="w-full" />
    </div>
  );
};
