/**
 * @fileoverview Implementación del mapeador de caracteres españoles a Braille
 * @author Kevin Palacios
 * @version 1.0.0
 */

import { BrailleSymbol, BrailleDots, IBrailleMapper } from '@/types/braille';

/**
 * Clase que implementa el mapeo de caracteres españoles a símbolos Braille
 * Basado en el estándar Braille español (código Braille de 6 puntos)
 */
export class SpanishBrailleMapper implements IBrailleMapper {
  private characterMap: Map<string, BrailleSymbol>;
  private dotsMap: Map<string, string>; // Mapeo inverso: puntos → carácter
  
  constructor() {
    this.characterMap = new Map();
    this.dotsMap = new Map();
    this.initializeMapping();
  }
  
  /**
   * Inicializa el mapeo de caracteres españoles a Braille
   * Incluye: alfabeto, números, vocales acentuadas y signos de puntuación
   */
  private initializeMapping(): void {
    // Alfabeto español (minúsculas) - Según estándar internacional Braille Unicode
    // Puntos: [1, 2, 3, 4, 5, 6] donde 1-3 son columna izquierda, 4-6 columna derecha
    this.addMapping('a', [true, false, false, false, false, false], 'Letra A');     // ⠁ dots-1
    this.addMapping('b', [true, true, false, false, false, false], 'Letra B');      // ⠃ dots-12
    this.addMapping('c', [true, false, false, true, false, false], 'Letra C');     // ⠉ dots-14
    this.addMapping('d', [true, false, false, true, true, false], 'Letra D');      // ⠙ dots-145
    this.addMapping('e', [true, false, false, false, true, false], 'Letra E');     // ⠑ dots-15
    this.addMapping('f', [true, true, false, true, false, false], 'Letra F');      // ⠋ dots-124
    this.addMapping('g', [true, true, false, true, true, false], 'Letra G');       // ⠛ dots-1245
    this.addMapping('h', [true, true, false, false, true, false], 'Letra H');      // ⠓ dots-125
    this.addMapping('i', [false, true, false, true, false, false], 'Letra I');     // ⠊ dots-24
    this.addMapping('j', [false, true, false, true, true, false], 'Letra J');      // ⠚ dots-245
    this.addMapping('k', [true, false, true, false, false, false], 'Letra K');     // ⠅ dots-13
    this.addMapping('l', [true, true, true, false, false, false], 'Letra L');      // ⠇ dots-123
    this.addMapping('m', [true, false, true, true, false, false], 'Letra M');      // ⠍ dots-134
    this.addMapping('n', [true, false, true, true, true, false], 'Letra N');       // ⠝ dots-1345
    this.addMapping('ñ', [true, false, true, true, true, true], 'Letra Ñ');       // ⠵ dots-13456
    this.addMapping('o', [true, false, true, false, true, false], 'Letra O');      // ⠕ dots-135
    this.addMapping('p', [true, true, true, true, false, false], 'Letra P');       // ⠏ dots-1234
    this.addMapping('q', [true, true, true, true, true, false], 'Letra Q');       // ⠟ dots-12345
    this.addMapping('r', [true, true, true, false, true, false], 'Letra R');       // ⠗ dots-1235
    this.addMapping('s', [false, true, true, true, false, false], 'Letra S');     // ⠎ dots-234
    this.addMapping('t', [false, true, true, true, true, false], 'Letra T');       // ⠞ dots-2345
    this.addMapping('u', [true, false, true, false, false, true], 'Letra U');     // ⠥ dots-136
    this.addMapping('v', [true, true, true, false, false, true], 'Letra V');       // ⠧ dots-1236
    this.addMapping('w', [false, true, false, true, true, true], 'Letra W');      // ⠷ dots-2456
    this.addMapping('x', [true, false, true, true, false, true], 'Letra X');       // ⠭ dots-1346
    this.addMapping('y', [true, false, true, true, true, true], 'Letra Y');       // ⠽ dots-13456
    this.addMapping('z', [true, false, true, false, true, true], 'Letra Z');      // ⠵ dots-1356
    
    // Alfabeto español (mayúsculas) - mismo código que minúsculas
    // El indicador de mayúscula se inserta separadamente en el transcriber
    this.addMapping('A', [true, false, false, false, false, false], 'Letra A (mayúscula)');
    this.addMapping('B', [true, true, false, false, false, false], 'Letra B (mayúscula)');
    this.addMapping('C', [true, false, false, true, false, false], 'Letra C (mayúscula)');
    this.addMapping('D', [true, false, false, true, true, false], 'Letra D (mayúscula)');
    this.addMapping('E', [true, false, false, false, true, false], 'Letra E (mayúscula)');
    this.addMapping('F', [true, true, false, true, false, false], 'Letra F (mayúscula)');
    this.addMapping('G', [true, true, false, true, true, false], 'Letra G (mayúscula)');
    this.addMapping('H', [true, true, false, false, true, false], 'Letra H (mayúscula)');
    this.addMapping('I', [false, true, false, true, false, false], 'Letra I (mayúscula)');
    this.addMapping('J', [false, true, false, true, true, false], 'Letra J (mayúscula)');
    this.addMapping('K', [true, false, true, false, false, false], 'Letra K (mayúscula)');
    this.addMapping('L', [true, true, true, false, false, false], 'Letra L (mayúscula)');
    this.addMapping('M', [true, false, true, true, false, false], 'Letra M (mayúscula)');
    this.addMapping('N', [true, false, true, true, true, false], 'Letra N (mayúscula)');
    this.addMapping('Ñ', [true, false, true, true, true, true], 'Letra Ñ (mayúscula)');
    this.addMapping('O', [true, false, true, false, true, false], 'Letra O (mayúscula)');
    this.addMapping('P', [true, true, true, true, false, false], 'Letra P (mayúscula)');
    this.addMapping('Q', [true, true, true, true, true, false], 'Letra Q (mayúscula)');
    this.addMapping('R', [true, true, true, false, true, false], 'Letra R (mayúscula)');
    this.addMapping('S', [false, true, true, true, false, false], 'Letra S (mayúscula)');
    this.addMapping('T', [false, true, true, true, true, false], 'Letra T (mayúscula)');
    this.addMapping('U', [true, false, true, false, false, true], 'Letra U (mayúscula)');
    this.addMapping('V', [true, true, true, false, false, true], 'Letra V (mayúscula)');
    this.addMapping('W', [false, true, false, true, true, true], 'Letra W (mayúscula)');
    this.addMapping('X', [true, false, true, true, false, true], 'Letra X (mayúscula)');
    this.addMapping('Y', [true, false, true, true, true, true], 'Letra Y (mayúscula)');
    this.addMapping('Z', [true, false, true, false, true, true], 'Letra Z (mayúscula)');
    
    // Vocales acentuadas
    this.addMapping('á', [true, false, false, false, false, true], 'Letra á');
    this.addMapping('é', [true, true, false, false, false, true], 'Letra é');
    this.addMapping('í', [true, false, false, true, false, true], 'Letra í');
    this.addMapping('ó', [true, false, false, true, true, true], 'Letra ó');
    this.addMapping('ú', [true, false, false, false, true, true], 'Letra ú');
    
    this.addMapping('Á', [true, false, false, false, false, true], 'Letra Á (mayúscula)');
    this.addMapping('É', [true, true, false, false, false, true], 'Letra É (mayúscula)');
    this.addMapping('Í', [true, false, false, true, false, true], 'Letra Í (mayúscula)');
    this.addMapping('Ó', [true, false, false, true, true, true], 'Letra Ó (mayúscula)');
    this.addMapping('Ú', [true, false, false, false, true, true], 'Letra Ú (mayúscula)');
    
    // Números (requieren indicador numérico ⠼) - Según estándar internacional
    // Los números usan los mismos patrones que a-j pero con indicador numérico
    this.addMapping('0', [false, true, true, true, true, true], 'Número 0');     // ⠴ dots-23456 (j con indicador)
    this.addMapping('1', [true, false, false, false, false, false], 'Número 1');     // ⠁ dots-1 (a con indicador)
    this.addMapping('2', [true, true, false, false, false, false], 'Número 2');     // ⠃ dots-12 (b con indicador)
    this.addMapping('3', [true, false, false, true, false, false], 'Número 3');     // ⠉ dots-14 (c con indicador)
    this.addMapping('4', [true, false, false, true, true, false], 'Número 4');     // ⠙ dots-145 (d con indicador)
    this.addMapping('5', [true, false, false, false, true, false], 'Número 5');     // ⠑ dots-15 (e con indicador)
    this.addMapping('6', [true, true, false, true, false, false], 'Número 6');     // ⠋ dots-124 (f con indicador)
    this.addMapping('7', [true, true, false, true, true, false], 'Número 7');     // ⠛ dots-1245 (g con indicador)
    this.addMapping('8', [true, true, false, false, true, false], 'Número 8');     // ⠓ dots-125 (h con indicador)
    this.addMapping('9', [false, true, false, true, false, false], 'Número 9');     // ⠊ dots-24 (i con indicador)
    
    // Signos de puntuación básicos - Según estándar internacional Braille
    this.addMapping(' ', [false, false, false, false, false, false], 'Espacio');        // ⠀ blank
    this.addMapping('.', [false, true, true, false, false, true], 'Punto');           // ⠲ dots-256
    this.addMapping(',', [false, true, false, false, false, true], 'Coma');           // ⠂ dots-2
    this.addMapping(';', [false, true, false, false, true, true], 'Punto y coma');    // ⠰ dots-25
    this.addMapping(':', [false, true, false, true, false, true], 'Dos puntos');       // ⠒ dots-25
    this.addMapping('!', [false, true, true, true, false, true], 'Signo de exclamación'); // ⠖ dots-2356
    this.addMapping('¡', [false, true, true, true, true, false], 'Signo de exclamación invertido'); // ⠔ dots-2345
    this.addMapping('?', [false, true, true, true, false, false], 'Signo de interrogación'); // ⠢ dots-236
    this.addMapping('¿', [false, true, true, true, true, true], 'Signo de interrogación invertido'); // ⠮ dots-2346
    this.addMapping('"', [false, false, true, false, false, true], 'Comillas');       // ⠐ dots-5
    this.addMapping("'", [false, false, true, false, true, false], 'Apóstrofe');     // ⠄ dots-3
    this.addMapping('-', [false, false, true, false, true, true], 'Guion');          // ⠤ dots-36
    this.addMapping('(', [false, true, true, false, true, false], 'Paréntesis abierto'); // ⠦ dots-236
    this.addMapping(')', [false, true, true, false, true, true], 'Paréntesis cerrado'); // ⠴ dots-2356
    
    // Signos especiales del español
    this.addMapping('ü', [true, false, true, false, true, true], 'Letra ü');
    this.addMapping('Ü', [true, false, true, false, true, true], 'Letra Ü (mayúscula)');
  }
  
