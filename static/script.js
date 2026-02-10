// Actualizar valores de los inputs en tiempo real
function updateValue(element) {
    const id = element.id;
    const value = element.value;
    const displayElement = document.getElementById(id + '_value');
    
    if (displayElement) {
        if (id.includes('edad') || id.includes('esperanza')) {
            displayElement.textContent = `${value} años`;
        } else if (id.includes('tasa') || id.includes('inflacion')) {
            displayElement.textContent = `${parseFloat(value).toFixed(1)}%`;
        }
    }
}

// Formatear números como moneda
function formatCurrency(value) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Formatear números con separadores de miles
function formatNumber(value) {
    return new Intl.NumberFormat('es-AR').format(Math.round(value));
}

// Manejar importación de archivo
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = e.target.result;
            window.retirementPlanner.importConfig(jsonData);
        } catch (error) {
            console.error('Error al leer el archivo:', error);
            alert('Error al leer el archivo. Asegúrate de que sea un JSON válido.');
        }
    };
    reader.readAsText(file);
    
    // Limpiar el input para permitir reimportar el mismo archivo
    event.target.value = '';
}


// Función principal de cálculo
async function calcular() {
    // Mostrar loading
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    
    // Recopilar datos del formulario
    const data = {
        edad_actual: parseInt(document.getElementById('edad_actual').value),
        edad_jubilacion: parseInt(document.getElementById('edad_jubilacion').value),
        esperanza_vida: parseInt(document.getElementById('esperanza_vida').value),
        capital_inicial_caja: parseFloat(document.getElementById('capital_inicial_caja').value),
        capital_inicial_reserva: parseFloat(document.getElementById('capital_inicial_reserva').value),
        ingreso_mensual: parseFloat(document.getElementById('ingreso_mensual').value),
        gasto_mensual: parseFloat(document.getElementById('gasto_mensual').value),
        aporte_mensual_jubilacion: parseFloat(document.getElementById('aporte_mensual_jubilacion').value),
        tasa_retorno_caja_anual: parseFloat(document.getElementById('tasa_retorno_caja_anual').value),
        tasa_retorno_reserva_anual: parseFloat(document.getElementById('tasa_retorno_reserva_anual').value),
        inflacion_anual: parseFloat(document.getElementById('inflacion_anual').value),
        gasto_mensual_deseado: parseFloat(document.getElementById('gasto_mensual_deseado').value)
    };
    
    try {
        // Realizar petición al backend
        const response = await fetch('/calcular', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            mostrarResultados(result);
        } else {
            alert('Error en el cálculo: ' + result.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al realizar el cálculo. Por favor, intenta nuevamente.');
    } finally {
        document.getElementById('loading').classList.add('hidden');
    }
}

// Mostrar resultados en la interfaz
function mostrarResultados(result) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
    
    // Actualizar indicador de estado
    const statusCard = document.getElementById('status-indicator');
    const statusIcon = document.getElementById('status-icon');
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');
    
    statusCard.className = 'status-card ' + result.estado;
    
    if (result.estado === 'excelente') {
        statusIcon.textContent = '🎉';
        statusTitle.textContent = '¡Excelente Plan!';
        statusMessage.textContent = 'Tu plan de jubilación es sólido y te permitirá vivir cómodamente con un margen de seguridad significativo.';
    } else if (result.estado === 'alcanzable') {
        statusIcon.textContent = '✅';
        statusTitle.textContent = 'Plan Alcanzable';
        statusMessage.textContent = 'Tu plan de jubilación es viable, pero con poco margen. Considera aumentar tus aportes si es posible.';
    } else {
        statusIcon.textContent = '⚠️';
        statusTitle.textContent = 'Plan Insuficiente';
        statusMessage.textContent = 'Tus ahorros actuales no serán suficientes. Necesitas aumentar tus aportes o ajustar tus expectativas de gasto.';
    }
    
    // Actualizar métricas principales
    document.getElementById('capital_total_final').textContent = 
        formatCurrency(result.acumulacion.capital_total_final);
    document.getElementById('capital_reserva_final').textContent = 
        formatCurrency(result.acumulacion.capital_reserva_final);
    document.getElementById('capital_caja_final').textContent = 
        formatCurrency(result.acumulacion.capital_caja_final);
    document.getElementById('ingreso_perpetuo').textContent = 
        formatCurrency(result.ingreso_perpetuo_mensual);
    
    // Mostrar advertencia si hubo aportes omitidos
    const warningDiv = document.getElementById('aportes-warning');
    if (result.acumulacion.aportes_omitidos > 0) {
        const totalAportes = result.acumulacion.aportes_realizados + result.acumulacion.aportes_omitidos;
        const porcentajeOmitido = (result.acumulacion.aportes_omitidos / totalAportes * 100).toFixed(1);
        
        warningDiv.innerHTML = `
            <strong>⚠️ Advertencia:</strong> Se omitieron <strong>${result.acumulacion.aportes_omitidos}</strong> 
            aportes mensuales (${porcentajeOmitido}% del total) debido a capital de caja insuficiente. 
            Considera reducir gastos o aumentar ingresos.
        `;
        warningDiv.classList.remove('hidden');
    } else {
        warningDiv.classList.add('hidden');
    }

    
    // Crear gráfico
    crearGrafico(result.tabla_anual, 
                 parseInt(document.getElementById('edad_jubilacion').value));
    
    // Crear tabla
    crearTabla(result.tabla_anual);
}

// Crear gráfico de evolución
function crearGrafico(datosAnuales, edadJubilacion) {
    const anos = datosAnuales.map(d => d.ano);
    const capitalCaja = datosAnuales.map(d => d.capital_caja || 0);
    const capitalReserva = datosAnuales.map(d => d.capital_reserva);
    const capitalTotal = datosAnuales.map(d => d.capital_total || (d.capital_caja || 0) + d.capital_reserva);
    
    // Encontrar el año calendario de jubilación (primer año sin ingresos_trabajo)
    const primerAnoRetiro = datosAnuales.find(d => d.ingresos_trabajo === undefined);
    const anoJubilacion = primerAnoRetiro ? primerAnoRetiro.ano : edadJubilacion;
    
    const traces = [
        {
            x: anos,
            y: capitalReserva,
            name: 'Reserva de Jubilación',
            type: 'scatter',
            mode: 'lines',
            fill: 'tonexty',
            line: {
                color: '#3b82f6',
                width: 3
            },
            fillcolor: 'rgba(59, 130, 246, 0.3)'
        },
        {
            x: anos,
            y: capitalCaja,
            name: 'Capital de Caja',
            type: 'scatter',
            mode: 'lines',
            fill: 'tozeroy',
            line: {
                color: '#10b981',
                width: 3
            },
            fillcolor: 'rgba(16, 185, 129, 0.3)'
        },
        {
            x: anos,
            y: capitalTotal,
            name: 'Capital Total',
            type: 'scatter',
            mode: 'lines',
            line: {
                color: '#f59e0b',
                width: 4,
                dash: 'dot'
            }
        }
    ];
    
    const layout = {
        title: {
            text: 'Proyección de Patrimonio a lo Largo del Tiempo',
            font: {
                size: 18,
                color: '#cbd5e1'
            }
        },
        xaxis: {
            title: 'Año',
            gridcolor: '#334155',
            color: '#cbd5e1'
        },
        yaxis: {
            title: 'Capital (USD)',
            gridcolor: '#334155',
            color: '#cbd5e1',
            tickformat: '$,.0f'
        },
        plot_bgcolor: '#1e293b',
        paper_bgcolor: '#1e293b',
        font: {
            color: '#cbd5e1'
        },
        hovermode: 'x unified',
        legend: {
            orientation: 'h',
            y: -0.2,
            x: 0.5,
            xanchor: 'center'
        },
        shapes: [
            {
                type: 'line',
                x0: anoJubilacion,
                x1: anoJubilacion,
                y0: 0,
                y1: 1,
                yref: 'paper',
                line: {
                    color: '#ef4444',
                    width: 2,
                    dash: 'dash'
                }
            }
        ],
        annotations: [
            {
                x: anoJubilacion,
                y: 1,
                yref: 'paper',
                text: 'Jubilación',
                showarrow: false,
                font: {
                    color: '#ef4444',
                    size: 12
                },
                yshift: 10
            }
        ]
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };
    
    Plotly.newPlot('chart', traces, layout, config);
}

// Crear tabla año a año
function crearTabla(datosAnuales) {
    const tbody = document.getElementById('tabla-body');
    tbody.innerHTML = '';
    
    datosAnuales.forEach(dato => {
        const row = document.createElement('tr');
        
        // Determinar si es fase de acumulación o retiro
        const esAcumulacion = dato.ingresos_trabajo !== undefined;
        
        if (esAcumulacion) {
            // Fase de acumulación - mostrar todos los detalles
            const flujoNetoClass = dato.flujo_neto >= 0 ? 'positive' : 'negative';
            const rendCajaClass = dato.rendimiento_caja >= 0 ? 'positive' : 'negative';
            const rendReservaClass = dato.rendimiento_reserva >= 0 ? 'positive' : 'negative';
            
            row.innerHTML = `
                <td><strong>${dato.ano}</strong></td>
                <td>${dato.edad}</td>
                <td class="positive">${formatCurrency(dato.ingresos_trabajo)}</td>
                <td class="negative">${formatCurrency(dato.gastos_anuales)}</td>
                <td class="neutral">${formatCurrency(dato.aportes)}</td>
                <td class="${flujoNetoClass}">${formatCurrency(dato.flujo_neto)}</td>
                <td class="${rendCajaClass}">${formatCurrency(dato.rendimiento_caja)}</td>
                <td class="${rendReservaClass}">${formatCurrency(dato.rendimiento_reserva)}</td>
                <td>${formatCurrency(dato.capital_caja)}</td>
                <td>${formatCurrency(dato.capital_reserva)}</td>
                <td><strong>${formatCurrency(dato.capital_total || (dato.capital_caja + dato.capital_reserva))}</strong></td>
            `;
        } else {
            // Fase de retiro - mostrar gastos, rendimientos y déficit si existe
            const rendCajaClass = dato.rendimiento_caja >= 0 ? 'positive' : 'negative';
            const rendReservaClass = dato.rendimiento_reserva >= 0 ? 'positive' : 'negative';
            const hasDeficit = dato.deficit_anual > 0;
            const gastoDisplay = hasDeficit ? 
                `<span class="negative">${formatCurrency(dato.gastos_anuales)}</span><br><small class="warning-text">Déficit: ${formatCurrency(dato.deficit_anual)}</small>` : 
                `<span class="negative">${formatCurrency(dato.gastos_anuales)}</span>`;
            
            row.innerHTML = `
                <td><strong>${dato.ano}</strong></td>
                <td>${dato.edad}</td>
                <td class="retirement-phase">-</td>
                <td>${gastoDisplay}</td>
                <td class="retirement-phase">-</td>
                <td class="negative">${formatCurrency(-(dato.gastos_anuales + (dato.deficit_anual || 0)))}</td>
                <td class="${rendCajaClass}">${formatCurrency(dato.rendimiento_caja)}</td>
                <td class="${rendReservaClass}">${formatCurrency(dato.rendimiento_reserva)}</td>
                <td>${formatCurrency(dato.capital_caja || 0)}</td>
                <td>${formatCurrency(dato.capital_reserva)}</td>
                <td><strong>${formatCurrency(dato.capital_total || dato.capital_reserva)}</strong></td>
            `;
        }
        
        tbody.appendChild(row);
    });
}


// ============================================
// PERSISTENCIA EN LOCAL STORAGE
// ============================================

const STORAGE_KEY = 'retirement_planner_data';

// Lista de todos los campos a persistir
const FIELDS_TO_PERSIST = [
    'edad_actual',
    'edad_jubilacion',
    'esperanza_vida',
    'capital_inicial_caja',
    'capital_inicial_reserva',
    'ingreso_mensual',
    'gasto_mensual',
    'aporte_mensual_jubilacion',
    'tasa_retorno_caja_anual',
    'tasa_retorno_reserva_anual',
    'inflacion_anual',
    'gasto_mensual_deseado'
];

// Guardar valores en localStorage
function saveToLocalStorage() {
    const data = {};
    FIELDS_TO_PERSIST.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            data[fieldId] = element.value;
        }
    });
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        console.log('✅ Datos guardados en localStorage');
    } catch (error) {
        console.error('❌ Error al guardar en localStorage:', error);
    }
}

