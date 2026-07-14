/**
 * @fileoverview Componente para entrada de texto español a transcribir
 * @author Kevin Palacios
 * @version 1.0.0
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle, X, Upload, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TextInputProps {
  /** Texto actual del input */
  value: string;
  
  /** Callback cuando cambia el texto */
  onChange: (value: string) => void;
  
  /** Callback para transcribir */
  onTranscribe: () => void;
  
  /** Si está procesando la transcripción */
  isProcessing?: boolean;
  
  /** Errores de validación */
  errors?: string[];
  
  /** Caracteres no soportados */
  unsupportedCharacters?: string[];
  
  /** Clases CSS adicionales */
  className?: string;
  
  /** Placeholder del textarea */
  placeholder?: string;
  
  /** Límite de caracteres */
  maxLength?: number;
  readOnly?: boolean;
  showTextActions?: boolean;
  visualContent?: React.ReactNode;
}

/**
 * Componente para entrada de texto español con validación en tiempo real
 * Soporta pegar texto, cargar desde archivo y validación de caracteres
 */
export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onTranscribe,
  isProcessing = false,
  errors = [],
  unsupportedCharacters = [],
  className,
  placeholder = 'Ingresa el texto en español que deseas convertir a Braille...',
  maxLength = 5000,
  readOnly = false,
  showTextActions = true,
  visualContent
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Actualizar estadísticas cuando cambia el texto
  useEffect(() => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharCount(value.length);
  }, [value]);
  
  /**
   * Maneja el cambio de texto
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  /**
   * Maneja eventos de teclado en el textarea
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sin Shift transcribe el texto
    // Shift+Enter permite nueva línea
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value && !isProcessing && errors.length === 0 && unsupportedCharacters.length === 0) {
        onTranscribe();
      }
    }
  };
  
  /**
   * Maneja el drag and drop de archivos
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };
  
  /**
   * Maneja la carga de archivos
   */
  const handleFileUpload = async (files: File[]) => {
    const file = files.find(f => f.type === 'text/plain' || f.name.endsWith('.txt'));
    
    if (file) {
      try {
        const text = await file.text();
        if (text.length <= maxLength) {
          onChange(text);
        } else {
          alert(`El archivo es demasiado grande. Máximo ${maxLength} caracteres.`);
        }
      } catch (error) {
        alert('Error al leer el archivo. Por favor, intenta nuevamente.');
      }
    } else {
      alert('Por favor, selecciona un archivo de texto (.txt)');
    }
  };
  
  /**
   * Maneja el input de archivos
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };
  
  /**
   * Limpia el texto y los errores
   */
  const handleClear = () => {
    onChange('');
    textareaRef.current?.focus();
  };

  /**
   * Refresca el campo de texto (mantiene el texto pero limpia errores)
   */
  const handleRefresh = () => {
    // El componente padre maneja la limpieza de errores
    // Solo enfocamos el textarea
    textareaRef.current?.focus();
  };
  
  /**
   * Inserta texto de ejemplo
   */
  const handleInsertExample = () => {
    const exampleText = 'Hola mundo. Esto es un ejemplo de transcripción a Braille.';
    onChange(exampleText);
    textareaRef.current?.focus();
  };
  
  /**
   * Renderiza los errores
   */
  const renderErrors = () => {
    if (errors.length === 0 && unsupportedCharacters.length === 0) {
      return null;
    }

    // Callback para refrescar (limpiar errores)
    const handleRefreshErrors = () => {
      // El componente padre debe manejar la limpieza de errores
      // Por ahora, solo enfocamos el textarea
      textareaRef.current?.focus();
    };

    return (
      <div className="space-y-2">
        {errors.map((error, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="ml-2"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          </div>
        ))}

        {unsupportedCharacters.length > 0 && (
          <div className="flex items-center justify-between text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium">
                  Caracteres no soportados:
                </span>
                <span className="text-sm ml-2 font-mono bg-yellow-100 px-2 py-1 rounded">
                  {unsupportedCharacters.join(', ')}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="ml-2"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={cn('bg-white rounded-lg shadow-lg border border-gray-200', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Texto de Entrada
            </h2>
            <p className="text-sm text-gray-600">
              Ingresa o carga el texto español que deseas convertir
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {showTextActions && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInsertExample}
                  disabled={isProcessing}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ejemplo
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Archivo
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </>
            )}
            
            {value && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={isProcessing}
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Área de texto */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          'hover:border-gray-400'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {visualContent ? (
          <div className="min-h-64 p-4 bg-gray-50 rounded-lg">
            {visualContent}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            readOnly={readOnly}
            className={cn(
              'w-full h-64 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg',
              readOnly && 'bg-gray-50 cursor-default font-mono text-lg leading-8'
            )}
            disabled={isProcessing}
          />
        )}
        
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg">
            <div className="text-center">
              <Upload className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-700 font-medium">
                Suelta el archivo aquí
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Estadísticas y acciones */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              Caracteres: <span className="font-medium text-gray-900">{charCount}</span>
            </span>
            <span>
              Palabras: <span className="font-medium text-gray-900">{wordCount}</span>
            </span>
            <span>
              Máximo: <span className="font-medium text-gray-900">{maxLength}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {errors.length === 0 && unsupportedCharacters.length === 0 && value && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Texto válido</span>
              </div>
            )}
            
            <Button
              onClick={onTranscribe}
              disabled={!value || isProcessing || errors.length > 0 || unsupportedCharacters.length > 0}
              className="min-w-[120px]"
            >
              {isProcessing ? 'Procesando...' : 'Transcribir'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Errores */}
      {renderErrors()}
    </div>
  );
};

export default TextInput;
