/**
 * @fileoverview Componente para visualizar símbolos Braille (cuadratín)
 * @author Kevin Palacios
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { cn } from '@/utils/cn';
import { BrailleDots } from '@/types/braille';

export interface BrailleSymbolProps {
  /** Array de 6 booleanos representando los puntos [1,2,3,4,5,6] */
  dots: BrailleDots;
  
  /** Tamaño del símbolo */
  size?: 'sm' | 'md' | 'lg';
  
  /** Clases CSS adicionales */
  className?: string;
  
  /** Modo de visualización */
  displayMode?: 'dots' | 'binary' | 'unicode';
  
  /** Si es interactivo (clickable) */
  interactive?: boolean;
  
  /** Callback al hacer click */
  onClick?: () => void;
}

/**
 * Componente que renderiza un símbolo Braille individual
 * Muestra el cuadratín con 6 puntos en la posición correcta
 */
export const BrailleSymbol: React.FC<BrailleSymbolProps> = ({
  dots,
  size = 'md',
  className,
  displayMode = 'dots',
  interactive = false,
  onClick
}) => {
  // Tamaños predefinidos para el cuadratín (3 filas × 2 columnas)
  const sizeClasses = {
    sm: 'w-8 h-12',
    md: 'w-12 h-16',
    lg: 'w-16 h-20'
  };
  
  // Tamaños de los puntos
  const dotSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  // Renderizado en modo de puntos visuales (grid 3 filas × 2 columnas)
  if (displayMode === 'dots') {
    return (
      <div
        className={cn(
          'relative grid grid-cols-2 grid-rows-3 gap-2 p-2 border-2 border-gray-300 rounded bg-white dark:bg-slate-950 dark:border-slate-600',
          sizeClasses[size],
          interactive && 'cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors',
          className
        )}
        onClick={interactive ? onClick : undefined}
        role={interactive ? 'button' : 'img'}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        } : undefined}
        aria-label={`Símbolo Braille: ${dotsToDescription(dots)}`}
      >
        {/* Punto 1 - fila 1, columna 1 */}
        <div
          className={cn(
            'rounded-full transition-colors justify-self-center self-center',
            dotSizes[size],
            dots[0] ? 'bg-gray-900 dark:bg-slate-100' : 'bg-gray-200 dark:bg-slate-700'
          )}
          aria-hidden="true"
        />
        
        {/* Punto 4 - fila 1, columna 2 */}
        <div
          className={cn(
            'rounded-full transition-colors justify-self-center self-center',
            dotSizes[size],
            dots[3] ? 'bg-gray-900 dark:bg-slate-100' : 'bg-gray-200 dark:bg-slate-700'
          )}
          aria-hidden="true"
        />
        
        {/* Punto 2 - fila 2, columna 1 */}
        <div
          className={cn(
            'rounded-full transition-colors justify-self-center self-center',
            dotSizes[size],
            dots[1] ? 'bg-gray-900 dark:bg-slate-100' : 'bg-gray-200 dark:bg-slate-700'
          )}
          aria-hidden="true"
        />
        
        {/* Punto 5 - fila 2, columna 2 */}
        <div
          className={cn(
            'rounded-full transition-colors justify-self-center self-center',
            dotSizes[size],
            dots[4] ? 'bg-gray-900 dark:bg-slate-100' : 'bg-gray-200 dark:bg-slate-700'
          )}
          aria-hidden="true"
        />
        
        {/* Punto 3 - fila 3, columna 1 */}
        <div
          className={cn(
            'rounded-full transition-colors justify-self-center self-center',
            dotSizes[size],
            dots[2] ? 'bg-gray-900 dark:bg-slate-100' : 'bg-gray-200 dark:bg-slate-700'
          )}
          aria-hidden="true"
        />
        
        {/* Punto 6 - fila 3, columna 2 */}
        <div
          className={cn(
            'rounded-full transition-colors justify-self-center self-center',
            dotSizes[size],
            dots[5] ? 'bg-gray-900 dark:bg-slate-100' : 'bg-gray-200 dark:bg-slate-700'
          )}
          aria-hidden="true"
        />
      </div>
    );
  }
  
  // Renderizado en modo binario
  if (displayMode === 'binary') {
    const binaryString = dots.map(dot => dot ? '1' : '0').join('');
    return (
      <code
        className={cn(
          'font-mono text-xs bg-gray-100 dark:bg-muted px-2 py-1 rounded border border-gray-300 dark:border-border',
          interactive && 'cursor-pointer hover:bg-gray-200 dark:hover:bg-accent transition-colors',
          className
        )}
        onClick={interactive ? onClick : undefined}
        role={interactive ? 'button' : 'code'}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        } : undefined}
        aria-label={`Representación binaria: ${binaryString}`}
      >
        {binaryString}
      </code>
    );
  }
  
  // Renderizado en modo unicode (placeholder para futuro)
  return (
    <span
      className={cn(
        'font-mono',
        interactive && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-accent px-1 rounded transition-colors',
        className
      )}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : 'text'}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      ⠿
    </span>
  );
};

/**
 * Convierte puntos Braille a descripción textual
 * @param dots Array de 6 booleanos
 * @returns Descripción de los puntos activos
 */
function dotsToDescription(dots: BrailleDots): string {
  const activePoints: number[] = [];
  dots.forEach((dot, index) => {
    if (dot) {
      activePoints.push(index + 1);
    }
  });
  
  if (activePoints.length === 0) {
    return 'Espacio';
  }
  
  if (activePoints.length === 1) {
    return `Punto ${activePoints[0]}`;
  }
  
  return `Puntos ${activePoints.join(', ')}`;
}

export default BrailleSymbol;
