import { Editor } from "@tinymce/tinymce-react";

export default function RichText({ value, onChange, label }) {
  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>}
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        value={value || ""}
        onEditorChange={onChange}
        init={{
          height: 360,
          menubar: false,
          branding: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "charmap",
            "preview",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "table",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic | bullist numlist | link | removeformat | code",
          content_style:
            "body { font-family: Inter, sans-serif; font-size: 15px; color: #44403b; }",
        }}
      />
    </div>
  );
}
