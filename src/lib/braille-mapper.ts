/**
 * @fileoverview Implementacion del mapeador de caracteres espanoles a Braille
 * @author Kevin Palacios
 * @version 1.0.0
 */

import { BrailleSymbol, BrailleDots, IBrailleMapper } from '@/types/braille';

/**
 * Clase que implementa el mapeo de caracteres espanoles a simbolos Braille
 * basado en el codigo Braille espanol de 6 puntos.
 */
export class SpanishBrailleMapper implements IBrailleMapper {
  private characterMap: Map<string, BrailleSymbol>;
  private dotsMap: Map<string, string>;

  constructor() {
    this.characterMap = new Map();
    this.dotsMap = new Map();
    this.initializeMapping();
  }

  /**
   * Inicializa el mapeo de caracteres espanoles a Braille.
   * Incluye alfabeto, numeros, acentos, puntuacion y operadores matematicos.
   */
  private initializeMapping(): void {
    // Letras base.
    this.addMapping('a', this.dots('1'), 'Letra A');
    this.addMapping('b', this.dots('12'), 'Letra B');
    this.addMapping('c', this.dots('14'), 'Letra C');
    this.addMapping('d', this.dots('145'), 'Letra D');
    this.addMapping('e', this.dots('15'), 'Letra E');
    this.addMapping('f', this.dots('124'), 'Letra F');
    this.addMapping('g', this.dots('1245'), 'Letra G');
    this.addMapping('h', this.dots('125'), 'Letra H');
    this.addMapping('i', this.dots('24'), 'Letra I');
    this.addMapping('j', this.dots('245'), 'Letra J');
    this.addMapping('k', this.dots('13'), 'Letra K');
    this.addMapping('l', this.dots('123'), 'Letra L');
    this.addMapping('m', this.dots('134'), 'Letra M');
    this.addMapping('n', this.dots('1345'), 'Letra N');
    this.addMapping('o', this.dots('135'), 'Letra O');
    this.addMapping('p', this.dots('1234'), 'Letra P');
    this.addMapping('q', this.dots('12345'), 'Letra Q');
    this.addMapping('r', this.dots('1235'), 'Letra R');
    this.addMapping('s', this.dots('234'), 'Letra S');
    this.addMapping('t', this.dots('2345'), 'Letra T');
    this.addMapping('u', this.dots('136'), 'Letra U');
    this.addMapping('v', this.dots('1236'), 'Letra V');
    this.addMapping('w', this.dots('2456'), 'Letra W');
    this.addMapping('x', this.dots('1346'), 'Letra X');
    this.addMapping('y', this.dots('13456'), 'Letra Y');
    this.addMapping('z', this.dots('1356'), 'Letra Z');
    this.addMapping('ñ', this.dots('12456'), 'Letra Ñ');

    // Mayusculas: usan la misma celda que la minuscula y el transcriber agrega indicador.
    this.addMapping('A', this.dots('1'), 'Letra A (mayuscula)');
    this.addMapping('B', this.dots('12'), 'Letra B (mayuscula)');
    this.addMapping('C', this.dots('14'), 'Letra C (mayuscula)');
    this.addMapping('D', this.dots('145'), 'Letra D (mayuscula)');
    this.addMapping('E', this.dots('15'), 'Letra E (mayuscula)');
    this.addMapping('F', this.dots('124'), 'Letra F (mayuscula)');
    this.addMapping('G', this.dots('1245'), 'Letra G (mayuscula)');
    this.addMapping('H', this.dots('125'), 'Letra H (mayuscula)');
    this.addMapping('I', this.dots('24'), 'Letra I (mayuscula)');
    this.addMapping('J', this.dots('245'), 'Letra J (mayuscula)');
    this.addMapping('K', this.dots('13'), 'Letra K (mayuscula)');
    this.addMapping('L', this.dots('123'), 'Letra L (mayuscula)');
    this.addMapping('M', this.dots('134'), 'Letra M (mayuscula)');
    this.addMapping('N', this.dots('1345'), 'Letra N (mayuscula)');
    this.addMapping('O', this.dots('135'), 'Letra O (mayuscula)');
    this.addMapping('P', this.dots('1234'), 'Letra P (mayuscula)');
    this.addMapping('Q', this.dots('12345'), 'Letra Q (mayuscula)');
    this.addMapping('R', this.dots('1235'), 'Letra R (mayuscula)');
    this.addMapping('S', this.dots('234'), 'Letra S (mayuscula)');
    this.addMapping('T', this.dots('2345'), 'Letra T (mayuscula)');
    this.addMapping('U', this.dots('136'), 'Letra U (mayuscula)');
    this.addMapping('V', this.dots('1236'), 'Letra V (mayuscula)');
    this.addMapping('W', this.dots('2456'), 'Letra W (mayuscula)');
    this.addMapping('X', this.dots('1346'), 'Letra X (mayuscula)');
    this.addMapping('Y', this.dots('13456'), 'Letra Y (mayuscula)');
    this.addMapping('Z', this.dots('1356'), 'Letra Z (mayuscula)');
    this.addMapping('Ñ', this.dots('12456'), 'Letra Ñ (mayuscula)');

    // Vocales acentuadas y dieresis.
    this.addMapping('á', this.dots('12356'), 'Letra á');
    this.addMapping('é', this.dots('2346'), 'Letra é');
    this.addMapping('í', this.dots('34'), 'Letra í');
    this.addMapping('ó', this.dots('346'), 'Letra ó');
    this.addMapping('ú', this.dots('23456'), 'Letra ú');
    this.addMapping('ü', this.dots('1256'), 'Letra ü');
    this.addMapping('Á', this.dots('12356'), 'Letra Á (mayuscula)');
    this.addMapping('É', this.dots('2346'), 'Letra É (mayuscula)');
    this.addMapping('Í', this.dots('34'), 'Letra Í (mayuscula)');
    this.addMapping('Ó', this.dots('346'), 'Letra Ó (mayuscula)');
    this.addMapping('Ú', this.dots('23456'), 'Letra Ú (mayuscula)');
    this.addMapping('Ü', this.dots('1256'), 'Letra Ü (mayuscula)');

    // Numeros: usan las celdas a-j y el transcriber agrega el indicador numerico.
    this.addMapping('1', this.dots('1'), 'Numero 1');
    this.addMapping('2', this.dots('12'), 'Numero 2');
    this.addMapping('3', this.dots('14'), 'Numero 3');
    this.addMapping('4', this.dots('145'), 'Numero 4');
    this.addMapping('5', this.dots('15'), 'Numero 5');
    this.addMapping('6', this.dots('124'), 'Numero 6');
    this.addMapping('7', this.dots('1245'), 'Numero 7');
    this.addMapping('8', this.dots('125'), 'Numero 8');
    this.addMapping('9', this.dots('24'), 'Numero 9');
    this.addMapping('0', this.dots('245'), 'Numero 0');

    // Puntuacion.
    this.addMapping(' ', this.dots(''), 'Espacio');
    this.addMapping('.', this.dots('3'), 'Punto');
    this.addMapping(',', this.dots('2'), 'Coma');
    this.addMapping(';', this.dots('23'), 'Punto y coma');
    this.addMapping(':', this.dots('25'), 'Dos puntos');
    this.addMapping('-', this.dots('36'), 'Guion');
    this.addMapping('?', this.dots('26'), 'Signo de interrogacion');
    this.addMapping('¿', this.dots('26'), 'Signo de interrogacion invertido');
    this.addMapping('!', this.dots('235'), 'Signo de exclamacion');
    this.addMapping('¡', this.dots('235'), 'Signo de exclamacion invertido');
    this.addMapping('"', this.dots('236'), 'Comillas');
    this.addMapping('“', this.dots('236'), 'Comillas de apertura');
    this.addMapping('”', this.dots('236'), 'Comillas de cierre');
    this.addMapping('«', this.dots('236'), 'Comillas latinas de apertura');
    this.addMapping('»', this.dots('236'), 'Comillas latinas de cierre');
    this.addMapping('(', this.dots('126'), 'Parentesis abierto');
    this.addMapping(')', this.dots('345'), 'Parentesis cerrado');

    // Operadores matematicos.
    this.addMapping('+', this.dots('235'), 'Suma');
    this.addMapping('×', this.dots('236'), 'Multiplicacion');
    this.addMapping('=', this.dots('2356'), 'Igual');
    this.addMapping('÷', this.dots('256'), 'Division');
    this.addMapping('−', this.dots('36'), 'Resta');
  }

