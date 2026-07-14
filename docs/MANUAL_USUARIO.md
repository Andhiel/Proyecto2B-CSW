# Manual de Usuario - Transcriptor Braille

Bienvenido al Manual de Usuario del Transcriptor de Español a Braille y viceversa. Esta herramienta web permite a los usuarios convertir texto en español a su representación en Braille y traducir códigos Braille a texto en español de manera sencilla e intuitiva.

## 1. Características Principales

*   **Conversión Bidireccional:** Convierte texto de Español a Braille y de Braille a Español.
*   **Alfabeto Completo y Números:** Soporta todas las letras del alfabeto español, números del 0 al 9, vocales acentuadas y signos de puntuación.
*   **Múltiples Métodos de Entrada para Braille:** Soporta entrada de código en formato binario, caracteres Unicode Braille y cuenta con un teclado virtual interactivo.
*   **Exportación de Resultados:** Permite exportar la transcripción y las estadísticas en formatos Texto Puro (.txt), JSON (.json) y Documento PDF (.pdf).
*   **Diseño Responsivo y Modo Oscuro:** La interfaz se adapta a cualquier tamaño de pantalla y cuenta con soporte para modo oscuro para una mejor experiencia visual.

## 2. Instrucciones de Uso

### 2.1. Conversión de Español a Braille

1.  En la página principal, seleccione el modo **Español → Braille**.
2.  En el panel de entrada (lado izquierdo), escriba o pegue el texto en español que desea convertir.
3.  Haga clic en el botón **Transcribir**.
4.  El resultado aparecerá en el panel de resultados (lado derecho) mostrando la representación gráfica de los puntos Braille.

### 2.2. Conversión de Braille a Español

1.  En la página principal, seleccione el modo **Braille → Español**.
2.  Elija el **Método de entrada Braille** deseado:
    *   **Binario:** Ingrese el código utilizando 6 dígitos binarios por símbolo, donde 1 representa un punto en relieve y 0 un punto plano (ejemplo: `100000` para la letra 'a').
    *   **Unicode:** Pegue directamente símbolos Braille en formato Unicode (ejemplo: `⠁⠃⠉`).
    *   **Teclado Virtual:** Utilice el teclado de 6 puntos en pantalla para formar los caracteres.
3.  Haga clic en el botón **Transcribir**.
4.  El texto en español aparecerá en el panel derecho junto con estadísticas de la transcripción.

## 3. Exportación de Resultados

Una vez realizada la transcripción de Español a Braille, aparecerán botones para exportar el resultado. Puede elegir entre:

*   **Exportar TXT:** Guarda un archivo de texto con el texto original, la traducción y estadísticas básicas.
*   **Exportar JSON:** Genera un archivo con los datos estructurados, útil para procesar la información en otros sistemas.
*   **Exportar PDF:** Genera un documento PDF formateado que incluye la representación gráfica de los cuadratines Braille listos para ser visualizados o impresos.

## 4. Estadísticas de Transcripción

Al realizar cualquier transcripción, el sistema proporciona métricas útiles, entre ellas:
*   Total de caracteres.
*   Cantidad de símbolos Braille generados/analizados.
*   Caracteres no reconocidos.
*   Tiempo de procesamiento (en milisegundos).
