import { HighlightStyle, LTWH } from "../types";

/**
 * Style for ghost highlights.
 *
 * @category Canvas Utilities
 * @internal
 */
export const ghostHighlightStyle: HighlightStyle = {
  fillColor: "rgba(251, 247, 25, 0.25)"
};

/**
 * Default highlight style. Used as fallback if no style map or highlight-specific
 * style is provided.
 *
 * @category Canvas Utilities
 * @internal
 */
export const defaultHighlightStyle: HighlightStyle = {
  fillColor: "rgba(255, 92, 0, 0.2)",
  strokeColor: "rgba(190, 81, 3, 0.4)",
  strokeWidth: 2,
  cornerRadius: 2,
};

/**
 * Draw a single highlight rectangle on the canvas using provided style.
 *
 * @category Canvas Utilities
 * @internal
 */
export const drawHighlightRectangle = (
  ctx: CanvasRenderingContext2D,
  position: LTWH,
  style: HighlightStyle,
) => {
  const { left, top, width, height } = position;
  const strokeWidth = style.strokeWidth ?? 0;
  const cornerRadius = style.cornerRadius ?? 0;

  ctx.fillStyle = style.fillColor;
  if (cornerRadius) {
    ctx.fillRect(left, top, width, height);
  } else {
    ctx.roundRect(left, top, width, height, cornerRadius);
  }
  ctx.strokeStyle = style.strokeColor ?? "transparent";
  ctx.lineWidth = strokeWidth;
  if (strokeWidth) {
    ctx.strokeRect(left, top, width, height);
  }
};