  /**
   * Convierte una lista de puntos como "1245" a un array booleano [1,2,3,4,5,6].
   */
  private dots(activeDots: string): BrailleDots {
    return [1, 2, 3, 4, 5, 6].map(dot => activeDots.includes(String(dot))) as BrailleDots;
  }

  /**
   * Agrega un mapeo de caracter a simbolo Braille.
   * @param character Caracter espanol
   * @param dots Array de 6 booleanos representando los puntos
   * @param description Descripcion del simbolo
   */
  private addMapping(character: string, dots: BrailleDots, description: string): void {
    this.characterMap.set(character, {
      dots,
      character,
      description
    });

    const dotsKey = dots.map(d => d ? '1' : '0').join('');
    if (!this.dotsMap.has(dotsKey)) {
      this.dotsMap.set(dotsKey, character);
    }
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
   * Obtiene el indicador numerico para numeros.
   * @returns Simbolo Braille para indicador numerico
   */
  public getNumberIndicator(): BrailleSymbol {
    return {
      dots: this.dots('3456'),
      character: '#',
      description: 'Indicador numerico'
    };
  }

  /**
   * Obtiene el indicador de mayuscula.
   * @returns Simbolo Braille para indicador de mayuscula
   */
  public getCapitalIndicator(): BrailleSymbol {
    return {
      dots: this.dots('46'),
      character: '⇧',
      description: 'Indicador de mayuscula'
    };
  }

  /**
   * Verifica si un caracter es una letra.
   * @param character Caracter a verificar
   * @returns True si es una letra
   */
  public isLetter(character: string): boolean {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]$/.test(character);
  }

