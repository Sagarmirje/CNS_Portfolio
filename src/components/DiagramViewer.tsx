import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, X, FileText } from 'lucide-react';
import { Accordion } from './Accordion';

interface DiagramViewerProps {
  src: string;
  alt: string;
  caption: string;
  title: string;
  textEquivalentTitle?: string;
  textEquivalent: React.ReactNode;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({
  src,
  alt,
  caption,
  title,
  textEquivalentTitle = 'Accessible Text Equivalent & Stacked Walkthrough',
  textEquivalent,
}) => {
  const [zoom, setZoom] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const zoomIn = () => setZoom((z) => Math.min(2.2, Number((z + 0.25).toFixed(2))));
  const zoomOut = () => setZoom((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))));
  const resetZoom = () => setZoom(1);

  return (
    <div className="rounded-2xl border border-[#1e2d4a] bg-[#0b1324] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2d4a] bg-[#0e182e] px-4 py-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-white sm:text-base">{title}</h3>
          <p className="font-mono text-[11px] text-slate-400">
            Zoom: {Math.round(zoom * 100)}% • Scroll horizontally when zoomed on mobile
          </p>
        </div>

        <div className="flex items-center gap-1.5" role="group" aria-label="Diagram zoom controls">
          <button
            type="button"
            onClick={zoomOut}
            disabled={zoom <= 0.75}
            className="inline-flex items-center gap-1 rounded-lg border border-[#1e2d4a] bg-[#060b16] px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400/50 disabled:opacity-40"
            aria-label="Zoom out diagram"
          >
            <ZoomOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">-</span>
          </button>
          <button
            type="button"
            onClick={resetZoom}
            className="inline-flex items-center gap-1 rounded-lg border border-[#1e2d4a] bg-[#060b16] px-2.5 py-1.5 font-mono text-xs text-slate-200 hover:border-cyan-400/50"
            aria-label="Reset diagram zoom"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{Math.round(zoom * 100)}%</span>
          </button>
          <button
            type="button"
            onClick={zoomIn}
            disabled={zoom >= 2.2}
            className="inline-flex items-center gap-1 rounded-lg border border-[#1e2d4a] bg-[#060b16] px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400/50 disabled:opacity-40"
            aria-label="Zoom in diagram"
          >
            <ZoomIn className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">+</span>
          </button>
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1.5 text-xs font-medium text-cyan-200 hover:bg-cyan-400/20"
            aria-label="Open fullscreen diagram view"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Expand</span>
          </button>
        </div>
      </div>

      {/* Scrollable Diagram Canvas */}
      <div className="overflow-auto bg-[#070d19] p-4 sm:p-6">
        <div
          className="mx-auto transition-transform duration-200 origin-top-left"
          style={{ width: `${zoom * 100}%`, minWidth: zoom > 1 ? `${zoom * 100}%` : '100%' }}
        >
          <img
            src={src}
            alt={alt}
            className="w-full rounded-xl border border-[#1e2d4a] bg-white shadow-2xl"
          />
        </div>
      </div>

      {/* Caption */}
      <div className="border-t border-[#1e2d4a] bg-[#0b1324] px-4 py-3 sm:px-6">
        <p className="text-xs leading-relaxed text-slate-300 sm:text-sm">{caption}</p>

        <div className="mt-3">
          <Accordion
            title={textEquivalentTitle}
            icon={<FileText className="h-4 w-4 text-cyan-300" />}
            defaultOpen={false}
          >
            {textEquivalent}
          </Accordion>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 p-4 backdrop-blur-sm sm:p-6"
        >
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-display text-base font-semibold text-white">{title}</h4>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-400"
            >
              <X className="h-4 w-4" /> Close
            </button>
          </div>
          <div className="flex-1 overflow-auto rounded-xl border border-[#1e2d4a] bg-[#060b16] p-4">
            <img src={src} alt={alt} className="mx-auto max-h-none w-full max-w-6xl rounded-lg bg-white" />
          </div>
          <p className="mt-3 text-xs text-slate-300">{caption}</p>
        </div>
      )}
    </div>
  );
};
