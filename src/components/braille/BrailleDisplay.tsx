/**
 * @fileoverview Componente para mostrar texto Braille transcribido
 * @author Kevin Palacios
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { BrailleSymbol } from './BrailleSymbol';
import { BrailleDots, BrailleOutput } from '@/types/braille';
import { Button } from '@/components/ui/Button';
import { Download, Eye, FileSearch } from 'lucide-react';
import { cn } from '@/utils/cn';
import { UnicodeBrailleConverter } from '@/lib/unicode-braille-converter';

export interface BraillePrintLayoutOptions {
  cellWidthMm: number;
  cellHeightMm: number;
  cellsPerLine: number;
  cellGapMm: number;
  rowGapMm: number;
}

export interface BrailleExportOptions {
  mirrorMode?: boolean;
  layout?: BraillePrintLayoutOptions;
  preview?: boolean;
}

export interface BrailleDisplayProps {
  /** Resultado de la transcripcion a mostrar */
  transcriptionResult: BrailleOutput;

  /** Clases CSS adicionales */
  className?: string;

  /** Callback para exportar resultados */
  onExport?: (format: 'text' | 'json' | 'pdf', options?: BrailleExportOptions) => void;
}

const LETTER_CONTENT_WIDTH_MM = 195.9;
const MIN_CELL_WIDTH_MM = 3;
const MAX_CELL_WIDTH_MM = 20;
const MIN_CELL_HEIGHT_MM = 5;
const MAX_CELL_HEIGHT_MM = 25;
const MIN_CELL_GAP_MM = 0;
const MAX_CELL_GAP_MM = 5;
const MIN_ROW_GAP_MM = 0;
const MAX_ROW_GAP_MM = 12;
const DEFAULT_PRINT_LAYOUT: BraillePrintLayoutOptions = {
  cellWidthMm: 5.5,
  cellHeightMm: 9,
  cellsPerLine: 32,
  cellGapMm: 0.6,
  rowGapMm: 1
};

const clamp = (value: number, min: number, max: number) => (
  Math.min(Math.max(value, min), max)
);

const normalizePrintLayout = (layout: BraillePrintLayoutOptions): BraillePrintLayoutOptions => {
  const cellGapMm = clamp(Number.isFinite(layout.cellGapMm) ? layout.cellGapMm : DEFAULT_PRINT_LAYOUT.cellGapMm, MIN_CELL_GAP_MM, MAX_CELL_GAP_MM);
  const maxCellsPerLine = Math.max(1, Math.floor((LETTER_CONTENT_WIDTH_MM + cellGapMm) / (MIN_CELL_WIDTH_MM + cellGapMm)));
  const cellsPerLine = clamp(Math.round(Number.isFinite(layout.cellsPerLine) ? layout.cellsPerLine : DEFAULT_PRINT_LAYOUT.cellsPerLine), 1, maxCellsPerLine);
  const maxCellWidthForLine = (LETTER_CONTENT_WIDTH_MM - (cellGapMm * (cellsPerLine - 1))) / cellsPerLine;
  const cellWidthMm = clamp(
    Number.isFinite(layout.cellWidthMm) ? layout.cellWidthMm : DEFAULT_PRINT_LAYOUT.cellWidthMm,
    MIN_CELL_WIDTH_MM,
    Math.max(MIN_CELL_WIDTH_MM, Math.min(MAX_CELL_WIDTH_MM, maxCellWidthForLine))
  );
  const cellHeightMm = clamp(Number.isFinite(layout.cellHeightMm) ? layout.cellHeightMm : DEFAULT_PRINT_LAYOUT.cellHeightMm, MIN_CELL_HEIGHT_MM, MAX_CELL_HEIGHT_MM);
  const rowGapMm = clamp(Number.isFinite(layout.rowGapMm) ? layout.rowGapMm : DEFAULT_PRINT_LAYOUT.rowGapMm, MIN_ROW_GAP_MM, MAX_ROW_GAP_MM);

  return {
    cellWidthMm: Number(cellWidthMm.toFixed(2)),
    cellHeightMm: Number(cellHeightMm.toFixed(2)),
    cellsPerLine,
    cellGapMm: Number(cellGapMm.toFixed(2)),
    rowGapMm: Number(rowGapMm.toFixed(2))
  };
};

