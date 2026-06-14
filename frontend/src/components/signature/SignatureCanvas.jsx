import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button";

function SignatureCanvas({ onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });
  const hasSignatureRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  const resizeCanvasToContainer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    // prevent pixelation on high-dpi displays
    const ratio = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    const width = Math.max(300, Math.floor(rect.width));
    const height = 160;

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // solid white background prevents transparent PNG artifacts
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "black";
  };

  const getPoint = (e) => {
    // offset coordinate calculations relative to canvas element
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  const startDraw = (e) => {
    if (!canvasRef.current) return;
    drawingRef.current = true;
    lastPointRef.current = getPoint(e);
    hasSignatureRef.current = true;
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { x, y } = getPoint(e);
    const last = lastPointRef.current;

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = { x, y };
    // notify parent of updates
    triggerChange();
  };

  const endDraw = () => {
    drawingRef.current = false;
    triggerChange();
  };

  const triggerChange = () => {
    // dispatch signature blob to parent handler
    if (!onChange || !canvasRef.current) return;
    if (!hasSignatureRef.current) return;

    const canvas = canvasRef.current;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onChange(blob);
      },
      "image/png",
      0.95
    );
  };

  const clear = () => {
    if (!canvasRef.current) return;
    resizeCanvasToContainer();
    hasSignatureRef.current = false;
    setHasSignature(false);
    onChange?.(null);
  };

  useEffect(() => {
    resizeCanvasToContainer();
    const handle = () => resizeCanvasToContainer();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <div className="w-full border rounded bg-white">
        <canvas
          ref={canvasRef}
          className="block"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={(e) => startDraw(e.touches[0])}
          onTouchMove={(e) => {
            e.preventDefault();
            if (e.touches[0]) draw(e.touches[0]);
          }}
          onTouchEnd={endDraw}
        />
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}

export default SignatureCanvas;

