'use client';

import React, { useState } from 'react';
import Header from '@/components/Header'
import TextInput from '@/components/braille/TextInput'
import BrailleDisplay from '@/components/braille/BrailleDisplay'
import { BrailleSymbol } from '@/components/braille/BrailleSymbol'
import { BrailleVirtualKeyboard } from '@/components/braille/BrailleVirtualKeyboard'
import Footer from '@/components/Footer'
import { SpanishToBrailleTranscriber } from '@/lib/braille-transcriber'
import { BrailleToSpanishTranscriber } from '@/lib/braille-to-spanish-transcriber'
import { UnicodeBrailleConverter } from '@/lib/unicode-braille-converter'
import { BrailleOutput } from '@/types/braille'
import { BrailleDots } from '@/types/braille'
import jsPDF from 'jspdf'

interface BraillePrintLayoutOptions {
  cellWidthMm: number
  cellHeightMm: number
  cellsPerLine: number
  cellGapMm: number
  rowGapMm: number
}

interface BrailleExportOptions {
  mirrorMode?: boolean
  layout?: BraillePrintLayoutOptions
  preview?: boolean
}

const LETTER_CONTENT_WIDTH_MM = 195.9
const MIN_CELL_WIDTH_MM = 3
const MAX_CELL_WIDTH_MM = 20
const MIN_CELL_HEIGHT_MM = 5
const MAX_CELL_HEIGHT_MM = 25
const MIN_CELL_GAP_MM = 0
const MAX_CELL_GAP_MM = 5
const MIN_ROW_GAP_MM = 0
const MAX_ROW_GAP_MM = 12
const DEFAULT_PRINT_LAYOUT: BraillePrintLayoutOptions = {
  cellWidthMm: 5.5,
  cellHeightMm: 9,
  cellsPerLine: 32,
  cellGapMm: 0.6,
  rowGapMm: 1
}

const clamp = (value: number, min: number, max: number) => (
  Math.min(Math.max(value, min), max)
)

const normalizePrintLayout = (layout?: Partial<BraillePrintLayoutOptions>): BraillePrintLayoutOptions => {
  const merged = { ...DEFAULT_PRINT_LAYOUT, ...layout }
  const cellGapMm = clamp(Number.isFinite(merged.cellGapMm) ? merged.cellGapMm : DEFAULT_PRINT_LAYOUT.cellGapMm, MIN_CELL_GAP_MM, MAX_CELL_GAP_MM)
  const maxCellsPerLine = Math.max(1, Math.floor((LETTER_CONTENT_WIDTH_MM + cellGapMm) / (MIN_CELL_WIDTH_MM + cellGapMm)))
  const cellsPerLine = clamp(Math.round(Number.isFinite(merged.cellsPerLine) ? merged.cellsPerLine : DEFAULT_PRINT_LAYOUT.cellsPerLine), 1, maxCellsPerLine)
  const maxCellWidthForLine = (LETTER_CONTENT_WIDTH_MM - (cellGapMm * (cellsPerLine - 1))) / cellsPerLine
  const cellWidthMm = clamp(
    Number.isFinite(merged.cellWidthMm) ? merged.cellWidthMm : DEFAULT_PRINT_LAYOUT.cellWidthMm,
    MIN_CELL_WIDTH_MM,
    Math.max(MIN_CELL_WIDTH_MM, Math.min(MAX_CELL_WIDTH_MM, maxCellWidthForLine))
  )
  const cellHeightMm = clamp(Number.isFinite(merged.cellHeightMm) ? merged.cellHeightMm : DEFAULT_PRINT_LAYOUT.cellHeightMm, MIN_CELL_HEIGHT_MM, MAX_CELL_HEIGHT_MM)
  const rowGapMm = clamp(Number.isFinite(merged.rowGapMm) ? merged.rowGapMm : DEFAULT_PRINT_LAYOUT.rowGapMm, MIN_ROW_GAP_MM, MAX_ROW_GAP_MM)

  return {
    cellWidthMm: Number(cellWidthMm.toFixed(2)),
    cellHeightMm: Number(cellHeightMm.toFixed(2)),
    cellsPerLine,
    cellGapMm: Number(cellGapMm.toFixed(2)),
    rowGapMm: Number(rowGapMm.toFixed(2))
  }
}

