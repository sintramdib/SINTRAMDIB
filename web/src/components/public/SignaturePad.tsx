import { useCallback, useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface Props {
  onChange: (dataUrl: string | null) => void;
}

/**
 * Área de assinatura digital com canvas (suporta toque, mouse e caneta/stylus
 * via Pointer Events). Oferece desfazer, refazer e limpar.
 */
export function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const strokesRef = useRef<Point[][]>([]);
  const redoRef = useRef<Point[][]>([]);
  const drawingRef = useRef(false);

  const [hasStroke, setHasStroke] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const exportPng = useCallback((canvas: HTMLCanvasElement): string | null => {
    try {
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }, []);

  const redraw = useCallback(
    (canvas: HTMLCanvasElement, strokes: Point[][]) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1e293b';
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (const stroke of strokes) {
        if (stroke.length === 0) continue;
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
          ctx.lineTo(stroke[i].x, stroke[i].y);
        }
        ctx.stroke();
      }
    },
    [],
  );

  const syncState = useCallback(
    (canvas: HTMLCanvasElement) => {
      const has = strokesRef.current.length > 0;
      setHasStroke(has);
      setCanUndo(strokesRef.current.length > 0);
      setCanRedo(redoRef.current.length > 0);
      onChange(has ? exportPng(canvas) : null);
    },
    [onChange, exportPng],
  );

  const getPos = (e: React.PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drawingRef.current = true;
    redoRef.current = [];
    strokesRef.current = [...strokesRef.current, [getPos(e)]];
    redraw(canvasRef.current, strokesRef.current);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current || !canvasRef.current) return;
    e.preventDefault();
    const strokes = strokesRef.current;
    strokes[strokes.length - 1].push(getPos(e));
    strokesRef.current = strokes;
    redraw(canvasRef.current, strokes);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    drawingRef.current = false;
    if (canvasRef.current) syncState(canvasRef.current);
  };

  const undo = () => {
    if (!canvasRef.current) return;
    if (strokesRef.current.length === 0) return;
    const popped = strokesRef.current[strokesRef.current.length - 1];
    redoRef.current = [...redoRef.current, popped];
    strokesRef.current = strokesRef.current.slice(0, -1);
    redraw(canvasRef.current, strokesRef.current);
    syncState(canvasRef.current);
  };

  const redo = () => {
    if (!canvasRef.current) return;
    if (redoRef.current.length === 0) return;
    const popped = redoRef.current[redoRef.current.length - 1];
    redoRef.current = redoRef.current.slice(0, -1);
    strokesRef.current = [...strokesRef.current, popped];
    redraw(canvasRef.current, strokesRef.current);
    syncState(canvasRef.current);
  };

  const clear = () => {
    if (!canvasRef.current) return;
    strokesRef.current = [];
    redoRef.current = [];
    redraw(canvasRef.current, []);
    syncState(canvasRef.current);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d');
    redraw(canvas, []);
    const onResize = () => {
      if (canvas) {
        redraw(canvas, strokesRef.current);
        syncState(canvas);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="overflow-hidden rounded-lg border-2 border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          className="block h-44 w-full cursor-crosshair"
          style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={undo} disabled={!canUndo} className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-100">
          Desfazer
        </button>
        <button type="button" onClick={redo} disabled={!canRedo} className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-100">
          Refazer
        </button>
        <button type="button" onClick={clear} disabled={!hasStroke} className="rounded border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 disabled:opacity-40 hover:bg-red-50">
          Limpar
        </button>
      </div>
    </div>
  );
}