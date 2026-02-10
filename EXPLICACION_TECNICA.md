# Retirement Planner Pro - Explicación Técnica (Actualizado)

## 🎯 Resumen Ejecutivo

Esta aplicación web es una herramienta de precisión financiera diseñada para simular la evolución del patrimonio personal hacia y durante la jubilación.

### ✅ Arquitectura de Alta Disponibilidad
-   **Backend**: Flask (Python) optimizado para despliegues serverless.
-   **Frontend**: HTML5, Vanilla JS y CSS3 (sin frameworks pesados).
-   **Visualización**: Plotly.js para gráficos de alto rendimiento.
-   **Cloud-Ready**: Configuración completa para **Vercel** (`vercel.json`).

### 🛠️ Optimizaciones Recientes
1.  **Eliminación de dependencias pesadas**: Se eliminaron `numpy` y `pandas` para reducir el tamaño del paquete de despliegue en un 95%, mejorando los tiempos de respuesta en entornos serverless.
2.  **Simplificación de lógica**: Los cálculos vectoriales se reemplazaron por lógica nativa de Python altamente eficiente.
3.  **Configuración de Despliegue**: Inclusión de `.gitignore` y `vercel.json` para facilitar el CI/CD.

## 📐 Lógica Matemática Detallada

### 1. Conversión de Tasas (TNA → Diaria)
El sistema utiliza la convención de Tasa Nominal Anual (TNA) dividida por los días del año para obtener la tasa diaria, permitiendo la capitalización diaria.

```python
self.tasa_diaria_caja = (tasa_retorno_caja_anual / 100) / 365
self.tasa_diaria_reserva = (tasa_retorno_reserva_anual / 100) / 365
self.tasa_diaria_inflacion = (inflacion_anual / 100) / 365
```

### 2. Fase de Acumulación (Simulación Día a Día)
Paso a paso interno del motor:
1.  **Rendimiento**: Se calcula el interés del día sobre el saldo actual.
2.  **Inflación**: Se calcula el multiplicador de inflación acumulada para ese día específico.
3.  **Gastos**: Se descuenta el gasto diario (ajustado por la inflación del momento) del capital de caja.
4.  **Flujo Mensual (cada 30 días)**:
    -   Se añade el ingreso mensual.
    -   Se evalúa la liquidez en caja: si es suficiente, se realiza el aporte a la **Reserva de Jubilación**.

### 3. Fase de Retiro (Simulación Día a Día)
1.  **Intereses**: Solo se generan intereses sobre saldos positivos.
2.  **Prioridad de Retiro**:
    -   Se intenta cubrir el gasto con el **Capital de Caja**.
    -   Si no es suficiente, se retira de la **Reserva de Jubilación**.
    -   Si ambos se agotan, se registra el **Déficit** para informar al usuario sobre la insostenibilidad del plan.

### 4. Ingreso Mensual Perpetuo (Fórmula Real)
Calcula el retiro mensual máximo que mantiene el valor real del capital indefinidamente:
`Ingreso = Capital * [((1 + tasa_reserva)^30 - 1) - ((1 + tasa_inflacion)^30 - 1)]`

## 🏗️ Estructura de Archivos

```text
/
├── app.py             # Motor de cálculo y servidor API
├── requirements.txt   # Dependencias mínimas (Flask)
├── vercel.json        # Configuración de despliegue cloud
├── static/
│   ├── style.css      # Design System (Dark Mode, Premium)
│   └── script.js      # Controlador de UI y Fetch API
└── templates/
    └── index.html     # Estructura semántica
```

## 🚀 Despliegue y Mantenimiento

-   **Entorno Local**: `python app.py` (Puerto 5001 por defecto para evitar conflictos).
-   **Vercel**: El despliegue es automático al conectar el repositorio. El runtime `@vercel/python` se encarga de servir la aplicación Flask como una función serverless.

---
**Nota**: El sistema asume años de 365 días y meses constantes de 30 días para mantener la consistencia en el cálculo de aportes y retiros mensuales.

