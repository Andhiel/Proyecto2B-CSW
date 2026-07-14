/**
 * @fileoverview Motor principal de transcripción de español a Braille
 * @author Kevin Palacios
 * @version 1.0.0
 */

import { 
  BrailleOutput, 
  Token, 
  TokenType, 
  TranscriptionConfig, 
  TranscriptionStatistics,
  IBrailleTranscriber 
} from '@/types/braille';
import { SpanishBrailleMapper } from './braille-mapper';
import { UnicodeBrailleConverter } from './unicode-braille-converter';

/**
 * Implementación del motor de transcripción español a Braille
 * Procesa texto español y lo convierte a su representación Braille
 */
export class SpanishToBrailleTranscriber implements IBrailleTranscriber {
  private mapper: SpanishBrailleMapper;
  private lastStatistics: TranscriptionStatistics | null = null;
  
  constructor() {
    this.mapper = new SpanishBrailleMapper();
  }
  
  /**
   * {@inheritDoc}
   */
  public transcribe(text: string, config?: Partial<TranscriptionConfig>): BrailleOutput {
    const startTime = performance.now();
    
    // Configuración por defecto
    const fullConfig: TranscriptionConfig = {
      useContractions: false,
      displayMode: 'dots',
      formatting: {
        preserveCase: true,
        preserveSpaces: true,
        maxLineLength: undefined
      },
      ...config
    };
    
    // Validar entrada
    if (!this.validateInput(text)) {
      throw new Error('El texto contiene caracteres no soportados');
    }
    
    // Tokenizar el texto
    const tokens = this.tokenizeText(text);
    
    // Procesar tokens y generar símbolos Braille
    const processedTokens = this.processTokens(tokens, fullConfig);
    const symbols = processedTokens
      .filter(token => token.brailleSymbol)
      .map(token => token.brailleSymbol!);
    
    // Generar texto Braille para visualización
    const brailleText = this.generateBrailleText(symbols, fullConfig.displayMode);
    
    // Calcular estadísticas
    const endTime = performance.now();
    const statistics: TranscriptionStatistics = {
      totalCharacters: text.length,
      totalSymbols: symbols.length,
      unrecognizedCharacters: tokens.filter(t => t.type === TokenType.UNKNOWN).length,
      processingTime: endTime - startTime
    };
    
    this.lastStatistics = statistics;
    
    return {
      originalText: text,
      symbols,
      tokens: processedTokens,
      brailleText,
      statistics
    };
  }
  
  /**
   * {@inheritDoc}
   */
  public validateInput(text: string): boolean {
    // Verificar que todos los caracteres tengan mapeo
    for (const char of text) {
      if (!this.mapper.hasMapping(char) && char !== ' ') {
        return false;
      }
    }
    return true;
  }
  
  /**
   * {@inheritDoc}
   */
  public getLastStatistics(): TranscriptionStatistics | null {
    return this.lastStatistics;
  }
  
  /**
   * Tokeniza el texto de entrada en unidades procesables
   * @param text Texto a tokenizar
   * @returns Array de tokens
   */
  private tokenizeText(text: string): Token[] {
    const tokens: Token[] = [];
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const token: Token = {
        character: char,
        position: i,
        type: this.getTokenType(char)
      };
      
      tokens.push(token);
    }
    
