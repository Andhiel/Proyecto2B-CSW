/**
 * @fileoverview Componente para mostrar texto Braille transcribido
 * @author Kevin Palacios
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { BrailleSymbol } from './BrailleSymbol';
import { BrailleOutput } from '@/types/braille';
import { Button } from '@/components/ui/Button';
import { Download, Eye, Settings, Grid, List, Printer } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BrailleDisplayProps {
  /** Resultado de la transcripción a mostrar */
  transcriptionResult: BrailleOutput;
  
  /** Clases CSS adicionales */
  className?: string;
  
  /** Callback para exportar resultados */
  onExport?: (format: 'text' | 'json' | 'pdf') => void;
}

/**
 * Componente que muestra el resultado de la transcripción Braille
 * Permite diferentes modos de visualización y exportación
 */
export const BrailleDisplay: React.FC<BrailleDisplayProps> = ({
  transcriptionResult,
  className,
  onExport
}) => {
  const [displayMode, setDisplayMode] = useState<'dots' | 'binary' | 'unicode'>('dots');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSettings, setShowSettings] = useState(false);
  const [mirrorMode, setMirrorMode] = useState(false);
  
  const { symbols, tokens, brailleText, statistics } = transcriptionResult;
  
  /**
   * Renderiza los símbolos en modo grid
   */
  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {symbols.map((symbol, index) => (
        <div
          key={index}
          className="flex flex-col items-center space-y-2"
        >
          <BrailleSymbol
            dots={symbol.dots}
            size="md"
            displayMode={displayMode}
            interactive
            onClick={() => {
              // Future: show symbol details
            }}
          />
          <span className="text-xs text-gray-600 font-mono">
            {symbol.character}
          </span>
        </div>
      ))}
    </div>
  );
  
  /**
   * Renderiza los símbolos en modo lista horizontal
   */
  const renderListView = () => (
    <div className="flex flex-wrap gap-3 p-4">
      {symbols.map((symbol, index) => (
        <div
          key={index}
          className="flex items-center space-x-2"
        >
          <BrailleSymbol
            dots={symbol.dots}
            size="sm"
            displayMode={displayMode}
          />
          <span className="text-sm text-gray-600 font-mono">
            {symbol.character}
          </span>
        </div>
      ))}
    </div>
  );
  
  /**
   * Renderiza la vista de texto plano
   */
  const renderTextView = () => (
    <div className="p-4 bg-gray-50 rounded-lg">
      <pre className="font-mono text-sm whitespace-pre-wrap break-all">
        {brailleText}
      </pre>
    </div>
  );
  
  /**
   * Maneja la impresión en modo espejo con diseño profesional
   */
  const handlePrint = () => {
    // Crear contenido para imprimir con diseño profesional
    const symbolsHtml = symbols.map((symbol, index) => {
      // Invertir puntos horizontalmente si está en modo espejo
      const mirroredDots = mirrorMode 
        ? [symbol.dots[3], symbol.dots[4], symbol.dots[5], symbol.dots[0], symbol.dots[1], symbol.dots[2]]
        : symbol.dots;
      
      // Grid 3 filas × 2 columnas (vertical) - estándar Braille
      const dotsGrid = [
        mirroredDots[0], mirroredDots[3], // Fila 1: puntos 1, 4
        mirroredDots[1], mirroredDots[4], // Fila 2: puntos 2, 5
        mirroredDots[2], mirroredDots[5]  // Fila 3: puntos 3, 6
      ];
      
      // Crear cuadratín con diseño profesional - puntos dentro del cuadratín
      const dotsHtml = dotsGrid.map((dot, i) => {
        const dotStyle = dot 
          ? 'background: #000; width: 8px; height: 8px; border-radius: 50%;'
          : 'background: #e0e0e0; width: 8px; height: 8px; border-radius: 50%;';
        return `<div style="${dotStyle} display: inline-block;"></div>`;
      }).join('');
      
      return `
        <div style="
          display: inline-block; 
          border: 2px solid #000; 
          padding: 6px; 
          margin: 6px; 
          width: 40px; 
          height: 60px;
          background: white;
          box-sizing: border-box;
          vertical-align: top;
        ">
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 1fr); gap: 4px; height: 100%;">
            ${dotsGrid.map((dot, i) => `
              <div style="display: flex; align-items: center; justify-content: center;">
                <div style="${dot ? 'background: #000;' : 'background: #e0e0e0;'} width: 12px; height: 12px; border-radius: 50%;"></div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 30px; max-width: 100%;">
        <!-- Encabezado -->
        <div style="border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="margin: 0; color: #000; font-size: 24px; font-weight: bold;">
            Transcripción Braille
          </h1>
          <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">
            ${mirrorMode ? '⚠️ MODO ESPEJO - Para uso con punzones' : 'Vista normal'}
          </p>
        </div>
        
        <!-- Información del documento -->
        <div style="background: #f5f5f5; padding: 15px; margin-bottom: 30px; border-left: 4px solid #000;">
          <p style="margin: 5px 0; font-size: 14px; color: #333;">
            <strong>Texto original:</strong> ${transcriptionResult.originalText}
          </p>
          <p style="margin: 5px 0; font-size: 14px; color: #333;">
            <strong>Total de símbolos:</strong> ${symbols.length}
          </p>
          <p style="margin: 5px 0; font-size: 14px; color: #333;">
            <strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}
          </p>
        </div>
        
        <!-- Cuadratines Braille -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; line-height: 1;">
          ${symbolsHtml}
        </div>
        
        <!-- Instrucciones -->
        <div style="margin-top: 40px; padding: 20px; background: #e8f4f8; border-radius: 8px; border: 1px solid #b8d4e3;">
          <h3 style="margin: 0 0 10px 0; color: #0056b3; font-size: 16px;">Instrucciones de uso:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333; font-size: 13px; line-height: 1.6;">
            <li>Cada cuadratín representa un carácter en Braille</li>
            <li>Los puntos negros deben punzonarse con el punzón</li>
            <li>Los puntos grises son guías de referencia</li>
            ${mirrorMode ? '<li>Esta hoja está en modo espejo para punzonar por el reverso</li>' : '<li>Para punzonar, activa el modo espejo en la configuración</li>'}
          </ul>
        </div>
        
        <!-- Pie de página -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #999; font-size: 12px;">
          Generado con Transcriptor Braille - Estándar Unicode Braille
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Impresión Braille</title>
          <style>
            @media print {
              @page {
                margin: 1cm;
                size: A4;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };
  
  /**
   * Renderiza las estadísticas
   */
  const renderStatistics = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-blue-900 mb-3">
        Estadísticas de Transcripción
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Caracteres totales</div>
          <div className="font-semibold text-blue-900">
            {statistics.totalCharacters}
          </div>
        </div>
        <div>
          <div className="text-gray-600">Símbolos Braille</div>
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
    <div className={cn('bg-white rounded-lg shadow-lg border border-gray-200', className)}>
      {/* Header con controles */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Resultado Braille
            </h2>
            <p className="text-sm text-gray-600">
              {symbols.length} símbolos generados
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Controles de visualización */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={displayMode === 'dots' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('dots')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant={displayMode === 'binary' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('binary')}
              >
                101
              </Button>
              <Button
                variant={displayMode === 'unicode' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDisplayMode('unicode')}
              >
                Br
              </Button>
            </div>
            
            {/* Controles de vista */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Exportación */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                title="Imprimir"
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport?.('text')}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Panel de configuración */}
      {showSettings && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Opciones de Exportación
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('text')}
            >
              Exportar como Texto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('json')}
            >
              Exportar como JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport?.('pdf')}
            >
              Exportar como PDF
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="mirror-mode"
              checked={mirrorMode}
              onChange={(e) => setMirrorMode(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="mirror-mode" className="text-sm text-gray-700">
              Modo espejo para punzones (invierte horizontalmente)
            </label>
          </div>
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
        {displayMode === 'unicode' ? (
          renderTextView()
        ) : viewMode === 'grid' ? (
          renderGridView()
        ) : (
          renderListView()
        )}
      </div>
      
      {/* Estadísticas */}
      <div className="border-t border-gray-200 p-4">
        {renderStatistics()}
      </div>
    </div>
  );
};

export default BrailleDisplay;
