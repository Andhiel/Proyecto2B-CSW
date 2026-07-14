/**
 * @fileoverview Motor de transcripción de Braille a español
 * @author Kevin Palacios
 * @version 1.0.0
 */

import { BrailleDots, BrailleOutput, TranscriptionStatistics } from '@/types/braille';
import { SpanishBrailleMapper } from './braille-mapper';

/**
 * Resultado completo de una transcripcion desde Braille hacia texto espanol.
 *
 * Incluye el texto reconstruido, los simbolos procesados y las metricas de
 * ejecucion necesarias para mostrar estadisticas en la interfaz.
 */
export interface BrailleToSpanishOutput {
  /** Secuencia original de celdas Braille expresada en formato binario. */
  originalBraille: string;

  /** Texto espanol obtenido despues de interpretar puntos, numeros y mayusculas. */
  spanishText: string;

  /** Simbolos procesados junto con el caracter textual que representan. */
  symbols: Array<{ dots: BrailleDots; character: string }>;

  /** Estadisticas de la transcripcion inversa. */
  statistics: TranscriptionStatistics;
}

/**
 * Implementación del motor de transcripción Braille a español
 * Procesa símbolos Braille y los convierte a texto español
 */
export class BrailleToSpanishTranscriber {
  private mapper: SpanishBrailleMapper;
  
  constructor() {
    this.mapper = new SpanishBrailleMapper();
  }
  
  /**
   * Transcribe símbolos Braille a texto español
   * @param symbols Array de símbolos Braille
   * @returns Texto español transcribido
   */
  public transcribe(symbols: Array<{ dots: BrailleDots }>): BrailleToSpanishOutput {
    const startTime = performance.now();
    
    let spanishText = '';
    let inNumberMode = false;
    let nextCapital = false;
    const processedSymbols: Array<{ dots: BrailleDots; character: string }> = [];
    let unrecognizedCount = 0;
    
    // Mapeo de letras a números (estándar Braille)
    const letterToNumber: { [key: string]: string } = {
      'a': '1', 'b': '2', 'c': '3', 'd': '4', 'e': '5',
      'f': '6', 'g': '7', 'h': '8', 'i': '9', 'j': '0'
    };
    
    symbols.forEach((symbol) => {
      const dotsKey = symbol.dots.map(d => d ? '1' : '0').join('');
      
      // Verificar si es indicador numérico (#) - dots-3456
      if (dotsKey === '001111') {
        inNumberMode = true;
        processedSymbols.push({ dots: symbol.dots, character: '#' });
        return;
      }
      
      // Verificar si es indicador de mayúscula (⇧) - dots-46
      if (dotsKey === '000101') {
        nextCapital = true;
        processedSymbols.push({ dots: symbol.dots, character: '⇧' });
        return;
      }
      
      // Obtener carácter desde los puntos
      let character = inNumberMode && dotsKey === '100111'
        ? '0'
        : this.mapper.getCharacterFromDots(symbol.dots);
      
      if (character === null) {
        unrecognizedCount++;
        character = '?';
      }
      
      // Aplicar modo numérico
      if (inNumberMode) {
        // Los números en Braille usan los mismos patrones que a-j
        const lowerChar = character.toLowerCase();
        if (letterToNumber[lowerChar]) {
          character = letterToNumber[lowerChar];
        }
        
        // Salir del modo numérico si es espacio o puntuación
        if (character === ' ' || /^[.,;:!?¿¡"'()\-\s]$/.test(character)) {
          inNumberMode = false;
        }
      }
      
      // Aplicar mayúscula
      if (nextCapital && character !== ' ' && character !== '?' && !/^[.,;:!?¿¡"'()\-\s]$/.test(character)) {
        character = character.toUpperCase();
        nextCapital = false;
      }
      
      spanishText += character;
      processedSymbols.push({ dots: symbol.dots, character });
    });
    
    const endTime = performance.now();
    const statistics: TranscriptionStatistics = {
      totalCharacters: spanishText.length,
      totalSymbols: symbols.length,
      unrecognizedCharacters: unrecognizedCount,
      processingTime: endTime - startTime
    };
    
    return {
      originalBraille: symbols.map(s => s.dots.map(d => d ? '1' : '0').join('')).join(' '),
      spanishText,
      symbols: processedSymbols,
      statistics
    };
  }
  
  /**
   * Transcribe desde una representación binaria de Braille
   * @param binaryString String binario (ej: "100000 110000 101000")
   * @returns Texto español transcribido
   */
  public transcribeFromBinary(binaryString: string): BrailleToSpanishOutput {
    const symbols = binaryString.split(' ')
      .filter(bin => bin.length === 6)
      .map(bin => ({
        dots: bin.split('').map(b => b === '1') as BrailleDots
      }));
    
    return this.transcribe(symbols);
  }
  
  /**
   * Valida si una cadena binaria representa símbolos Braille válidos
   * @param binaryString String binario a validar
   * @returns True si todos los símbolos son válidos
   */
  public validateBinaryInput(binaryString: string): boolean {
    const symbols = binaryString.split(' ').filter(bin => bin.trim() !== '');
    
    for (const symbol of symbols) {
      // Verificar longitud
      if (symbol.length !== 6) return false;
      
      // Verificar que solo contenga 0 y 1
      if (!/^[01]+$/.test(symbol)) return false;
      
      // Verificar que tenga mapeo (opcional, para ser más estrictos)
      const dots = symbol.split('').map(b => b === '1') as BrailleDots;
      if (!this.mapper.hasDotsMapping(dots)) {
        // Permitimos indicadores especiales que no están en el mapeo regular
        const dotsKey = symbol;
        if (dotsKey !== '001111' && dotsKey !== '000101' && dotsKey !== '100111') {
          return false;
        }
      }
    }
    
    return true;
  }
}
