# Retirement Planner Pro 💰

Una aplicación web profesional de simulación de jubilación que utiliza cálculos financieros avanzados con interés compuesto diario.

## 🎯 Características Principales

### Sistema de Doble Capital
1. **Capital de Caja**: Maneja ingresos mensuales, gastos diarios y tiene su propia tasa de rendimiento
2. **Reserva de Jubilación**: Recibe aportes mensuales desde el capital de caja y acumula intereses compuestos diarios

### Cálculos Financieros Avanzados
- **Interés Compuesto Diario**: Los rendimientos se calculan día a día para máxima precisión
- **Ajuste por Inflación**: Todos los cálculos consideran el impacto de la inflación
- **Proyección Dual**: Simula tanto la fase de acumulación como la fase de retiro

### Visualización Interactiva
- Gráficos dinámicos con Plotly que muestran la evolución del patrimonio
- Tabla año a año con desglose completo de ambos capitales
- Indicadores visuales de estado del plan (Excelente/Alcanzable/Insuficiente)
- Cálculo de ingreso mensual perpetuo sin agotar el capital

## 🚀 Instalación y Uso

### Requisitos Previos
- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Instalación

1. Clona o descarga este repositorio

2. Instala las dependencias:
```bash
pip install -r requirements.txt
```

3. Ejecuta la aplicación:
```bash
python app.py
```

4. Abre tu navegador en: `http://localhost:5000`

## 📊 Cómo Funciona

### Lógica Matemática

#### 1. Conversión de Tasas Anuales a Diarias
```python
tasa_diaria = (1 + tasa_anual / 100) ** (1/365) - 1
```

#### 2. Fase de Acumulación (Hasta la Jubilación)
Para cada día:
- Se aplica rendimiento diario a ambos capitales: `capital *= (1 + tasa_diaria)`
- Se resta el gasto diario del capital de caja
- Cada 30 días:
  - Se suma el ingreso mensual al capital de caja
  - Se transfiere el aporte mensual desde caja a reserva de jubilación

#### 3. Fase de Retiro (Durante la Jubilación)
Para cada día:
- Se aplica rendimiento diario a la reserva
- Se resta el gasto diario ajustado por inflación acumulada
- Se verifica si el capital es suficiente para cubrir toda la esperanza de vida

#### 4. Ingreso Perpetuo
Calcula el ingreso mensual que se puede extraer indefinidamente:
```python
tasa_real_mensual = tasa_nominal_mensual - tasa_inflacion_mensual
ingreso_perpetuo = capital * tasa_real_mensual
```

## 🎨 Estructura del Proyecto

```
jubilacion-app/
├── app.py                 # Backend Flask con lógica de cálculo
├── requirements.txt       # Dependencias de Python
├── templates/
│   └── index.html        # Interfaz de usuario
└── static/
    ├── style.css         # Estilos premium con tema oscuro
    └── script.js         # Lógica frontend y visualizaciones
```

## 💡 Parámetros Configurables

### Datos Personales
- **Edad Actual**: Tu edad actual
- **Edad de Jubilación**: Cuándo planeas jubilarte
- **Esperanza de Vida**: Hasta qué edad planeas vivir

### Capital de Caja
- **Capital Inicial**: Ahorros actuales en cuenta corriente
- **Ingreso Mensual**: Salario o ingresos mensuales
- **Gasto Diario Promedio**: Cuánto gastas por día
- **Tasa de Retorno Anual**: Rendimiento de tu cuenta (ej: 3% para cuenta de ahorro)

### Reserva de Jubilación
- **Capital Inicial**: Inversiones actuales para jubilación
- **Aporte Mensual**: Cuánto transferirás mensualmente desde caja
- **Tasa de Retorno Anual**: Rendimiento esperado (ej: 8% para inversiones)
- **Gasto Mensual Deseado**: Cuánto quieres gastar mensualmente al jubilarte

### Parámetros Económicos
- **Inflación Anual Estimada**: Proyección de inflación (ej: 3%)

## 📈 Interpretación de Resultados

### Indicadores de Estado

- **🎉 Excelente Plan**: Tu capital al jubilarte será más que suficiente, con un margen de seguridad amplio
- **✅ Plan Alcanzable**: Llegarás a tu objetivo, pero con poco margen de error
- **⚠️ Plan Insuficiente**: Necesitas aumentar aportes o reducir gastos proyectados

### Métricas Clave

- **Capital Total al Jubilarse**: Suma de ambos capitales al momento de retirarte
- **Reserva de Jubilación**: Capital específico para tu retiro
- **Capital de Caja**: Liquidez disponible al jubilarte
- **Ingreso Mensual Perpetuo**: Cuánto puedes extraer mensualmente sin agotar el capital

## 🔧 Personalización

### Modificar Tasas de Interés
Edita los valores predeterminados en `templates/index.html`:
```html
<input type="range" id="tasa_retorno_reserva_anual" min="0" max="20" value="8" step="0.5">
```

### Cambiar Colores del Tema
Modifica las variables CSS en `static/style.css`:
```css
:root {
    --primary-blue: #1e3a8a;
    --accent-cyan: #06b6d4;
    /* ... más variables */
}
```

## 📝 Notas Técnicas

- Los cálculos asumen meses de 30 días para simplificar
- El interés compuesto se aplica diariamente para máxima precisión
- La inflación se ajusta de forma compuesta, no lineal
- Los aportes mensuales solo se realizan si hay suficiente capital en caja

## 🤝 Contribuciones

Este proyecto está diseñado para ser educativo y personalizable. Siéntete libre de:
- Agregar nuevas métricas de análisis
- Mejorar las visualizaciones
- Implementar escenarios de simulación adicionales
- Optimizar los algoritmos de cálculo

## ⚖️ Disclaimer

Esta herramienta es solo para fines educativos y de planificación personal. No constituye asesoramiento financiero profesional. Consulta con un asesor financiero certificado para decisiones importantes sobre tu jubilación.

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso personal y educativo.

---

**Desarrollado con ❤️ usando Flask, Plotly y matemáticas financieras avanzadas**
