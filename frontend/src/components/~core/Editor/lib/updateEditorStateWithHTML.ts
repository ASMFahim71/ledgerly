import { $generateNodesFromDOM } from "@lexical/html";
import { $createParagraphNode, $getRoot, $insertNodes, $setSelection, CLEAR_HISTORY_COMMAND, LexicalEditor } from "lexical";

export const updateEditorStateWithHTML = (htmlContent: string, editor: LexicalEditor) => {
  editor.update(() => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(htmlContent, 'text/html');
    const nodes = $generateNodesFromDOM(editor, dom);
    const validNodesToInsert = nodes.map(node => {
      const paragraphNode = $createParagraphNode();

      if (node.getType() === 'text') {
        paragraphNode.append(node);
        return paragraphNode;
      } else {
        return node;
      }
    });
    $getRoot().clear();
    $insertNodes(validNodesToInsert);
    $setSelection(null);

    editor.dispatchCommand(CLEAR_HISTORY_COMMAND, void 0);
  });
};
