import { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";

export const getLanguageExtention = (filename: string): Extension => {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return javascript();

    case "ts":
    case "tsx":
      return javascript({ typescript: true, jsx: ext === "tsx" });

    case "html":
    case "htm":
      return html();

    case "css":
    case "scss":
    case "sass":
      return css();

    case "json":
      return json();

    case "md":
    case "markdown":
    case "mdx":
      return markdown();

    case "py":
    case "pyw":
      return python();

    default:
      return [];
  }
};