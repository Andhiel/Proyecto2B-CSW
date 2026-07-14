# Documentación TypeDoc

## Objetivo

La documentación generada con TypeDoc describe la API interna del transcriptor:

- tipos compartidos de Braille;
- mapeador español/Braille;
- transcripción español a Braille;
- transcripción Braille a español;
- conversión Unicode Braille;
- componentes principales de entrada, visualización y exportación.

## Generación

```bash
npm run docs
```

El comando genera la documentación HTML en:

```text
docs/typedoc/
```

## Modo de trabajo

Cuando se modifique una clase, función pública, interfaz o componente reusable, se debe actualizar su comentario JSDoc y volver a ejecutar `npm run docs`.

La configuración está centralizada en `typedoc.json`. Los enlaces de código fuente apuntan al repositorio para que cada símbolo documentado pueda relacionarse con su implementación.
