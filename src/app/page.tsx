'use client';

import React, { useState } from 'react';
import Header from '@/components/Header'
import TextInput from '@/components/braille/TextInput'
import BrailleDisplay from '@/components/braille/BrailleDisplay'
import { BrailleVirtualKeyboard } from '@/components/braille/BrailleVirtualKeyboard'
import Footer from '@/components/Footer'
import { SpanishToBrailleTranscriber } from '@/lib/braille-transcriber'
import { BrailleToSpanishTranscriber } from '@/lib/braille-to-spanish-transcriber'
import { UnicodeBrailleConverter } from '@/lib/unicode-braille-converter'
import { BrailleOutput } from '@/types/braille'
import { BrailleDots } from '@/types/braille'
import jsPDF from 'jspdf'

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

  /**
   * Maneja el cambio de texto y limpia errores si el texto cambia
   */
  const handleTextChange = (newText: string) => {
    setInputText(newText)
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
    setBrailleSymbols([...brailleSymbols, { dots, unicode: unicodeChar }])
    // Actualizar el texto de entrada con el carácter Unicode
    setInputText(inputText + unicodeChar)
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
    if (!inputText.trim()) return

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
  const handleExport = (format: 'text' | 'json' | 'pdf') => {
    if (!transcriptionResult) return
    
    switch (format) {
      case 'text':
        exportAsText(transcriptionResult)
        break
      case 'json':
        exportAsJSON(transcriptionResult)
        break
      case 'pdf':
        exportAsPDF(transcriptionResult)
        break
    }
  }
  
  /**
   * Exporta como archivo de texto
   */
  const exportAsText = (result: BrailleOutput) => {
    const content = `Texto Original:\n${result.originalText}\n\nTranscripción Braille:\n${result.brailleText}\n\nEstadísticas:\nCaracteres: ${result.statistics.totalCharacters}\nSímbolos: ${result.statistics.totalSymbols}\nTiempo: ${result.statistics.processingTime.toFixed(2)}ms`
    
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
    const content = JSON.stringify(result, null, 2)
    
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
  const exportAsPDF = (result: BrailleOutput) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    // Configuración
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const symbolWidth = 16
    const symbolHeight = 24
    const symbolSpacing = 6
    const dotSize = 2.5
    const maxSymbolsPerRow = Math.floor((pageWidth - 2 * margin) / (symbolWidth + symbolSpacing))
    
    let x = margin
    let y = margin + 20
    let symbolCount = 0
    
    // Título
    pdf.setFontSize(16)
    pdf.text('Transcripción Braille', margin, margin)
    pdf.setFontSize(10)
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
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section adaptado para el transcriptor */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel de entrada */}
            <div className="space-y-6">
              <TextInput
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
                maxLength={5000}
              />
              
              {/* Teclado virtual (solo en modo Braille → Español) */}
              {conversionMode === 'braille-to-spanish' && inputMethod === 'virtual-keyboard' && (
                <BrailleVirtualKeyboard
                  onSymbolAdd={handleVirtualKeyboardAdd}
                  onBackspace={handleVirtualKeyboardBackspace}
                  onClear={handleVirtualKeyboardClear}
                />
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