// Cargar valores desde localStorage
function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            console.log('ℹ️ No hay datos guardados en localStorage');
            return false;
        }
        
        const data = JSON.parse(savedData);
        let loadedCount = 0;
        
        FIELDS_TO_PERSIST.forEach(fieldId => {
            if (data[fieldId] !== undefined) {
                const element = document.getElementById(fieldId);
                if (element) {
                    element.value = data[fieldId];
                    updateValue(element);
                    loadedCount++;
                }
            }
        });
        
        console.log(`✅ ${loadedCount} valores cargados desde localStorage`);
        return true;
    } catch (error) {
        console.error('❌ Error al cargar desde localStorage:', error);
        return false;
    }
}

// Limpiar localStorage (útil para debugging)
function clearLocalStorage() {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ localStorage limpiado');
}

// Exportar configuración como JSON (para compartir o backup)
function exportConfig() {
    const data = {};
    FIELDS_TO_PERSIST.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            data[fieldId] = element.value;
        }
    });
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'retirement_planner_config.json';
    link.click();
    URL.revokeObjectURL(url);
}

// Importar configuración desde JSON
function importConfig(jsonData) {
    try {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        FIELDS_TO_PERSIST.forEach(fieldId => {
            if (data[fieldId] !== undefined) {
                const element = document.getElementById(fieldId);
                if (element) {
                    element.value = data[fieldId];
                    updateValue(element);
                }
            }
        });
        
        saveToLocalStorage();
        calcular();
        console.log('✅ Configuración importada exitosamente');
    } catch (error) {
        console.error('❌ Error al importar configuración:', error);
        alert('Error al importar la configuración. Verifica que el archivo sea válido.');
    }
}

// ============================================
// INICIALIZACIÓN Y EVENT LISTENERS
// ============================================

// Calcular automáticamente al cargar la página
window.addEventListener('load', () => {
    // Cargar valores guardados desde localStorage
    const hasStoredData = loadFromLocalStorage();
    
    // Inicializar valores de display para todos los inputs
    document.querySelectorAll('input[type="range"]').forEach(input => {
        updateValue(input);
    });
    
    // Mostrar mensaje si se cargaron datos
    if (hasStoredData) {
        console.log('📊 Configuración anterior restaurada');
    }
    
    // Calcular proyección inicial
    setTimeout(calcular, 500);
});

// Recalcular cuando cambian los inputs (con debounce)
let calcularTimeout;
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        // Guardar en localStorage cada vez que cambia un valor
        saveToLocalStorage();
        
        // Recalcular con debounce
        clearTimeout(calcularTimeout);
        calcularTimeout = setTimeout(calcular, 1000);
    });
});

// Exponer funciones globalmente para debugging en consola
window.retirementPlanner = {
    saveToLocalStorage,
    loadFromLocalStorage,
    clearLocalStorage,
    exportConfig,
    importConfig
};