  /**
   * Verifica si un caracter es un numero.
   * @param character Caracter a verificar
   * @returns True si es un numero
   */
  public isNumber(character: string): boolean {
    return /^[0-9]$/.test(character);
  }

  /**
   * Verifica si un caracter es una vocal acentuada.
   * @param character Caracter a verificar
   * @returns True si es una vocal acentuada
   */
  public isAccentedVowel(character: string): boolean {
    return /^[áéíóúÁÉÍÓÚ]$/.test(character);
  }

  /**
   * Verifica si un caracter es un signo de puntuacion u operador soportado.
   * @param character Caracter a verificar
   * @returns True si es un signo de puntuacion
   */
  public isPunctuation(character: string): boolean {
    return /^[.,;:!?¿¡"'“”«»()\-\s+×=÷−]$/.test(character);
  }

  /**
   * Obtiene el caracter espanol desde los puntos Braille.
   * @param dots Array de 6 booleanos representando los puntos
   * @returns Caracter espanol correspondiente o null si no existe
   */
  public getCharacterFromDots(dots: BrailleDots): string | null {
    const dotsKey = dots.map(d => d ? '1' : '0').join('');
    return this.dotsMap.get(dotsKey) || null;
  }

  /**
   * Verifica si los puntos tienen mapeo a un caracter.
   * @param dots Array de 6 booleanos representando los puntos
   * @returns True si existe mapeo
   */
  public hasDotsMapping(dots: BrailleDots): boolean {
    const dotsKey = dots.map(d => d ? '1' : '0').join('');
    return this.dotsMap.has(dotsKey);
  }
}