export default function Home() {
  const [conversionMode, setConversionMode] = useState<'spanish-to-braille' | 'braille-to-spanish'>('spanish-to-braille')
  const [inputMethod, setInputMethod] = useState<'binary' | 'unicode' | 'virtual-keyboard'>('binary')
  const [inputText, setInputText] = useState('')
  const [brailleSymbols, setBrailleSymbols] = useState<Array<{ dots: BrailleDots; unicode: string }>>([])
  const [transcriptionResult, setTranscriptionResult] = useState<BrailleOutput | null>(null)
  const [reverseTranscriptionResult, setReverseTranscriptionResult] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [unsupportedCharacters, setUnsupportedCharacters] = useState<string[]>([])
  
  const transcriber = new SpanishToBrailleTranscriber()
  const reverseTranscriber = new BrailleToSpanishTranscriber()
  const isVirtualKeyboardMode = conversionMode === 'braille-to-spanish' && inputMethod === 'virtual-keyboard'

  /**
   * Maneja el cambio de texto y limpia errores si el texto cambia
   */
  const handleTextChange = (newText: string) => {
    setInputText(newText)
    if (conversionMode === 'braille-to-spanish' && inputMethod === 'virtual-keyboard' && newText === '') {
      setBrailleSymbols([])
    }
    // Limpiar errores cuando el texto cambia
    if (errors.length > 0 || unsupportedCharacters.length > 0) {
      setErrors([])
      setUnsupportedCharacters([])
    }
  }

  /**
   * Maneja la adición de símbolo desde el teclado virtual
   */
  const handleVirtualKeyboardAdd = (dots: BrailleDots, unicodeChar: string) => {
    const newSymbols = [...brailleSymbols, { dots, unicode: unicodeChar }]
    setBrailleSymbols(newSymbols)
    // Mantener un valor interno para habilitar la transcripcion; la vista usa cuadratines.
    setInputText(newSymbols.map(s => s.unicode).join(''))
  }

  /**
   * Maneja el borrado desde el teclado virtual
   */
  const handleVirtualKeyboardBackspace = () => {
    if (brailleSymbols.length > 0) {
      const newSymbols = brailleSymbols.slice(0, -1)
      setBrailleSymbols(newSymbols)
      setInputText(newSymbols.map(s => s.unicode).join(''))
    }
  }

  /**
   * Maneja la limpieza desde el teclado virtual
   */
  const handleVirtualKeyboardClear = () => {
    setBrailleSymbols([])
    setInputText('')
  }

  /**
   * Maneja la transcripción del texto
   */
  const handleTranscribe = async () => {
    const hasVirtualKeyboardInput = isVirtualKeyboardMode && brailleSymbols.length > 0

    if (!hasVirtualKeyboardInput && !inputText.trim()) return

    setIsProcessing(true)
    setErrors([])
    setUnsupportedCharacters([])

    try {
      if (conversionMode === 'spanish-to-braille') {
        // Validar entrada
        const isValid = transcriber.validateInput(inputText)
        if (!isValid) {
          const unsupported = transcriber.getUnrecognizedCharacters(inputText)
          setUnsupportedCharacters(unsupported)
          setErrors(['El texto contiene caracteres no soportados'])
          return
        }

        // Realizar transcripción
        const result = transcriber.transcribe(inputText)
        setTranscriptionResult(result)
        setReverseTranscriptionResult(null)
      } else {
        // Modo Braille → Español
        let symbols: Array<{ dots: BrailleDots }>

        if (inputMethod === 'unicode') {
          // Convertir Unicode Braille a puntos
          const dots = UnicodeBrailleConverter.unicodeTextToDots(inputText)
          symbols = dots.map(d => ({ dots: d }))
        } else if (inputMethod === 'virtual-keyboard') {
          // Usar símbolos del teclado virtual
          symbols = brailleSymbols.map(s => ({ dots: s.dots }))
        } else {
          // Modo binario (original)
          const isValid = reverseTranscriber.validateBinaryInput(inputText)
          if (!isValid) {
            setErrors(['El formato Braille no es válido. Usa formato binario (ej: 100000 110000)'])
            return
          }
          const result = reverseTranscriber.transcribeFromBinary(inputText)
          setReverseTranscriptionResult(result)
          setTranscriptionResult(null)
          setIsProcessing(false)
          return
        }

        // Realizar transcripción inversa desde puntos
        const result = reverseTranscriber.transcribe(symbols)
        setReverseTranscriptionResult(result)
        setTranscriptionResult(null)
      }

    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Error en la transcripción'])
    } finally {
      setIsProcessing(false)
    }
  }
  
  /**
   * Maneja la exportación de resultados
   */
  const handleExport = (format: 'text' | 'json' | 'pdf', options?: BrailleExportOptions) => {
    if (!transcriptionResult) return
    
    switch (format) {
      case 'text':
        exportAsText(transcriptionResult)
        break
      case 'json':
        exportAsJSON(transcriptionResult)
        break
      case 'pdf':
        exportAsPDF(transcriptionResult, options)
        break
    }
  }

  const mirrorDots = (dots: BrailleDots): BrailleDots => [
    dots[3],
    dots[4],
    dots[5],
    dots[0],
    dots[1],
    dots[2]
  ]
  
  /**
   * Exporta como archivo de texto
   */
  const exportAsText = (result: BrailleOutput) => {
    const content = `Texto Original:\n${result.originalText}\n\nTranscripcion Braille:\n${result.brailleText}\n\nEstadisticas:\nCaracteres: ${result.statistics.totalCharacters}\nSimbolos: ${result.statistics.totalSymbols}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'braille-transcription.txt'
    a.click()
    URL.revokeObjectURL(url)
  }
  
  /**
   * Exporta como JSON
   */
  const exportAsJSON = (result: BrailleOutput) => {
    const statistics = {
      totalCharacters: result.statistics.totalCharacters,
      totalSymbols: result.statistics.totalSymbols,
      unrecognizedCharacters: result.statistics.unrecognizedCharacters
    }
    const content = JSON.stringify({ ...result, statistics }, null, 2)
    
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'braille-transcription.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  
  /**
   * Exporta como PDF con jsPDF
   */
  const exportAsPDF = (result: BrailleOutput, options?: BrailleExportOptions) => {
    const mirrorMode = options?.mirrorMode ?? false
    const layout = normalizePrintLayout(options?.layout)
    const previewWindow = options?.preview ? window.open('', '_blank') : null

    if (previewWindow) {
      previewWindow.document.write('<p style="font-family: Arial, sans-serif; padding: 16px;">Generando previsualizacion PDF...</p>')
      previewWindow.document.close()
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    })

    {
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const contentWidth = pageWidth - (margin * 2)
      const cellWidth = layout.cellWidthMm
      const cellHeight = layout.cellHeightMm
      const cellGap = layout.cellGapMm
      const rowGap = layout.rowGapMm
      const dotRadius = clamp(Math.min(cellWidth / 9.6, cellHeight / 15.6), 0.3, 1.5)
      const maxSymbolsPerRow = Math.min(
        layout.cellsPerLine,
        Math.max(1, Math.floor((contentWidth + cellGap) / (cellWidth + cellGap)))
      )
      const modeLabel = mirrorMode
        ? 'MODO ESPEJO - Para uso con punzones'
        : 'Vista normal'

      let y = margin

      const printableDots = (dots: BrailleDots): BrailleDots => (
        mirrorMode ? mirrorDots(dots) : dots
      )

      const drawHeader = (compact = false) => {
        pdf.setDrawColor(0, 0, 0)
        pdf.setLineWidth(0.8)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(compact ? 13 : 18)
        pdf.setTextColor(0, 0, 0)
        pdf.text('Transcripcion Braille', margin, y)

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(90, 90, 90)
        pdf.text(modeLabel, margin, y + 6)

        pdf.line(margin, y + 10, pageWidth - margin, y + 10)
        y += compact ? 17 : 20
      }

      const drawInfoBox = () => {
        const originalTextLines = pdf.splitTextToSize(`Texto original: ${result.originalText}`, contentWidth - 12)
        const boxHeight = 18 + (originalTextLines.length * 5)

        pdf.setFillColor(245, 245, 245)
        pdf.rect(margin, y, contentWidth, boxHeight, 'F')
        pdf.setFillColor(0, 0, 0)
        pdf.rect(margin, y, 1.4, boxHeight, 'F')

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(50, 50, 50)
        pdf.text(originalTextLines, margin + 5, y + 7)
        pdf.text(`Total de simbolos: ${result.symbols.length}`, margin + 5, y + boxHeight - 8)
        pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin + 5, y + boxHeight - 3)
        y += boxHeight + 9
      }

      const drawCell = (x: number, cellY: number, dots: BrailleDots) => {
        const dotsGrid = [
          dots[0], dots[3],
          dots[1], dots[4],
          dots[2], dots[5]
        ]
        const slotWidth = cellWidth / 2
        const slotHeight = cellHeight / 3

        pdf.setDrawColor(0, 0, 0)
        pdf.setLineWidth(0.18)
        pdf.setFillColor(255, 255, 255)
        pdf.rect(x, cellY, cellWidth, cellHeight, 'FD')

        dotsGrid.forEach((dot, index) => {
          const col = index % 2
          const row = Math.floor(index / 2)
          const dotX = x + (slotWidth * col) + (slotWidth / 2)
          const dotY = cellY + (slotHeight * row) + (slotHeight / 2)

          pdf.setFillColor(dot ? 0 : 224, dot ? 0 : 224, dot ? 0 : 224)
          pdf.circle(dotX, dotY, dotRadius, 'F')
        })
      }

      const drawFooter = () => {
        pdf.setDrawColor(204, 204, 204)
        pdf.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(130, 130, 130)
        pdf.text('Generado con Transcriptor Braille - Estandar Unicode Braille', pageWidth / 2, pageHeight - 7, {
          align: 'center'
        })
      }

      const addFormattedPage = () => {
        drawFooter()
        pdf.addPage()
        y = margin
        drawHeader(true)
      }

      drawHeader()
      drawInfoBox()

      let currentColumn = 0

      result.symbols.forEach((symbol) => {
        if (currentColumn >= maxSymbolsPerRow) {
          currentColumn = 0
          y += cellHeight + rowGap
        }

        if (y + cellHeight > pageHeight - 28) {
          addFormattedPage()
          currentColumn = 0
        }

        const x = mirrorMode
          ? pageWidth - margin - cellWidth - (currentColumn * (cellWidth + cellGap))
          : margin + (currentColumn * (cellWidth + cellGap))
        drawCell(x, y, printableDots(symbol.dots))
        currentColumn++
      })

      y += cellHeight + 14
      if (y + 42 > pageHeight - 18) {
        addFormattedPage()
      }

      pdf.setFillColor(232, 244, 248)
      pdf.setDrawColor(184, 212, 227)
      pdf.setLineWidth(0.3)
      pdf.rect(margin, y, contentWidth, 36, 'FD')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.setTextColor(0, 86, 179)
      pdf.text('Instrucciones de uso:', margin + 4, y + 7)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8.5)
      pdf.setTextColor(50, 50, 50)
      const instructions = [
        'Cada cuadratin representa un caracter en Braille',
        'Los puntos negros deben punzonarse con el punzon',
        'Los puntos grises son guias de referencia',
        mirrorMode
          ? 'Esta hoja esta reflejada para punzonar por el reverso'
          : 'Para punzonar, activa el modo espejo antes de previsualizar o exportar'
      ]
      instructions.forEach((instruction, index) => {
        pdf.text(`- ${instruction}`, margin + 6, y + 14 + (index * 5))
      })

      y += 46
      if (y + 16 <= pageHeight - 18) {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(50, 50, 50)
        pdf.text(`Caracteres: ${result.statistics.totalCharacters}`, margin, y)
        pdf.text(`Simbolos: ${result.statistics.totalSymbols}`, margin, y + 5)
      }

      drawFooter()
      if (options?.preview) {
        const pdfBlob = pdf.output('blob')
        const pdfUrl = URL.createObjectURL(pdfBlob)

        if (previewWindow) {
          previewWindow.location.href = pdfUrl
        } else {
          const previewLink = document.createElement('a')
          previewLink.href = pdfUrl
          previewLink.target = '_blank'
          previewLink.rel = 'noopener noreferrer'
          previewLink.click()
        }

        window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000)
        return
      }

      pdf.save('braille-transcripcion.pdf')
      return
    }
    /*
    
    // Configuración
    
    // Título
    pdf.text('Transcripción Braille', margin, margin)
    pdf.text(`Texto original: ${result.originalText.substring(0, 50)}${result.originalText.length > 50 ? '...' : ''}`, margin, margin + 8)
    
    // Dibujar símbolos
    result.symbols.forEach((symbol, index) => {
      // Verificar si necesitamos nueva página
      if (y + symbolHeight > pageHeight - margin) {
        pdf.addPage()
        x = margin
        y = margin
        symbolCount = 0
      }
      
      // Verificar si necesitamos nueva fila
      if (symbolCount >= maxSymbolsPerRow) {
        x = margin
        y += symbolHeight + symbolSpacing
        symbolCount = 0
      }
      
      // Dibujar cuadratín (borde) - orientación vertical (3 filas × 2 columnas)
      pdf.setDrawColor(0)
      pdf.setLineWidth(0.5)
      pdf.rect(x, y, symbolWidth, symbolHeight)
      
      // Dibujar puntos (grid 3 filas × 2 columnas) - dentro del cuadratín
      const dotPositions = [
        { row: 0, col: 0, dotIndex: 0 }, // Punto 1
        { row: 0, col: 1, dotIndex: 3 }, // Punto 4
        { row: 1, col: 0, dotIndex: 1 }, // Punto 2
        { row: 1, col: 1, dotIndex: 4 }, // Punto 5
        { row: 2, col: 0, dotIndex: 2 }, // Punto 3
        { row: 2, col: 1, dotIndex: 5 }  // Punto 6
      ]
      
      // Calcular posiciones de puntos dentro del cuadratín
      const cellWidth = symbolWidth / 2
      const cellHeight = symbolHeight / 3
      
      dotPositions.forEach((pos) => {
        if (symbol.dots[pos.dotIndex]) {
          const dotX = x + (cellWidth * pos.col) + (cellWidth / 2)
          const dotY = y + (cellHeight * pos.row) + (cellHeight / 2)
          pdf.setFillColor(0, 0, 0)
          pdf.circle(dotX, dotY, dotSize, 'F')
        }
      })
      
      x += symbolWidth + symbolSpacing
      symbolCount++
    })
    
    // Estadísticas al final
    const statsY = Math.min(y + symbolHeight + 20, pageHeight - margin)
    pdf.setFontSize(10)
    pdf.text(`Caracteres: ${result.statistics.totalCharacters}`, margin, statsY)
    pdf.text(`Símbolos: ${result.statistics.totalSymbols}`, margin, statsY + 6)
    pdf.text(`Tiempo: ${result.statistics.processingTime.toFixed(2)}ms`, margin, statsY + 12)
    
    // Guardar PDF
    pdf.save('braille-transcripcion.pdf')
    */
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-16">
      <Header />
      
      {/* Hero Section adaptado para el transcriptor */}
      <section id="home" className="scroll-mt-20 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Transcriptor Español a
              <span className="text-blue-600"> Braille</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Convierte texto español a su representación en Braille. 
              Soporta el alfabeto completo, números, vocales acentuadas y signos de puntuación.
            </p>
          </div>
          
          {/* Selector de modo de conversión */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-2 shadow-lg inline-flex">
              <button
                onClick={() => {
                  setConversionMode('spanish-to-braille')
                  setInputText('')
                  setTranscriptionResult(null)
                  setReverseTranscriptionResult(null)
                  setErrors([])
                  setUnsupportedCharacters([])
                }}
                className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                  conversionMode === 'spanish-to-braille'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Español → Braille
              </button>
              <button
                onClick={() => {
                  setConversionMode('braille-to-spanish')
                  setInputText('')
                  setBrailleSymbols([])
                  setTranscriptionResult(null)
                  setReverseTranscriptionResult(null)
                  setErrors([])
                  setUnsupportedCharacters([])
                }}
                className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                  conversionMode === 'braille-to-spanish'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Braille → Español
              </button>
            </div>
          </div>

          {/* Selector de método de entrada (solo en modo Braille → Español) */}
          {conversionMode === 'braille-to-spanish' && (
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                  Método de entrada Braille
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setInputMethod('binary')
                      setInputText('')
                      setBrailleSymbols([])
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      inputMethod === 'binary'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Binario (100000)
                  </button>
                  <button
                    onClick={() => {
                      setInputMethod('unicode')
                      setInputText('')
                      setBrailleSymbols([])
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      inputMethod === 'unicode'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Unicode (⠁⠃⠉)
                  </button>
                  <button
                    onClick={() => {
                      setInputMethod('virtual-keyboard')
                      setInputText('')
                      setBrailleSymbols([])
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      inputMethod === 'virtual-keyboard'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Teclado Virtual
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Características principales */}
          <div id="features" className="scroll-mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-blue-600 text-3xl font-bold mb-2">🔤</div>
              <div className="text-gray-900 font-semibold mb-1">Alfabeto Completo</div>
              <div className="text-gray-600 text-sm">Soporta todas las letras del español</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-green-600 text-3xl font-bold mb-2">🔢</div>
              <div className="text-gray-900 font-semibold mb-1">Números</div>
              <div className="text-gray-600 text-sm">Conversión de dígitos del 0 al 9</div>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-purple-600 text-3xl font-bold mb-2">✨</div>
              <div className="text-gray-900 font-semibold mb-1">Conversión Bidireccional</div>
              <div className="text-gray-600 text-sm">Español ↔ Braille</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Sección principal del transcriptor */}
      <section id="about" className="scroll-mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={isVirtualKeyboardMode ? 'space-y-8' : 'grid grid-cols-1 lg:grid-cols-2 gap-8'}>
            {/* Panel de entrada */}
            <div className={isVirtualKeyboardMode ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 items-start' : 'space-y-6'}>
              <TextInput
                className={isVirtualKeyboardMode ? 'order-2' : undefined}
                value={inputText}
                onChange={handleTextChange}
                onTranscribe={handleTranscribe}
                isProcessing={isProcessing}
                errors={errors}
                unsupportedCharacters={unsupportedCharacters}
                placeholder={
                  conversionMode === 'spanish-to-braille'
                    ? "Escribe o pega el texto en español que quieres convertir a Braille..."
                    : inputMethod === 'binary'
                    ? "Ingresa el código Braille en formato binario (ej: 100000 110000)..."
                    : inputMethod === 'unicode'
                    ? "Pega símbolos Braille Unicode (ej: ⠁⠃⠉⠙⠑)..."
                    : "Usa el teclado virtual para ingresar Braille..."
                }
                readOnly={conversionMode === 'braille-to-spanish' && inputMethod === 'virtual-keyboard'}
                showTextActions={!(conversionMode === 'braille-to-spanish' && inputMethod === 'virtual-keyboard')}
                visualContent={
                  conversionMode === 'braille-to-spanish' && inputMethod === 'virtual-keyboard' ? (
                    brailleSymbols.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {brailleSymbols.map((symbol, index) => (
                          <BrailleSymbol
                            key={index}
                            dots={symbol.dots}
                            size="md"
                            displayMode="dots"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-56 items-center justify-center text-center text-gray-400">
                        Usa el teclado virtual para ingresar Braille...
                      </div>
                    )
                  ) : undefined
                }
                maxLength={5000}
              />
              
              {/* Teclado virtual (solo en modo Braille → Español) */}
              {conversionMode === 'braille-to-spanish' && inputMethod === 'virtual-keyboard' && (
                <div className="order-1">
                  <BrailleVirtualKeyboard
                    onSymbolAdd={handleVirtualKeyboardAdd}
                    onBackspace={handleVirtualKeyboardBackspace}
                    onClear={handleVirtualKeyboardClear}
                  />
                </div>
              )}
              
              {/* Vista previa de símbolos Braille (modo Unicode) */}
              {conversionMode === 'braille-to-spanish' && inputMethod === 'unicode' && inputText && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Vista previa:</h4>
                  <div className="text-3xl font-mono break-all">
                    {inputText}
                  </div>
                </div>
              )}
            </div>
            
            {/* Panel de resultados */}
            <div className="space-y-6">
              {transcriptionResult ? (
                <BrailleDisplay
                  transcriptionResult={transcriptionResult}
                  onExport={handleExport}
                />
              ) : reverseTranscriptionResult ? (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Resultado en Español
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <pre className="font-mono text-lg whitespace-pre-wrap">
                      {reverseTranscriptionResult.spanishText}
                    </pre>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">
                      Estadísticas de Transcripción
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Caracteres totales</div>
                        <div className="font-semibold text-blue-900">
                          {reverseTranscriptionResult.statistics.totalCharacters}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Símbolos Braille</div>
                        <div className="font-semibold text-blue-900">
                          {reverseTranscriptionResult.statistics.totalSymbols}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">No reconocidos</div>
                        <div className="font-semibold text-red-600">
                          {reverseTranscriptionResult.statistics.unrecognizedCharacters}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Tiempo procesamiento</div>
                        <div className="font-semibold text-blue-900">
                          {reverseTranscriptionResult.statistics.processingTime.toFixed(2)}ms
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      Esperando texto para transcribir
                    </h3>
                    <p className="text-gray-500">
                      {conversionMode === 'spanish-to-braille'
                        ? 'Ingresa texto en el panel izquierdo y haz clic en "Transcribir"'
                        : 'Ingresa código Braille binario y haz clic en "Transcribir"'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}

