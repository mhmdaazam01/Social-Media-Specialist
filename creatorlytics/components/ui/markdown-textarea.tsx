import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link2, 
  ImageIcon, 
  Type,
  Strikethrough
} from "lucide-react";

interface MarkdownTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onValueChange: (value: string) => void;
}

export function MarkdownTextarea({ value, onValueChange, className, ...props }: MarkdownTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertText = React.useCallback((before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const newValue = 
      value.substring(0, start) + 
      before + 
      selectedText + 
      after + 
      value.substring(end);
    
    onValueChange(newValue);

    // Set cursor position inside the wrapping if no text was selected, or after if text was selected
    requestAnimationFrame(() => {
      textarea.focus();
      if (selectedText.length === 0) {
        textarea.selectionStart = textarea.selectionEnd = start + before.length;
      } else {
        textarea.selectionStart = textarea.selectionEnd = start + before.length + selectedText.length + after.length;
      }
    });
  }, [value, onValueChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces for tab
      const tabChar = "  ";
      const newValue = value.substring(0, start) + tabChar + value.substring(end);
      onValueChange(newValue);

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabChar.length;
      });
    }
    
    // Pass along user's onKeyDown if exists
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  const toolbarButtons = React.useMemo(() => [
    { icon: <Bold className="size-3.5" />, action: () => insertText("**", "**"), title: "Bold" },
    { icon: <Italic className="size-3.5" />, action: () => insertText("*", "*"), title: "Italic" },
    { icon: <Strikethrough className="size-3.5" />, action: () => insertText("~~", "~~"), title: "Strikethrough" },
    { divider: true },
    { icon: <List className="size-3.5" />, action: () => insertText("- "), title: "Bullet List" },
    { icon: <ListOrdered className="size-3.5" />, action: () => insertText("1. "), title: "Numbered List" },
    { divider: true },
    { icon: <Link2 className="size-3.5" />, action: () => insertText("[", "](url)"), title: "Link" },
    { icon: <ImageIcon className="size-3.5" />, action: () => insertText("![alt](", ")"), title: "Image" },
  ], [insertText]);

  return (
    <div className="flex flex-col rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-input px-2 py-1.5 bg-muted/30">
        <Type className="size-3.5 text-muted-foreground mr-1" />
        <div className="h-4 w-px bg-border mx-1" />
        {/* eslint-disable-next-line react-hooks/refs */}
        {toolbarButtons.map((btn, i) => 
          btn.divider ? (
            <div key={`div-${i}`} className="h-4 w-px bg-border mx-1" />
          ) : (
            <button
              key={btn.title}
              type="button"
              onClick={btn.action}
              title={btn.title}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
            >
              {btn.icon}
            </button>
          )
        )}
      </div>

      {/* Textarea */}
      <Textarea
        {...props}
        ref={textareaRef}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`border-0 shadow-none focus-visible:ring-0 rounded-t-none resize-y min-h-[120px] ${className || ""}`}
      />
    </div>
  );
}
