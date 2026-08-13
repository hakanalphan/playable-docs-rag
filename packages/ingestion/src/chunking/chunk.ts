import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // LangChain used only here

export interface Chunk {
  content: string;
  startOffset: number; // char offset in the original document, used for citation display
  endOffset: number;
}

// Splits on markdown-aware separators first (headings, paragraphs), falls back to sentences/words
export async function chunkDocument(content: string, chunkSize: number, chunkOverlap: number): Promise<Chunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap });
  const pieces = await splitter.splitText(content);

  let cursor = 0; // tracks position to compute real offsets, since the splitter doesn't return them
  return pieces.map((piece) => {
    const start = content.indexOf(piece, cursor);
    const startOffset = start === -1 ? cursor : start;
    const endOffset = startOffset + piece.length;
    cursor = endOffset;
    return { content: piece, startOffset, endOffset };
  });
}