  /**
   * Agrega un mapeo de carácter a símbolo Braille
   * @param character Carácter español
   * @param dots Array de 6 booleanos representando los puntos
   * @param description Descripción del símbolo
   */
  private addMapping(character: string, dots: BrailleDots, description: string): void {
    this.characterMap.set(character, {
      dots,
      character,
      description
    });
    
    // Agregar mapeo inverso para conversión Braille → Español
    const dotsKey = dots.map(d => d ? '1' : '0').join('');
    this.dotsMap.set(dotsKey, character);
  }
  
  /**
   * {@inheritDoc}
   */
  public getBrailleSymbol(character: string): BrailleSymbol | null {
    return this.characterMap.get(character) || null;
  }
  
  /**
   * {@inheritDoc}
   */
  public hasMapping(character: string): boolean {
    return this.characterMap.has(character);
  }
  
  /**
   * {@inheritDoc}
   */
  public getAllMappedCharacters(): string[] {
    return Array.from(this.characterMap.keys());
  }
  
  /**
   * Obtiene el indicador numérico para números
   * @returns Símbolo Braille para indicador numérico
   */
  public getNumberIndicator(): BrailleSymbol {
    return {
      dots: [false, false, true, true, true, true],
      character: '#',
      description: 'Indicador numérico'
    };
  }
  
