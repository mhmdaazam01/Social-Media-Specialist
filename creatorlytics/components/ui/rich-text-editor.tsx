import * as React from "react";
import DOMPurify from "isomorphic-dompurify";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Type
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

// Allowed HTML tags for the rich text editor - no scripts, no event handlers
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'u', 'ul', 'ol', 'li', 'p', 'br', 'span', 'strong', 'em'],
  ALLOWED_ATTR: [] as string[],
  KEEP_CONTENT: true,
};

export function RichTextEditor({ value, onValueChange, placeholder, className, readOnly }: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);
  const lastValue = React.useRef(value);
  const onValueChangeRef = React.useRef(onValueChange);

  // Keep the ref updated with the latest callback from the parent
  // without triggering re-renders or invalidating callbacks
  React.useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  // Sync external value changes (e.g. initial load or clearing the form)
  React.useEffect(() => {
    if (editorRef.current && value !== lastValue.current) {
      // Avoid overwriting innerHTML if the user is currently typing (focused).
      // This prevents React's asynchronous state updates from causing a race condition
      // that resets the cursor position (causing "reverse typing").
      if (document.activeElement !== editorRef.current) {
        // ✅ Sanitize before writing to DOM to prevent XSS
        editorRef.current.innerHTML = DOMPurify.sanitize(value, PURIFY_CONFIG);
        lastValue.current = value;
      }
    }
  }, [value]);

  const handleInput = React.useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    // ✅ Sanitize output before passing to parent - prevents stored XSS
    const clean = DOMPurify.sanitize(html, PURIFY_CONFIG);
    lastValue.current = clean;
    onValueChangeRef.current(clean);
  }, []); // Empty dependency array = never changes

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;");
    }
  }, []); // Empty dependency array = never changes

  const execCommand = (command: string, e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand(command, false);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      // ✅ Sanitize after execCommand as well
      const clean = DOMPurify.sanitize(html, PURIFY_CONFIG);
      lastValue.current = clean;
      onValueChangeRef.current(clean);
      editorRef.current.focus();
    }
  };

  // We only run this useMemo ONCE on mount (deps will never change).
  const [initialValue] = React.useState(
    // ✅ Sanitize initial value on mount to prevent stored XSS from DB
    DOMPurify.sanitize(value, PURIFY_CONFIG)
  );
  const editorElement = React.useMemo(() => (
    <div
      ref={editorRef}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className="w-full h-full p-3 text-sm outline-none overflow-y-auto whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_b]:font-bold [&_i]:italic"
      style={{ minHeight: "120px" }}
      dangerouslySetInnerHTML={{ __html: initialValue }}
    />
  ), [initialValue, handleInput, handleKeyDown]); // NEVER RE-RENDER

  return (
    <div className={`flex flex-col rounded-md border bg-transparent shadow-sm transition-colors ${
      isFocused ? "border-ring ring-1 ring-ring" : "border-input"
    } ${className || ""}`}>
      
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex items-center gap-1 border-b border-input px-2 py-1.5 bg-muted/30">
          <Type className="size-3.5 text-muted-foreground mr-1" />
        <div className="h-4 w-px bg-border mx-1" />
        
        <button
          type="button"
          onMouseDown={(e) => execCommand("bold", e)}
          title="Bold"
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => execCommand("italic", e)}
          title="Italic"
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
        >
          <Italic className="size-3.5" />
        </button>
        
        <div className="h-4 w-px bg-border mx-1" />
        
        <button
          type="button"
          onMouseDown={(e) => execCommand("insertUnorderedList", e)}
          title="Bullet List"
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
        >
          <List className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => execCommand("insertOrderedList", e)}
          title="Numbered List"
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-sm transition-colors"
        >
          <ListOrdered className="size-3.5" />
          </button>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative flex-1 min-h-[120px]">
        {/* Placeholder */}
        {(!value || value === "<br>") && (
          <div className="absolute top-3 left-3 text-sm text-muted-foreground pointer-events-none">
            {placeholder}
          </div>
        )}
        {editorElement}
      </div>
    </div>
  );
}
