'use client';

import React, { useEffect, useState } from 'react';
import { BrailleDots } from '@/types/braille';
import { UnicodeBrailleConverter } from '@/lib/unicode-braille-converter';
import { BrailleSymbol } from './BrailleSymbol';

const NUMPAD_TO_DOT_INDEX: Record<string, number> = {
  Numpad7: 0,
  Numpad4: 1,
  Numpad1: 2,
  Numpad8: 3,
  Numpad5: 4,
  Numpad2: 5
};

const DOT_TO_NUMPAD_KEY = ['7', '4', '1', '8', '5', '2'];

interface BrailleVirtualKeyboardProps {
  onSymbolAdd: (dots: BrailleDots, unicodeChar: string) => void;
  onBackspace: () => void;
  onClear: () => void;
}

/**
 * Teclado Braille virtual con celdas 2×3
 * Permite seleccionar puntos activos para generar símbolos Braille
 */
export const BrailleVirtualKeyboard: React.FC<BrailleVirtualKeyboardProps> = ({
  onSymbolAdd,
  onBackspace,
  onClear
}) => {
  const [activeDots, setActiveDots] = useState<BrailleDots>([
    false, false, false, false, false, false
  ]);
  const isBlankSymbol = activeDots.every(d => !d);

  /**
   * Alterna un punto específico
   */
  const toggleDot = (index: number) => {
    setActiveDots((currentDots) => {
      const newDots = [...currentDots] as BrailleDots;
      newDots[index] = !newDots[index];
      return newDots;
    });
  };

  /**
   * Agrega el símbolo actual
   */
  const handleAddSymbol = () => {
    const unicodeChar = UnicodeBrailleConverter.dotsToUnicode(activeDots);
    onSymbolAdd(activeDots, unicodeChar);
    // Resetear puntos después de agregar
    setActiveDots([false, false, false, false, false, false]);
  };

  useEffect(() => {
    const handlePhysicalKeyboard = (event: KeyboardEvent) => {
      if (event.repeat) return;

      const dotIndex = NUMPAD_TO_DOT_INDEX[event.code];
      if (dotIndex !== undefined) {
        event.preventDefault();
        toggleDot(dotIndex);
        return;
      }

      if (event.code === 'NumpadEnter' || event.code === 'Enter') {
        event.preventDefault();
        handleAddSymbol();
        return;
      }

      if (event.code === 'Backspace') {
        event.preventDefault();
        onBackspace();
      }
    };

    window.addEventListener('keydown', handlePhysicalKeyboard);

    return () => {
      window.removeEventListener('keydown', handlePhysicalKeyboard);
    };
  });

  /**
   * Renderiza un punto individual
   */
  const renderDot = (index: number, row: number, col: number) => {
    const dotNumber = index + 1;
    const shortcutKey = DOT_TO_NUMPAD_KEY[index];
    return (
      <button
        key={index}
        onClick={() => toggleDot(index)}
        className={`
          w-12 h-12 rounded-full border-2 transition-all duration-200
          flex items-center justify-center text-sm font-semibold
          ${activeDots[index]
            ? 'bg-blue-600 border-blue-800 text-white shadow-lg'
            : 'bg-gray-200 border-gray-300 text-gray-500 hover:bg-gray-300'
          }
        `}
        aria-label={`Punto ${dotNumber}. Tecla ${shortcutKey} del teclado numerico`}
        aria-pressed={activeDots[index]}
        title={`Tecla ${shortcutKey} del teclado numerico`}
      >
        <span className="flex flex-col items-center leading-none">
          <span>{dotNumber}</span>
          <span className="mt-1 text-[10px] opacity-75">N{shortcutKey}</span>
        </span>
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Teclado Braille Virtual
      </h3>
      
      {/* Celda Braille 2×3 */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-300">
          <div className="grid grid-cols-2 gap-4">
            {/* Fila 1: Puntos 1, 4 */}
            {renderDot(0, 0, 0)}
            {renderDot(3, 0, 1)}
            
            {/* Fila 2: Puntos 2, 5 */}
            {renderDot(1, 1, 0)}
            {renderDot(4, 1, 1)}
            
            {/* Fila 3: Puntos 3, 6 */}
            {renderDot(2, 2, 0)}
            {renderDot(5, 2, 1)}
          </div>
        </div>
      </div>

      {/* Vista previa del símbolo */}
      <div className="flex justify-center mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
          <div className="text-sm text-gray-600 mb-2">Símbolo actual:</div>
          <div className="flex justify-center mb-2">
            <BrailleSymbol
              dots={activeDots}
              size="md"
              displayMode="dots"
            />
          </div>
          <div className="text-xs text-gray-500 font-mono">
            [{activeDots.map(d => d ? '1' : '0').join(',')}]
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={handleAddSymbol}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          {isBlankSymbol ? 'Agregar Espacio' : 'Agregar Simbolo'}
        </button>
        
        <button
          onClick={onBackspace}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
        >
          ← Borrar
        </button>
        
        <button
          onClick={onClear}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
        >
          Limpiar Todo
        </button>
      </div>

      {/* Instrucciones */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Usa 7, 4, 1 y 8, 5, 2 del teclado numerico para alternar puntos.</p>
        <p className="text-xs mt-1">Enter agrega el cuadratin actual; Backspace borra el ultimo.</p>
      </div>
    </div>
  );
};
