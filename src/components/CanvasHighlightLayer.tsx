import React from "react";
import { Highlight, GhostHighlight, LTWH } from "../types";
import { PDFViewer } from "pdfjs-dist/types/web/pdf_viewer";
import { useEffect, useRef } from "react";
import { scaledToViewport } from "../lib/coordinates";
import { defaultHighlightStyle, drawHighlightRectangle } from "../lib/canvas";

/**
 * The props type for {@link CanvasHighlightLayer}.
 *
 * @category Component Properties
 * @internal
 */
export interface CanvasHighlightLayerProps {
  /**
   * Highlights and GhostHighlights organised by page number.
   */
  highlightsByPage: { [pageNumber: number]: Array<Highlight | GhostHighlight> };

  /**
   * The page number of the PDF document to highlight (1 indexed).
   */
  pageNumber: number;

  /**
   * The PDFViewer instance containing the HighlightLayer
   */
  viewer: PDFViewer;

  /**
   * The ratio between screen pixels and CSS pixels, used to keep drawings on the canvas sharp.
   * Typically, the devicePixelRatio property of the window object.
   */
  devicePixelRatio?: number;
}

export const CanvasHighlightLayer = ({
  highlightsByPage,
  pageNumber,
  viewer,
  devicePixelRatio = window.devicePixelRatio || 1,
}: CanvasHighlightLayerProps) => {
  const currentHighlights = highlightsByPage[pageNumber] || [];

  const viewport = viewer.getPageView(pageNumber - 1).viewport;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync the canvas' dimensions and scale to viewport dimensions and devicePixelRatio when they change
  useEffect(() => {
    const canvas = canvasRef.current ?? null;
    if (!canvas) return;

    const canvasWidth = Math.ceil(viewport.width);
    const canvasHeight = Math.ceil(viewport.height);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    canvas.width = Math.floor(canvasWidth * devicePixelRatio);
    canvas.height = Math.floor(canvasHeight * devicePixelRatio);

    const ctx = canvas.getContext("2d");
    ctx?.scale(devicePixelRatio, devicePixelRatio);
  }, [viewport.width, viewport.height, devicePixelRatio]);

  // Draw the highlights
  useEffect(() => {
    const canvas = canvasRef.current ?? null;
    const ctx = canvas?.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, viewport.width, viewport.height);

    for (const highlight of currentHighlights) {
      if (highlight.type === "area") {
        const position: LTWH = scaledToViewport(
          highlight.position.boundingRect,
          viewport,
        );
        drawHighlightRectangle(ctx, position, defaultHighlightStyle);
      } else if (highlight.type === "text") {
        for (const rect of highlight.position.rects) {
          const position: LTWH = scaledToViewport(rect, viewport);
          drawHighlightRectangle(ctx, position, defaultHighlightStyle);
        }
      }
    }
  }, [currentHighlights, viewport, pageNumber]);

  return (
    <canvas
      ref={canvasRef}
      className={"PdfHighlighter__highlight-canvas"}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
    />
  );
};
