import React, { useEffect, useRef } from "react";
import { PDFViewer } from "pdfjs-dist/types/web/pdf_viewer";
import {
  defaultFreeformPreviewStyle,
} from "../lib/canvas";

/**
 * The props type for {@link CanvasInteractionLayer}.
 *
 * @category Component Properties
 * @internal
 */
export interface CanvasInteractionLayerProps {
  /**
   * The page number of the PDF document to highlight (1 indexed).
   */
  pageNumber: number;

  /**
   * The PDFViewer instance containing the HighlightLayer.
   */
  viewer: PDFViewer;

  /**
   * Whether to enable making selections by drawing freeform shapes.
   */
  enableFreeformSelection: (e: MouseEvent) => boolean;

  /**
   * The ratio between screen pixels and CSS pixels, used to keep drawings on the canvas sharp.
   * Typically, the devicePixelRatio property of the window object.
   */
  devicePixelRatio?: number;
}

export const CanvasInteractionLayer = ({
  pageNumber,
  viewer,
  enableFreeformSelection,
  devicePixelRatio = window.devicePixelRatio || 1,
}: CanvasInteractionLayerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef<{ points: { x: number; y: number }[] } | null>(null);

  const viewport = viewer.getPageView(pageNumber - 1).viewport;

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const getCanvasCoords = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const handleMouseDown = (event: PointerEvent) => {
      if (!enableFreeformSelection(event)) return;
      drawing.current = { points: [] };
      const point = getCanvasCoords(event);
      drawing.current.points.push(point);
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    };

    const handleMouseMove = (event: PointerEvent) => {
      if (!drawing.current || !enableFreeformSelection(event)) return;
      const highlightStyle = defaultFreeformPreviewStyle;
      const point = getCanvasCoords(event);
      drawing.current.points.push(point);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = highlightStyle.strokeColor as string;
      ctx.lineWidth = highlightStyle.strokeWidth as number;
      ctx.stroke();
    };

    const handleMouseUp = (event: PointerEvent) => {
      if (!drawing.current || !enableFreeformSelection(event)) return;
      const points = drawing.current.points;
      const firstPoint = points[0];
      const lastPoint = points[points.length - 1];
      if (Math.abs(lastPoint.x - firstPoint.x) > 2 || Math.abs(lastPoint.y - firstPoint.y) > 2) {
        points.push(firstPoint);
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(251, 247, 25, 0.25)";
      ctx.fill();
      drawing.current = null;
    }

    canvas.addEventListener('pointerdown', handleMouseDown);
    canvas.addEventListener("pointermove", handleMouseMove);
    canvas.addEventListener("pointerup", handleMouseUp);

    return () => {
      canvas.removeEventListener("pointerdown", handleMouseDown);
      canvas.removeEventListener("pointermove", handleMouseMove);
      canvas.removeEventListener("pointerup", handleMouseUp);
    }
  });

  return (
    <canvas
      ref={canvasRef}
      className={"PdfHighlighter__interaction-canvas"}
      style={{
        position: "absolute",
        inset: 0,
      }}
    />
  );
};
