import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool, AlertCircle } from 'lucide-react';
import { Button } from './Buttons';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  receiverName: string;
  onReceiverNameChange: (name: string) => void;
  note?: string;
  onNoteChange?: (note: string) => void;
  isSubmitting?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  receiverName,
  onReceiverNameChange,
  note = '',
  onNoteChange,
  isSubmitting = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set display vs pixel ratio
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setStrokeCount((prev) => prev + 1);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeCount(0);
    setHasDrawn(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn || !receiverName.trim()) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  const isValid = hasDrawn && strokeCount >= 2 && receiverName.trim().length >= 3;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Receiver Name */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
          Recipient Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Mrs. Folashade Adeyemi"
          value={receiverName}
          onChange={(e) => onReceiverNameChange(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
        <p className="text-[11px] text-slate-500 mt-1">Person actually accepting the parcel.</p>
      </div>

      {/* Signature Canvas Box */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <PenTool className="w-3.5 h-3.5 text-emerald-600" />
            Recipient Digital Signature <span className="text-rose-500">*</span>
          </label>
          <button
            type="button"
            onClick={clearCanvas}
            disabled={!hasDrawn}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 disabled:opacity-40"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear / Redo</span>
          </button>
        </div>

        <div className="relative border-2 border-dashed border-slate-300 bg-white rounded-xl overflow-hidden touch-none h-44 shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair"
          />

          {!hasDrawn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 select-none">
              <PenTool className="w-6 h-6 mb-1 text-slate-300" />
              <p className="text-xs font-medium">Sign here using finger or stylus</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Continuous smooth stroke</p>
            </div>
          )}

          {/* Baseline guide line */}
          <div className="absolute bottom-6 left-6 right-6 border-b border-slate-200 pointer-events-none" />
        </div>
      </div>

      {/* Delivery Notes */}
      {onNoteChange && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
            Delivery Remark (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Received at security desk / handed directly to recipient"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      )}

      {/* Validation Warning */}
      {!isValid && (
        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Please enter the recipient's name and draw a signature to enable completion.</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={!isValid || isSubmitting}
        loading={isSubmitting}
        icon={<Check className="w-5 h-5" />}
        className="w-full"
      >
        <span>Confirm Handover & Submit Proof</span>
      </Button>
    </form>
  );
};
