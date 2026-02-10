# 💰 Retirement Planner Pro

Una aplicación web profesional de simulación de jubilación que utiliza cálculos financieros avanzados con **interés compuesto diario** y un modelo de **doble capital**.

![Vercel Deployment](https://img.shields.io/badge/deploy-vercel-black?style=for-the-badge&logo=vercel)
![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)

---

## 🎯 Características Principales

### 🏦 Sistema de Doble Capital
1.  **Capital de Caja**: Maneja el flujo diario. Recibe ingresos mensuales, deduce gastos diarios y tiene su propia tasa de rendimiento (ideal para brokers de liquidez inmediata).
2.  **Reserva de Jubilación**: Capital de inversión a largo plazo. Recibe aportes mensuales automáticos desde el capital de caja y acumula rendimientos mediante interés compuesto diario.

### 🧮 Lógica Financiera de Alta Precisión
-   **Interés Compuesto Diario**: A diferencia de modelos simples mensuales, calculamos el rendimiento día a día para una precisión matemática absoluta.
-   **Ajuste por Inflación "Gota a Gota"**: La inflación se aplica exponencialmente cada día, simulando la pérdida de poder adquisitivo real en los gastos proyectados.
-   **Fases de Simulación**:
    -   **Acumulación**: Desde tu edad actual hasta la jubilación, optimizando el ahorro.
    -   **Retiro**: Durante la jubilación, priorizando el agotamiento de caja antes de tocar la reserva.

### 📊 Visualización e Insights
-   **Gráficos dinámicos (Plotly)**: Visualiza la evolución de ambos capitales y el patrimonio total.
-   **Tabla Detallada**: Desglose año a año con ingresos, gastos, aportes y rendimientos.
-   **Ingreso Mensual Perpetuo**: Cálculo avanzado de cuánto podrías retirar cada mes sin agotar nunca tu capital (ajustado por inflación).

---

## 🚀 Instalación y Uso Local

### Requisitos Previos
-   Python 3.8 o superior

### Instalación
1.  **Clona este repositorio:**
    ```bash
    git clone <url-del-repositorio>
    cd jubilacion-app
    ```
2.  **Instala las dependencias:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Ejecuta la aplicación:**
    ```bash
    python app.py
    ```
4.  **Accede en tu navegador:**
    `http://localhost:5001` (o el puerto indicado en la terminal).

---

## ☁️ Despliegue en Vercel

Este proyecto está configurado para ser desplegado instantáneamente en **Vercel**.

1.  Sube el código a un repositorio de **GitHub**.
2.  Conecta tu repositorio en el dashboard de Vercel.
3.  Vercel detectará el archivo `vercel.json` y desplegará la aplicación automáticamente.

---

## 🛠️ Estructura del Proyecto

-   `app.py`: Motor de cálculo financiero en Python (Flask).
-   `vercel.json`: Configuración para el despliegue en la nube.
-   `requirements.txt`: Dependencias mínimas optimizadas.
-   `templates/index.html`: Interfaz de usuario (HTML5/Vanilla JS).
-   `static/`:
    -   `style.css`: Estilos premium con Glassmorphism y Dark Mode.
    -   `script.js`: Lógica de interacción y comunicación con la API.

---

## 💡 Metodología de Cálculo

### 1. Tasas Nominales (TNA)
Todas las tasas ingresadas se tratan como Tasas Nominales Anuales (TNA). La tasa diaria se obtiene dividiendo por 365.

### 2. Prioridad de Aportes
Durante la fase de acumulación, el sistema solo transfiere dinero a la **Reserva de Jubilación** si el **Capital de Caja** tiene fondos suficientes para cubrir el aporte mensual.

### 3. Prioridad de Retiro
Durante la jubilación, el sistema intenta cubrir los gastos primero con el Capital de Caja disponible. Una vez agotado, comienza a retirar de la Reserva de Jubilación.

---

## ⚖️ Disclaimer
Esta herramienta es para fines **educativos y de planificación personal**. No constituye asesoramiento financiero profesional. Los rendimientos pasados no garantizan rendimientos futuros.

---
**Desarrollado con ❤️ para personas que aman los datos y su futuro financiero.**

