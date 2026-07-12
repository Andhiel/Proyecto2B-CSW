/**
 * @fileoverview Convertidor de Unicode Braille a puntos
 * @author Kevin Palacios
 * @version 1.0.0
 */

import { BrailleDots } from '@/types/braille';

/**
 * Clase para convertir caracteres Unicode Braille (U+2800–U+28FF) a puntos
 * Basado en el estándar Unicode Braille Patterns
 */
export class UnicodeBrailleConverter {
  /**
   * Convierte un carácter Unicode Braille a su representación de puntos
   * @param char Carácter Unicode Braille
   * @returns Array de 6 booleanos representando los puntos
   */
  public static unicodeToDots(char: string): BrailleDots | null {
    const codePoint = char.codePointAt(0);
    
    if (!codePoint || codePoint < 0x2800 || codePoint > 0x28FF) {
      return null;
    }
    
    // El patrón de bits en Unicode sigue el orden: 8 7 6 5 4 3 2 1
    // Para 6 puntos, usamos solo los bits 1-6
    const offset = codePoint - 0x2800;
    
    // Convertir offset a binario de 8 bits
    const binary = offset.toString(2).padStart(8, '0');
    
    // Extraer bits para puntos 1-6 (en orden inverso: 6 5 4 3 2 1)
    // El orden en Unicode es: bit 0 = punto 1, bit 1 = punto 2, etc.
    const dots: BrailleDots = [
      binary[7] === '1', // Punto 1
      binary[6] === '1', // Punto 2
      binary[5] === '1', // Punto 3
      binary[3] === '1', // Punto 4
      binary[2] === '1', // Punto 5
      binary[1] === '1'  // Punto 6
    ];
    
    return dots;
  }
  
  /**
   * Convierte una cadena de Unicode Braille a array de puntos
   * @param text Cadena de caracteres Unicode Braille
   * @returns Array de puntos
   */
  public static unicodeTextToDots(text: string): BrailleDots[] {
    const result: BrailleDots[] = [];
    
    for (const char of text) {
      const dots = this.unicodeToDots(char);
      if (dots) {
        result.push(dots);
      } else {
        // Espacio u otros caracteres no Braille
        result.push([false, false, false, false, false, false]);
      }
    }
    
    return result;
  }
  
  /**
   * Convierte puntos a carácter Unicode Braille
   * @param dots Array de 6 booleanos
   * @returns Carácter Unicode Braille
   */
  public static dotsToUnicode(dots: BrailleDots): string {
    // Convertir puntos a valor binario
    // Orden: punto 1 = bit 0, punto 2 = bit 1, etc.
    let value = 0;
    
    if (dots[0]) value |= 1;  // Punto 1
    if (dots[1]) value |= 2;  // Punto 2
    if (dots[2]) value |= 4;  // Punto 3
    if (dots[3]) value |= 8;  // Punto 4
    if (dots[4]) value |= 16; // Punto 5
    if (dots[5]) value |= 32; // Punto 6
    
    // Agregar offset Unicode Braille
    const codePoint = 0x2800 + value;
    
    return String.fromCodePoint(codePoint);
  }
  
  /**
   * Verifica si un carácter es Unicode Braille válido
   * @param char Carácter a verificar
   * @returns True si es Unicode Braille
   */
  public static isUnicodeBraille(char: string): boolean {
    const codePoint = char.codePointAt(0);
    return codePoint !== undefined && codePoint >= 0x2800 && codePoint <= 0x28FF;
  }
  
  /**
   * Verifica si una cadena contiene caracteres Unicode Braille
   * @param text Cadena a verificar
   * @returns True si contiene Unicode Braille
   */
  public static containsUnicodeBraille(text: string): boolean {
    for (const char of text) {
      if (this.isUnicodeBraille(char)) {
        return true;
      }
    }
    return false;
  }
}