  /**
   * Obtiene el indicador de mayúscula
   * @returns Símbolo Braille para indicador de mayúscula
   */
  public getCapitalIndicator(): BrailleSymbol {
    return {
      dots: [false, false, false, false, true, true],
      character: '⇧',
      description: 'Indicador de mayúscula'
    };
  }
  
  /**
   * Verifica si un carácter es una letra
   * @param character Carácter a verificar
   * @returns True si es una letra
   */
  public isLetter(character: string): boolean {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]$/.test(character);
  }
  
  /**
   * Verifica si un carácter es un número
   * @param character Carácter a verificar
   * @returns True si es un número
   */
  public isNumber(character: string): boolean {
    return /^[0-9]$/.test(character);
  }
  
  /**
   * Verifica si un carácter es una vocal acentuada
   * @param character Carácter a verificar
   * @returns True si es una vocal acentuada
   */
  public isAccentedVowel(character: string): boolean {
    return /^[áéíóúÁÉÍÓÚ]$/.test(character);
  }
  
  /**
   * Verifica si un carácter es un signo de puntuación
   * @param character Carácter a verificar
   * @returns True si es un signo de puntuación
   */
  public isPunctuation(character: string): boolean {
    return /^[.,;:!?¿¡"'()\-\s]$/.test(character);
  }
  
  /**
   * Obtiene el carácter español desde los puntos Braille
   * @param dots Array de 6 booleanos representando los puntos
   * @returns Carácter español correspondiente o null si no existe
   */
  public getCharacterFromDots(dots: BrailleDots): string | null {
    const dotsKey = dots.map(d => d ? '1' : '0').join('');
    return this.dotsMap.get(dotsKey) || null;
  }
  
  /**
   * Verifica si los puntos tienen mapeo a un carácter
   * @param dots Array de 6 booleanos representando los puntos
   * @returns True si existe mapeo
   */
  public hasDotsMapping(dots: BrailleDots): boolean {
    const dotsKey = dots.map(d => d ? '1' : '0').join('');
    return this.dotsMap.has(dotsKey);
  }
}
