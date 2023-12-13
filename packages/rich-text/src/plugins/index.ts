import * as React from 'react';

import { FieldAppSDK } from '@contentful/app-sdk';
import { PlateProps } from '@udecode/plate-common';
import { createDeserializeDocxPlugin } from '@udecode/plate-serializer-docx';

import { CustomToolbarProps, PlatePlugin } from '../internal/types';
import { createSoftBreakPlugin, createExitBreakPlugin, createResetNodePlugin } from './Break';
import { createCommandPalettePlugin } from './CommandPalette';
import { isCommandPromptPluginEnabled } from './CommandPalette/useCommands';
import { createDragAndDropPlugin } from './DragAndDrop';
import {
  createEmbeddedAssetBlockPlugin,
  createEmbeddedEntryBlockPlugin,
} from './EmbeddedEntityBlock';
import { createEmbeddedEntityInlinePlugin } from './EmbeddedEntityInline';
import { createEmbeddedResourceBlockPlugin } from './EmbeddedResourceBlock';
import { createEmbeddedResourceInlinePlugin } from './EmbeddedResourceInline';
import { createHeadingPlugin } from './Heading';
import { createHrPlugin } from './Hr';
import { createHyperlinkPlugin } from './Hyperlink';
import { createListPlugin } from './List';
import { createMarksPlugin } from './Marks';
import { createNormalizerPlugin } from './Normalizer';
import { createParagraphPlugin } from './Paragraph';
import { createPasteHTMLPlugin } from './PasteHTML';
import { createQuotePlugin } from './Quote';
import { createSelectOnBackspacePlugin } from './SelectOnBackspace';
import { createTablePlugin } from './Table';
import { createTextPlugin } from './Text';
import { createTrackingPlugin, RichTextTrackingActionHandler } from './Tracking';
import { createTrailingParagraphPlugin } from './TrailingParagraph';
import { createVoidsPlugin } from './Voids';

export interface CustomPlatePluginCallback {
  sdk: FieldAppSDK;
  restrictedMarks: Array<string>;
}

// Used purely for tests
export interface CustomAddonConfiguration {
  [index: string]: CustomAddon;
}

// Used purely for tests
export interface CustomAddon {
  plugin?: (constructionArgs: CustomPlatePluginCallback) => PlatePlugin;
  toolbar?: React.JSXElementConstructor<CustomToolbarProps>;
}

export const getPlugins = (
  sdk: FieldAppSDK,
  onAction: RichTextTrackingActionHandler,
  restrictedMarks?: string[],
  preLoadPlugins?: Array<(constructionArgs: CustomPlatePluginCallback) => PlatePlugin>,
  postLoadPlugins?: Array<(constructionArgs: CustomPlatePluginCallback) => PlatePlugin>
): PlatePlugin[] => [
  createDeserializeDocxPlugin(),

  // Tracking - This should come first so all plugins below will have access to `editor.tracking`
  createTrackingPlugin(onAction),

  // Pre-load plugins enable overwriting block handling behavior in the rendering pipeline
  //   In the event you are using pre-load plugins, you SHOULD NOT register toolbars and custom blocks,
  //   save that for post-load phase.  These plugins should attempt to overwrite a default block behavior.
  // We need to check if the post-load-plugins are defined before use because it is an
  // optional parameter.
  ...(Array.isArray(preLoadPlugins)
    ? preLoadPlugins.map((customPluginCallback) => {
        return customPluginCallback.call(this, {
          sdk,
          restrictedMarks: restrictedMarks || [],
        });
      })
    : []),

  // Global / Global shortcuts
  createDragAndDropPlugin(),
  // Enable command palette plugin only, if at least action type is allowed
  ...(Object.values(isCommandPromptPluginEnabled(sdk)).some(Boolean)
    ? [createCommandPalettePlugin()]
    : []),

  // Block Elements
  createParagraphPlugin(),
  createListPlugin(),
  createHrPlugin(),
  createHeadingPlugin(),
  createQuotePlugin(),
  createTablePlugin(),
  createEmbeddedEntryBlockPlugin(sdk),
  createEmbeddedAssetBlockPlugin(sdk),
  createEmbeddedResourceBlockPlugin(sdk),

  // Inline elements
  createHyperlinkPlugin(sdk),
  createEmbeddedEntityInlinePlugin(sdk),
  createEmbeddedResourceInlinePlugin(sdk),

  // Marks
  createMarksPlugin(),

  // Other
  createTrailingParagraphPlugin(),
  createTextPlugin(restrictedMarks),
  createVoidsPlugin(),
  createSelectOnBackspacePlugin(),

  // Pasting content from other sources
  createPasteHTMLPlugin(),

  // These plugins drive their configurations from the list of plugins
  // above. They MUST come last.
  createSoftBreakPlugin(),
  createExitBreakPlugin(),
  createResetNodePlugin(),
  createNormalizerPlugin(),

  // Post-load plugins enable adding new custom functionality
  //   These plugins should attempt to add new functionality to the editor.
  // We need to check if the post-load-plugins are defined before use because it is an
  // optional parameter.
  ...(Array.isArray(postLoadPlugins)
    ? postLoadPlugins.map((customPluginCallback) => {
        return customPluginCallback.call(this, {
          sdk,
          restrictedMarks: restrictedMarks || [],
        });
      })
    : []),
];

export const disableCorePlugins: PlateProps['disableCorePlugins'] = {
  // Note: Enabled by default since v9.0.0 but it causes Cypress's
  // .click() command to fail
  eventEditor: true,
};