    return tokens;
  }
  
  /**
   * Determina el tipo de token para un carácter
   * @param character Carácter a clasificar
   * @returns Tipo de token
   */
  private getTokenType(character: string): TokenType {
    if (character === ' ') {
      return TokenType.SPACE;
    }
    
    if (this.mapper.isLetter(character)) {
      if (this.mapper.isAccentedVowel(character)) {
        return TokenType.ACCENTED_VOWEL;
      }
      return TokenType.LETTER;
    }
    
    if (this.mapper.isNumber(character)) {
      return TokenType.NUMBER;
    }
    
    if (this.mapper.isPunctuation(character)) {
      return TokenType.PUNCTUATION;
    }
    
    return TokenType.UNKNOWN;
  }

  private getInnerZeroSymbol() {
    return {
      dots: [true, false, false, true, true, true] as [boolean, boolean, boolean, boolean, boolean, boolean],
      character: '0',
      description: 'Numero 0 dentro de secuencia numerica'
    };
  }

  private getAcronymLength(tokens: Token[], startIndex: number): number {
    let index = startIndex;
    let letterCount = 0;
    let lastWasHyphen = false;

    while (index < tokens.length) {
      const token = tokens[index];
      const isLetter = token.type === TokenType.LETTER || token.type === TokenType.ACCENTED_VOWEL;

      if (isLetter) {
        const isUppercase =
          token.character === token.character.toUpperCase() &&
          token.character !== token.character.toLowerCase();

        if (!isUppercase) {
          break;
        }

        letterCount++;
        lastWasHyphen = false;
        index++;
        continue;
      }

      if (
        token.character === '-' &&
        letterCount > 0 &&
        index + 1 < tokens.length &&
        (tokens[index + 1].type === TokenType.LETTER || tokens[index + 1].type === TokenType.ACCENTED_VOWEL)
      ) {
        lastWasHyphen = true;
        index++;
        continue;
      }

      break;
    }

    if (letterCount < 2 || lastWasHyphen) {
      return 0;
    }

    return index - startIndex;
  }
  
  /**
   * Procesa los tokens y asigna símbolos Braille
   * @param tokens Tokens a procesar
   * @param config Configuración de transcripción
   * @returns Tokens procesados con símbolos Braille
   */
  private processTokens(tokens: Token[], config: TranscriptionConfig): Token[] {
    const processedTokens: Token[] = [];
    let inNumberSequence = false;
    let numberSequenceStartedAt = -1;
    let acronymUntil = -1;
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const processedToken = { ...token };
      const isInsideAcronym = i < acronymUntil;
      
      // Manejar secuencias de números
      if (token.type === TokenType.NUMBER && !inNumberSequence) {
        // Agregar indicador numérico antes del primer número
        const numberIndicatorToken: Token = {
          character: '#',
          position: token.position,
          type: TokenType.PUNCTUATION,
          brailleSymbol: this.mapper.getNumberIndicator()
        };
        processedTokens.push(numberIndicatorToken);
        inNumberSequence = true;
        numberSequenceStartedAt = i;
      } else if (token.type !== TokenType.NUMBER && inNumberSequence) {
        inNumberSequence = false;
        numberSequenceStartedAt = -1;
      }

      if (config.formatting.preserveCase && !isInsideAcronym) {
        const acronymLength = this.getAcronymLength(tokens, i);

        if (acronymLength > 0) {
          const capitalIndicatorToken: Token = {
            character: 'â‡§',
            position: token.position,
            type: TokenType.PUNCTUATION,
            brailleSymbol: this.mapper.getCapitalIndicator()
          };

          processedTokens.push(capitalIndicatorToken, { ...capitalIndicatorToken });
          acronymUntil = i + acronymLength;
        }
      }
      
      // Manejar mayúsculas (incluye letras regulares y vocales acentuadas)
      if (config.formatting.preserveCase &&
          !isInsideAcronym &&
          i >= acronymUntil &&
          (token.type === TokenType.LETTER || token.type === TokenType.ACCENTED_VOWEL) &&
          token.character === token.character.toUpperCase() &&
          token.character !== token.character.toLowerCase()) {

        // Agregar indicador de mayúscula
        const capitalIndicatorToken: Token = {
          character: '⇧',
          position: token.position,
          type: TokenType.PUNCTUATION,
          brailleSymbol: this.mapper.getCapitalIndicator()
        };
        processedTokens.push(capitalIndicatorToken);
      }
      
      // Obtener símbolo Braille para el carácter
      const brailleSymbol = this.mapper.getBrailleSymbol(token.character);
      if (brailleSymbol) {
        processedToken.brailleSymbol =
          token.character === '0' && inNumberSequence && i > numberSequenceStartedAt
            ? this.getInnerZeroSymbol()
            : brailleSymbol;
      }
      
      processedTokens.push(processedToken);
    }
    
    return processedTokens;
  }
  
  /**
   * Genera la representación visual del texto Braille
   * @param symbols Símbolos Braille a convertir
   * @param displayMode Modo de visualización
   * @returns String para visualización
   */
  private generateBrailleText(symbols: any[], displayMode: 'dots' | 'binary' | 'unicode'): string {
    switch (displayMode) {
      case 'dots':
        return symbols.map(symbol => this.dotsToDisplay(symbol.dots)).join(' ');
      case 'binary':
        return symbols.map(symbol => this.dotsToBinary(symbol.dots)).join(' ');
      case 'unicode':
        return symbols.map(symbol => UnicodeBrailleConverter.dotsToUnicode(symbol.dots)).join(' ');
      default:
        return symbols.map(symbol => this.dotsToDisplay(symbol.dots)).join(' ');
    }
  }
  
  /**
   * Convierte puntos Braille a representación visual con caracteres
   * @param dots Array de 6 booleanos
   * @returns String visual
   */
  private dotsToDisplay(dots: [boolean, boolean, boolean, boolean, boolean, boolean]): string {
    const displayChars = dots.map((dot, index) => dot ? '●' : '○');
    return displayChars.join('');
  }
  
  /**
   * Convierte puntos Braille a representación binaria
   * @param dots Array de 6 booleanos
   * @returns String binario
   */
  private dotsToBinary(dots: [boolean, boolean, boolean, boolean, boolean, boolean]): string {
    return dots.map(dot => dot ? '1' : '0').join('');
  }
  
  /**
   * Obtiene caracteres no reconocidos en el texto
   * @param text Texto a analizar
   * @returns Array de caracteres no soportados
   */
  public getUnrecognizedCharacters(text: string): string[] {
    const unrecognized: string[] = [];
    const seen = new Set<string>();
    
    for (const char of text) {
      if (!this.mapper.hasMapping(char) && char !== ' ' && !seen.has(char)) {
        unrecognized.push(char);
        seen.add(char);
      }
    }
    
    return unrecognized;
  }
  
  /**
   * Obtiene estadísticas detalladas de caracteres
   * @param text Texto a analizar
   * @returns Estadísticas detalladas
   */
  public getDetailedStatistics(text: string): {
    letters: number;
    numbers: number;
    accentedVowels: number;
    punctuation: number;
    spaces: number;
    unrecognized: number;
  } {
    const stats = {
      letters: 0,
      numbers: 0,
      accentedVowels: 0,
      punctuation: 0,
      spaces: 0,
      unrecognized: 0
    };
    
    for (const char of text) {
      if (char === ' ') {
        stats.spaces++;
      } else if (this.mapper.isNumber(char)) {
        stats.numbers++;
      } else if (this.mapper.isAccentedVowel(char)) {
        stats.accentedVowels++;
      } else if (this.mapper.isLetter(char)) {
        stats.letters++;
      } else if (this.mapper.isPunctuation(char)) {
        stats.punctuation++;
      } else {
        stats.unrecognized++;
      }
    }
    
    return stats;
  }
}
