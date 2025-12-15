import { GhostHighlight } from "../types";
import { PDFViewer } from "pdfjs-dist/types/web/pdf_viewer";

/**
 * The props type for {@link CanvasHighlightLayer}.
 *
 * @category Component Properties
 * @internal
 */
export interface HighlightLayerProps {
  /**
   * Highlights and GhostHighlights organised by page number.
   */
  highlights: Array<Highlight | GhostHighlight>;

  /**
   * The page number of the PDF document to highlight (1 indexed).
   */
  pageNumber: number;

  /**
   * The PDFViewer instance containing the HighlightLayer
   */
  viewer: PDFViewer;
}

export const CanvasHighlightLayer = () => {

}