/**
 * Componente que muestra el resultado de la transcripcion Braille.
 */
export const BrailleDisplay: React.FC<BrailleDisplayProps> = ({
  transcriptionResult,
  className,
  onExport
}) => {
  const [displayMode, setDisplayMode] = useState<'dots' | 'binary' | 'unicode'>('dots');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [mirrorMode, setMirrorMode] = useState(false);
  const [printLayout, setPrintLayout] = useState<BraillePrintLayoutOptions>(DEFAULT_PRINT_LAYOUT);

  const { symbols, brailleText, statistics } = transcriptionResult;

  const mirrorDots = (dots: BrailleDots): BrailleDots => [
    dots[3],
    dots[4],
    dots[5],
    dots[0],
    dots[1],
    dots[2]
  ];

  const getVisibleDots = (dots: BrailleDots): BrailleDots => (
    mirrorMode ? mirrorDots(dots) : dots
  );

  const normalizedPrintLayout = normalizePrintLayout(printLayout);
  const printRowWidthMm = (normalizedPrintLayout.cellsPerLine * normalizedPrintLayout.cellWidthMm)
    + ((normalizedPrintLayout.cellsPerLine - 1) * normalizedPrintLayout.cellGapMm);
  const exportOptions: BrailleExportOptions = { mirrorMode, layout: normalizedPrintLayout };

  const updatePrintLayout = (field: keyof BraillePrintLayoutOptions, value: number) => {
    if (!Number.isFinite(value)) return;
    setPrintLayout((current) => normalizePrintLayout({
      ...current,
      [field]: value
    }));
  };

  const getTextViewContent = () => {
    if (displayMode === 'unicode') {
      return symbols
        .map((symbol) => UnicodeBrailleConverter.dotsToUnicode(getVisibleDots(symbol.dots)))
        .join(' ');
    }

    return brailleText;
  };

  const renderGridView = () => (
    <div
      className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      style={{ direction: mirrorMode ? 'rtl' : 'ltr' }}
    >
      {symbols.map((symbol, index) => (
        <div
          key={index}
          className="flex flex-col items-center space-y-2"
          style={{ direction: 'ltr' }}
        >
          <BrailleSymbol
            dots={getVisibleDots(symbol.dots)}
            size="md"
            displayMode={displayMode}
            interactive
            onClick={() => {
              // Future: show symbol details
            }}
          />
          <span className="font-mono text-xs text-gray-600">
            {symbol.character}
          </span>
        </div>
      ))}
    </div>
  );

  const renderTextView = () => (
    <div className="rounded-lg bg-gray-50 p-4">
      <pre className="whitespace-pre-wrap break-all font-mono text-sm">
        {getTextViewContent()}
      </pre>
    </div>
  );

  const handlePdfPreview = () => {
    onExport?.('pdf', { ...exportOptions, preview: true });
  };

  const renderStatistics = () => (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h3 className="mb-3 text-lg font-semibold text-blue-900">
        Estadisticas de Transcripcion
      </h3>
      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <div>
          <div className="text-gray-600">Caracteres totales</div>
          <div className="font-semibold text-blue-900">
            {statistics.totalCharacters}
          </div>
        </div>
        <div>
          <div className="text-gray-600">Simbolos Braille</div>
          <div className="font-semibold text-blue-900">
            {statistics.totalSymbols}
          </div>
        </div>
        <div>
          <div className="text-gray-600">No reconocidos</div>
          <div className="font-semibold text-red-600">
            {statistics.unrecognizedCharacters}
          </div>
        </div>
        <div>
          <div className="text-gray-600">Tiempo procesamiento</div>
          <div className="font-semibold text-blue-900">
            {statistics.processingTime.toFixed(2)}ms
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white shadow-lg', className)}>
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Resultado Braille
            </h2>
            <p className="text-sm text-gray-600">
              {symbols.length} simbolos generados
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2 rounded-lg bg-gray-100 p-1">
              <Button
                variant={displayMode === 'dots' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('dots')}
                title="Vista visual"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant={displayMode === 'binary' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('binary')}
                title="Vista binaria"
              >
                101
              </Button>
              <Button
                variant={displayMode === 'unicode' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('unicode')}
                title="Vista Unicode"
              >
                Br
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportOptions(!showExportOptions)}
                title="Descargar"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showExportOptions && (
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Opciones de Exportacion
          </h3>
          <div className="mb-4 space-y-4">
            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Cuadratin
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm text-gray-700">
                  <span className="block font-medium">Ancho (mm)</span>
                  <input
                    type="number"
                    min={MIN_CELL_WIDTH_MM}
                    max={MAX_CELL_WIDTH_MM}
                    step="0.1"
                    value={normalizedPrintLayout.cellWidthMm}
                    onChange={(event) => updatePrintLayout('cellWidthMm', Number(event.target.value))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  />
                </label>
                <label className="space-y-1 text-sm text-gray-700">
                  <span className="block font-medium">Alto (mm)</span>
                  <input
                    type="number"
                    min={MIN_CELL_HEIGHT_MM}
                    max={MAX_CELL_HEIGHT_MM}
                    step="0.1"
                    value={normalizedPrintLayout.cellHeightMm}
                    onChange={(event) => updatePrintLayout('cellHeightMm', Number(event.target.value))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Espaciado
              </h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="space-y-1 text-sm text-gray-700">
                  <span className="block font-medium">Cuadratines por linea</span>
                  <input
                    type="number"
                    min={1}
                    step="1"
                    value={normalizedPrintLayout.cellsPerLine}
                    onChange={(event) => updatePrintLayout('cellsPerLine', Number(event.target.value))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  />
                </label>
                <label className="space-y-1 text-sm text-gray-700">
                  <span className="block font-medium">Entre cuadratines (mm)</span>
                  <input
                    type="number"
                    min={MIN_CELL_GAP_MM}
                    max={MAX_CELL_GAP_MM}
                    step="0.1"
                    value={normalizedPrintLayout.cellGapMm}
                    onChange={(event) => updatePrintLayout('cellGapMm', Number(event.target.value))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  />
                </label>
                <label className="space-y-1 text-sm text-gray-700">
                  <span className="block font-medium">Interlineado PDF (mm)</span>
                  <input
                    type="number"
                    min={MIN_ROW_GAP_MM}
                    max={MAX_ROW_GAP_MM}
                    step="0.1"
                    value={normalizedPrintLayout.rowGapMm}
                    onChange={(event) => updatePrintLayout('rowGapMm', Number(event.target.value))}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  />
                </label>
              </div>
            </section>
          </div>
          <div className="mb-3 text-xs font-medium text-gray-600">
            Fila: {printRowWidthMm.toFixed(1)} / {LETTER_CONTENT_WIDTH_MM.toFixed(1)} mm
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePdfPreview}
            >
              <FileSearch className="mr-2 h-4 w-4" />
              Previsualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('text', exportOptions)}
            >
              Exportar como Texto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('json', exportOptions)}
            >
              Exportar como JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('pdf', exportOptions)}
            >
              Exportar como PDF
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="mirror-mode"
              checked={mirrorMode}
              onChange={(event) => setMirrorMode(event.target.checked)}
              className="h-4 w-4 rounded text-blue-600"
            />
            <label htmlFor="mirror-mode" className="text-sm text-gray-700">
              Modo espejo para punzones (invierte puntos y orden horizontal)
            </label>
          </div>
        </div>
      )}

      <div className="max-h-[400px] min-h-[200px] overflow-y-auto">
        {displayMode === 'unicode' ? renderTextView() : renderGridView()}
      </div>

      <div className="border-t border-gray-200 p-4">
        {renderStatistics()}
      </div>
    </div>
  );
};

export default BrailleDisplay;
