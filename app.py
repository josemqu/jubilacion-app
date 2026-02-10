from flask import Flask, render_template, jsonify, request
from datetime import datetime, timedelta
import json


app = Flask(__name__)

class RetirementCalculator:
    """
    Calculadora de jubilación con dos capitales separados:
    1. Capital de Caja: Ingresos, gastos diarios, y rendimiento propio
    2. Capital de Reserva de Jubilación: Aportes mensuales con interés compuesto diario
    """
    
    def __init__(self, 
                 edad_actual,
                 edad_jubilacion,
                 esperanza_vida,
                 capital_inicial_caja,
                 capital_inicial_reserva,
                 ingreso_mensual,
                 gasto_diario,
                 aporte_mensual_jubilacion,
                 tasa_retorno_caja_anual,
                 tasa_retorno_reserva_anual,
                 inflacion_anual):
        
        self.edad_actual = edad_actual
        self.edad_jubilacion = edad_jubilacion
        self.esperanza_vida = esperanza_vida
        self.capital_inicial_caja = capital_inicial_caja
        self.capital_inicial_reserva = capital_inicial_reserva
        self.ingreso_mensual = ingreso_mensual
        self.gasto_diario = gasto_diario
        self.aporte_mensual_jubilacion = aporte_mensual_jubilacion
        
        # Convertir TNA (Tasa Nominal Anual) a tasas diarias por división simple
        self.tasa_diaria_caja = (tasa_retorno_caja_anual / 100) / 365
        self.tasa_diaria_reserva = (tasa_retorno_reserva_anual / 100) / 365
        self.tasa_diaria_inflacion = (inflacion_anual / 100) / 365
        
        self.anos_hasta_jubilacion = edad_jubilacion - edad_actual
        self.anos_jubilacion = esperanza_vida - edad_jubilacion
        
    def simular_acumulacion(self):
        """
        Simula la fase de acumulación hasta la jubilación
        Retorna datos día a día y resumen año a año
        """
        dias_totales = self.anos_hasta_jubilacion * 365
        
        # Arrays para almacenar la evolución diaria
        capital_caja = self.capital_inicial_caja
        capital_reserva = self.capital_inicial_reserva
        
        # Datos para la tabla año a año
        datos_anuales = []
        
        # Registrar estado inicial (Año 0)
        datos_anuales.append({
            'ano': datetime.now().year,
            'edad': self.edad_actual,
            'capital_caja': round(capital_caja, 2),
            'capital_reserva': round(capital_reserva, 2),
            'capital_total': round(capital_caja + capital_reserva, 2),
            'ingresos_trabajo': 0,
            'gastos_mensuales': 0,
            'gastos_anuales': 0,
            'aportes': 0,
            'flujo_neto': 0,
            'rendimiento_caja': 0,
            'rendimiento_reserva': 0,
            'rendimiento_total': 0
        })
        
        # Contador de aportes omitidos
        aportes_omitidos = 0
        
        # Variables para tracking anual
        capital_caja_inicio_ano = capital_caja
        capital_reserva_inicio_ano = capital_reserva
        ingresos_trabajo_ano = 0
        gastos_ano = 0
        aportes_ano = 0
        
        # Simulación día a día
        for dia in range(1, dias_totales + 1):
            # Aplicar rendimiento diario a ambos capitales
            capital_caja *= (1 + self.tasa_diaria_caja)
            capital_reserva *= (1 + self.tasa_diaria_reserva)
            
            # Calcular inflación diaria acumulada ("gota a gota")
            inflacion_acumulada = (1 + self.tasa_diaria_inflacion) ** dia
            
            # Restar gasto diario ajustado
            gasto_diario_ajustado = self.gasto_diario * inflacion_acumulada
            
            # Restar gasto diario ajustado del capital de caja
            capital_caja -= gasto_diario_ajustado
            gastos_ano += gasto_diario_ajustado
            
            # IMPORTANTE: El capital de caja no puede ser negativo
            if capital_caja < 0:
                capital_caja = 0
            
            # Ingresos mensuales (cada 30 días)
            if dia % 30 == 0:
                ingreso_ajustado = self.ingreso_mensual * inflacion_acumulada
                capital_caja += ingreso_ajustado
                ingresos_trabajo_ano += ingreso_ajustado
                
                # Aporte mensual a la reserva de jubilación
                if capital_caja >= self.aporte_mensual_jubilacion:
                    capital_caja -= self.aporte_mensual_jubilacion
                    capital_reserva += self.aporte_mensual_jubilacion
                    aportes_ano += self.aporte_mensual_jubilacion
                else:
                    aportes_omitidos += 1
            
            # Guardar datos anuales (cada 365 días)
            if dia % 365 == 0:
                edad = self.edad_actual + (dia // 365)
                ano_calendario = datetime.now().year + (dia // 365)
                
                # Calcular rendimientos del año
                rendimiento_caja = capital_caja - capital_caja_inicio_ano - ingresos_trabajo_ano + gastos_ano + aportes_ano
                rendimiento_reserva = capital_reserva - capital_reserva_inicio_ano - aportes_ano
                
                # Calcular flujo neto
                flujo_neto = ingresos_trabajo_ano - gastos_ano - aportes_ano
                
                datos_anuales.append({
                    'ano': ano_calendario,
                    'edad': edad,
                    'capital_caja': round(capital_caja, 2),
                    'capital_reserva': round(capital_reserva, 2),
                    'capital_total': round(capital_caja + capital_reserva, 2),
                    'ingresos_trabajo': round(ingresos_trabajo_ano, 2),
                    'gastos_mensuales': round(gastos_ano / 12, 2),
                    'gastos_anuales': round(gastos_ano, 2),
                    'aportes': round(aportes_ano, 2),
                    'flujo_neto': round(flujo_neto, 2),
                    'rendimiento_caja': round(rendimiento_caja, 2),
                    'rendimiento_reserva': round(rendimiento_reserva, 2),
                    'rendimiento_total': round(rendimiento_caja + rendimiento_reserva, 2)
                })
                
                # Resetear contadores para el próximo año
                capital_caja_inicio_ano = capital_caja
                capital_reserva_inicio_ano = capital_reserva
                ingresos_trabajo_ano = 0
                gastos_ano = 0
                aportes_ano = 0
        
        return {
            'capital_caja_final': capital_caja,
            'capital_reserva_final': capital_reserva,
            'capital_total_final': capital_caja + capital_reserva,
            'datos_anuales': datos_anuales,
            'aportes_omitidos': aportes_omitidos,
            'aportes_realizados': int(dias_totales / 30) - aportes_omitidos
        }
    
    def simular_retiro(self, capital_reserva_inicial, capital_caja_inicial, gasto_mensual_deseado):
        """
        Simula la fase de retiro durante la jubilación.
        Implementa protección contra saldos negativos y asegura cálculos precisos.
        """
        dias_totales = self.anos_jubilacion * 365
        capital_reserva = max(0, capital_reserva_inicial)
        capital_caja = max(0, capital_caja_inicial)
        
        gasto_diario_jubilacion = (gasto_mensual_deseado * 12) / 365
        
        datos_anuales = []
        
        rendimiento_caja_ano = 0
        rendimiento_reserva_ano = 0
        gastos_ano = 0
        # Tracking de cuánto del gasto deseado NO pudo ser cubierto
        deficit_ano = 0
        
        # Calcular días de inflación acumulada desde el inicio de la simulación
        dias_acumulacion = self.anos_hasta_jubilacion * 365
        
        # Flag para saber si ya se agotó el capital total
        capital_agotado_dia = None
        
        for dia in range(1, dias_totales + 1):
            # Calcular intereses del día (solo sobre saldos positivos)
            interes_caja = max(0, capital_caja) * self.tasa_diaria_caja
            interes_reserva = max(0, capital_reserva) * self.tasa_diaria_reserva
            
            # Sumar al capital
            capital_caja += interes_caja
            capital_reserva += interes_reserva
            
            # Sumar a los acumuladores anuales
            rendimiento_caja_ano += interes_caja
            rendimiento_reserva_ano += interes_reserva
            
            # Restar gasto diario ajustado por inflación
            dias_totales_simulacion = dias_acumulacion + dia
            inflacion_acumulada = (1 + self.tasa_diaria_inflacion) ** dias_totales_simulacion
            
            gasto_proyectado = gasto_diario_jubilacion * inflacion_acumulada
            
            # Lógica de retiro: Priorizar caja, luego reserva
            gasto_restante = gasto_proyectado
            
            # 1. Usar Caja
            if capital_caja > 0:
                usar_de_caja = min(capital_caja, gasto_restante)
                capital_caja -= usar_de_caja
                gasto_restante -= usar_de_caja
            
            # 2. Usar Reserva
            if gasto_restante > 0 and capital_reserva > 0:
                usar_de_reserva = min(capital_reserva, gasto_restante)
                capital_reserva -= usar_de_reserva
                gasto_restante -= usar_de_reserva
            
            # El gasto real es lo que pudimos cubrir
            gasto_real = gasto_proyectado - gasto_restante
            gastos_ano += gasto_real
            deficit_ano += gasto_restante
            
            # Marcar el día en que se acaba el dinero
            if capital_caja <= 1e-9 and capital_reserva <= 1e-9 and capital_agotado_dia is None:
                if gasto_restante > 0:
                    capital_agotado_dia = dia
            
            # Guardar datos anuales
            if dia % 365 == 0 or dia == dias_totales:
                anos_retiro = (dia // 365) if dia % 365 == 0 else (dia // 365) + 1
                edad = self.edad_jubilacion + anos_retiro - 1
                anos_desde_inicio = self.edad_jubilacion - self.edad_actual
                ano_calendario = datetime.now().year + anos_desde_inicio + anos_retiro - 1
                
                datos_anuales.append({
                    'ano': ano_calendario,
                    'edad': edad,
                    'capital_caja': round(max(0, capital_caja), 2),
                    'capital_reserva': round(max(0, capital_reserva), 2),
                    'capital_total': round(max(0, capital_caja + capital_reserva), 2),
                    'gastos_mensuales': round(gastos_ano / 12, 2),
                    'gastos_anuales': round(gastos_ano, 2),
                    'gasto_mensual_ajustado': round(gasto_proyectado * 365 / 12, 2),
                    'deficit_anual': round(deficit_ano, 2),
                    'rendimiento_caja': round(rendimiento_caja_ano, 2),
                    'rendimiento_reserva': round(rendimiento_reserva_ano, 2),
                    'rendimiento_total': round(rendimiento_caja_ano + rendimiento_reserva_ano, 2)
                })
                
                # Resetear contadores para el próximo año
                rendimiento_caja_ano = 0
                rendimiento_reserva_ano = 0
                gastos_ano = 0
                deficit_ano = 0
        
        # Calcular años cubiertos con más precisión
        if capital_agotado_dia is not None:
            anos_cubiertos = capital_agotado_dia / 365
        else:
            anos_cubiertos = self.anos_jubilacion
            
        return {
            'capital_final': max(0, capital_reserva + capital_caja),
            'anos_cubiertos': round(anos_cubiertos, 1),
            'datos_anuales': datos_anuales,
            'es_suficiente': capital_agotado_dia is None
        }
            

        
        return {
            'capital_final': max(0, capital_reserva + capital_caja),
            'anos_cubiertos': dia / 365,
            'datos_anuales': datos_anuales,
            'es_suficiente': (capital_reserva + capital_caja) > 0
        }
    
    def calcular_ingreso_perpetuo(self, capital):
        """
        Calcula el ingreso mensual perpetuo que se puede extraer
        sin agotar el capital (ajustado por inflación)
        """
        # Tasa real = tasa nominal - inflación
        tasa_real_mensual = ((1 + self.tasa_diaria_reserva) ** 30 - 1) - \
                           ((1 + self.tasa_diaria_inflacion) ** 30 - 1)
        
        return capital * tasa_real_mensual

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calcular', methods=['POST'])
def calcular():
    try:
        data = request.json
        
        calc = RetirementCalculator(
            edad_actual=int(data['edad_actual']),
            edad_jubilacion=int(data['edad_jubilacion']),
            esperanza_vida=int(data['esperanza_vida']),
            capital_inicial_caja=float(data['capital_inicial_caja']),
            capital_inicial_reserva=float(data['capital_inicial_reserva']),
            ingreso_mensual=float(data['ingreso_mensual']),
            gasto_diario=float(data['gasto_mensual']) * 12 / 365,
            aporte_mensual_jubilacion=float(data['aporte_mensual_jubilacion']),
            tasa_retorno_caja_anual=float(data['tasa_retorno_caja_anual']),
            tasa_retorno_reserva_anual=float(data['tasa_retorno_reserva_anual']),
            inflacion_anual=float(data['inflacion_anual'])
        )
        
        # Fase de acumulación
        resultado_acumulacion = calc.simular_acumulacion()
        
        # Fase de retiro
        gasto_mensual_deseado = float(data.get('gasto_mensual_deseado', data['gasto_mensual']))
        resultado_retiro = calc.simular_retiro(
            resultado_acumulacion['capital_reserva_final'],
            resultado_acumulacion['capital_caja_final'],
            gasto_mensual_deseado
        )
        
        # Ingreso perpetuo
        ingreso_perpetuo = calc.calcular_ingreso_perpetuo(
            resultado_acumulacion['capital_reserva_final']
        )
        
        # Determinar estado del plan
        if resultado_retiro['es_suficiente']:
            if resultado_retiro['capital_final'] > resultado_acumulacion['capital_reserva_final'] * 0.5:
                estado = 'excelente'
            else:
                estado = 'alcanzable'
        else:
            estado = 'insuficiente'
        
        # Combinar datos anuales de ambas fases
        tabla_completa = resultado_acumulacion['datos_anuales'] + resultado_retiro['datos_anuales']
        
        return jsonify({
            'success': True,
            'acumulacion': resultado_acumulacion,
            'retiro': resultado_retiro,
            'ingreso_perpetuo_mensual': round(ingreso_perpetuo, 2),
            'estado': estado,
            'tabla_anual': tabla_completa
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001)
