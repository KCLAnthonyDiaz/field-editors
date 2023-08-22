export { default as RichTextEditor } from './RichTextEditor';
export { ConnectedRichTextEditor } from './RichTextEditor';

export { openRichTextDialog } from './dialogs/openRichTextDialog';
export { renderRichTextDialog } from './dialogs/renderRichTextDialog';

// Custom supports
//   In order to effectively use the editor, we have to expose quite a bit of the internal APIs.
export * as RichTextEditorHelpers from './helpers/editor';
export * as RichTextContentfulEditorProvider from './ContentfulEditorProvider';
