
    // Denominaciones
    const billetes = [
        { valor: 20000, nombre: "₡20,000" }, { valor: 10000, nombre: "₡10,000" },
        { valor: 5000, nombre: "₡5,000" }, { valor: 2000, nombre: "₡2,000" }, { valor: 1000, nombre: "₡1,000" }
    ];
    const monedas = [
        { valor: 500, nombre: "₡500" }, { valor: 100, nombre: "₡100" },
        { valor: 50, nombre: "₡50" }, { valor: 25, nombre: "₡25" },
        { valor: 10, nombre: "₡10" }, { valor: 5, nombre: "₡5" }
    ];

    let inputsBilletes = [], inputsMonedas = [], chartInstance = null;

    function validarNumero(input) {
        let valor = input.value.trim().replace(/[^0-9]/g, '');
        if (valor === '' || isNaN(valor)) valor = '0';
        let numero = parseInt(valor);
        if (isNaN(numero) || numero < 0) numero = 0;
        input.value = numero;
        input.classList.remove('error');
        return numero;
    }

    function crearInputNumerico() {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'denom-input';
        input.value = '0';
        input.inputMode = 'numeric';
        
        // Agregar evento input que actualiza en tiempo real
        input.addEventListener('input', function() { 
            validarNumero(this); 
            calcularTotalesCompletos(); 
        });
        
        return input;
    }

    function renderBilletes() {
        const container = document.getElementById('billetesGrid');
        container.innerHTML = '';
        inputsBilletes = [];
        billetes.forEach(b => {
            const div = document.createElement('div');
            div.className = 'denom-item';
            const label = document.createElement('span');
            label.className = 'denom-label';
            label.textContent = b.nombre;
            const input = crearInputNumerico();
            div.appendChild(label);
            div.appendChild(input);
            container.appendChild(div);
            inputsBilletes.push({ input, valor: b.valor, nombre: b.nombre });
        });
    }

    function renderMonedas() {
        const container = document.getElementById('monedasGrid');
        container.innerHTML = '';
        inputsMonedas = [];
        monedas.forEach(m => {
            const div = document.createElement('div');
            div.className = 'denom-item';
            const label = document.createElement('span');
            label.className = 'denom-label';
            label.textContent = m.nombre;
            const input = crearInputNumerico();
            div.appendChild(label);
            div.appendChild(input);
            container.appendChild(div);
            inputsMonedas.push({ input, valor: m.valor, nombre: m.nombre });
        });
    }

    function calcularFajos() {
        const fajos = {
            20000: validarNumero(document.getElementById('fajos20000')),
            10000: validarNumero(document.getElementById('fajos10000')),
            5000: validarNumero(document.getElementById('fajos5000')),
            2000: validarNumero(document.getElementById('fajos2000')),
            1000: validarNumero(document.getElementById('fajos1000'))
        };
        
        const totales = {
            20000: fajos[20000] * 1000000,
            10000: fajos[10000] * 500000,
            5000: fajos[5000] * 250000,
            2000: fajos[2000] * 100000,
            1000: fajos[1000] * 50000
        };
        
        document.getElementById('subtotalFajo20000').innerHTML = formatCurrency(totales[20000]);
        document.getElementById('subtotalFajo10000').innerHTML = formatCurrency(totales[10000]);
        document.getElementById('subtotalFajo5000').innerHTML = formatCurrency(totales[5000]);
        document.getElementById('subtotalFajo2000').innerHTML = formatCurrency(totales[2000]);
        document.getElementById('subtotalFajo1000').innerHTML = formatCurrency(totales[1000]);
        
        return Object.values(totales).reduce((a,b) => a + b, 0);
    }

    function calcularTotalesCompletos() {
        let totalBilletes = inputsBilletes.reduce((sum, item) => sum + (validarNumero(item.input) * item.valor), 0);
        let totalMonedas = inputsMonedas.reduce((sum, item) => sum + (validarNumero(item.input) * item.valor), 0);
        let totalFajos = calcularFajos();
        let totalGeneral = totalBilletes + totalMonedas + totalFajos;
        
        document.getElementById('totalBilletes').innerHTML = formatCurrency(totalBilletes);
        document.getElementById('totalMonedas').innerHTML = formatCurrency(totalMonedas);
        document.getElementById('totalFajos').innerHTML = formatCurrency(totalFajos);
        document.getElementById('totalEfectivo').innerHTML = formatCurrency(totalGeneral);
        
        return { totalBilletes, totalMonedas, totalFajos, totalGeneral };
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(value);
    }

    // PROYECCIÓN
    function calcularProyecciones() {
        let ventasBase = parseFloat(document.getElementById('promVentas').value) || 0;
        let gastosBase = parseFloat(document.getElementById('promGastos').value) || 0;
        let porcUtilidad = parseFloat(document.getElementById('porcUtilidad').value) || 0;
        let porcGastos = parseFloat(document.getElementById('porcGastos').value) || 0;
        let numMeses = parseInt(document.getElementById('numMeses').value) || 1;
        let tipoProyeccion = document.getElementById('tipoProyeccion').value;
        
        let factorCrecimiento = tipoProyeccion === 'optimista' ? 1.10 : (tipoProyeccion === 'conservador' ? 0.95 : 1);
        
        let ventasMensuales = [], gastosMensuales = [], utilidadesMensuales = [], rentabilidades = [];
        let ventasAcumuladas = 0, gastosAcumulados = 0;
        
        for (let i = 1; i <= numMeses; i++) {
            let yearFactor = Math.pow(factorCrecimiento, Math.floor((i - 1) / 12));
            let ventasMes = ventasBase * yearFactor;
            let gastosMes = gastosBase * yearFactor;
            let ventasMeta = ventasMes;
            let gastosIdeal = ventasMeta * (porcGastos / 100);
            let gastosFinal = Math.max(gastosMes, gastosIdeal);
            let utilidadFinal = ventasMeta - gastosFinal;
            let rentabilidad = (utilidadFinal / ventasMeta) * 100;
            
            ventasMensuales.push(ventasMeta);
            gastosMensuales.push(gastosFinal);
            utilidadesMensuales.push(utilidadFinal);
            rentabilidades.push(rentabilidad);
            ventasAcumuladas += ventasMeta;
            gastosAcumulados += gastosFinal;
        }
        
        let utilidadPromedio = utilidadesMensuales.reduce((a,b) => a + b, 0) / numMeses;
        let rentabilidadPromedio = rentabilidades.reduce((a,b) => a + b, 0) / numMeses;
        
        document.getElementById('utilidadMensual').innerHTML = formatCurrency(utilidadPromedio);
        document.getElementById('ventasTotales').innerHTML = formatCurrency(ventasAcumuladas);
        document.getElementById('rentabilidadPromedio').innerHTML = rentabilidadPromedio.toFixed(1) + '%';
        
        return { meses: Array.from({length: numMeses}, (_, i) => `Mes ${i+1}`), ventas: ventasMensuales, gastos: gastosMensuales, utilidades: utilidadesMensuales, rentabilidades, ventasTotales: ventasAcumuladas, gastosTotales: gastosAcumulados, utilidadTotal: ventasAcumuladas - gastosAcumulados };
    }

    function actualizarGrafico(datos) {
        const ctx = document.getElementById('graficoProyeccion').getContext('2d');
        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: datos.meses, datasets: [
                { label: 'Ventas Proyectadas', data: datos.ventas, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4, fill: true },
                { label: 'Gastos Proyectados', data: datos.gastos, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.4, fill: true },
                { label: 'Utilidad Neta', data: datos.utilidades, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.4, fill: true, borderDash: [5, 5] }
            ] },
            options: { responsive: true, maintainAspectRatio: true, plugins: { tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` } } }, scales: { y: { ticks: { callback: (value) => formatCurrency(value) } } } }
        });
    }

    function actualizarTabla(datos) {
        let html = `<table><thead><tr><th>Mes</th><th>Ventas (₡)</th><th>Gastos (₡)</th><th>Utilidad (₡)</th><th>Rentabilidad</th></tr></thead><tbody>`;
        for (let i = 0; i < datos.meses.length; i++) {
            let utilidadClass = datos.utilidades[i] >= 0 ? 'utilidad-positiva' : 'utilidad-negativa';
            html += `<tr><td>${datos.meses[i]}</td><td>${formatCurrency(datos.ventas[i])}</td><td>${formatCurrency(datos.gastos[i])}</td><td class="${utilidadClass}">${formatCurrency(datos.utilidades[i])}</td><td class="${utilidadClass}">${datos.rentabilidades[i].toFixed(1)}%</td></tr>`;
        }
        html += `<tr style="background:#f1f5f9;font-weight:700;"><td><strong>TOTALES</strong></td><td><strong>${formatCurrency(datos.ventasTotales)}</strong></td><td><strong>${formatCurrency(datos.gastosTotales)}</strong></td><td class="${datos.utilidadTotal >= 0 ? 'utilidad-positiva' : 'utilidad-negativa'}"><strong>${formatCurrency(datos.utilidadTotal)}</strong></td><td><strong>${((datos.utilidadTotal / datos.ventasTotales) * 100).toFixed(1)}%</strong></td></tr></tbody></table>`;
        document.getElementById('tablaDetalle').innerHTML = html;
    }

    function refreshProyeccion() { const datos = calcularProyecciones(); actualizarGrafico(datos); actualizarTabla(datos); return datos; }

    function generarReporteGlobal() {
        const totals = calcularTotalesCompletos();
        const proyDatos = calcularProyecciones();
        const fajos = {
            20000: validarNumero(document.getElementById('fajos20000')), 10000: validarNumero(document.getElementById('fajos10000')),
            5000: validarNumero(document.getElementById('fajos5000')), 2000: validarNumero(document.getElementById('fajos2000')),
            1000: validarNumero(document.getElementById('fajos1000'))
        };
        
        let detalleBilletes = '', detalleMonedas = '';
        inputsBilletes.forEach(item => { let cant = validarNumero(item.input); if (cant > 0) detalleBilletes += `<tr><td>${item.nombre}</td><td>${cant} und</td><td>${formatCurrency(cant * item.valor)}</td></tr>`; });
        inputsMonedas.forEach(item => { let cant = validarNumero(item.input); if (cant > 0) detalleMonedas += `<tr><td>${item.nombre}</td><td>${cant} und</td><td>${formatCurrency(cant * item.valor)}</td></tr>`; });
        
        const html = `
            <div style="background:#f9fafb;padding:20px;border-radius:24px;">
                <h3>📊 Reporte Integral - CajaPro</h3>
                <h4>📦 Fajos Especiales</h4>
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;"><thead><tr style="background:#e2e8f0;"><th>Denominación</th><th>Cantidad</th><th>Total</th></tr></thead>
                <tbody><tr><td>₡20,000</td><td>${fajos[20000]} fajos (${fajos[20000]*50} und)</td><td>${formatCurrency(fajos[20000]*1000000)}</td></tr>
                <tr><td>₡10,000</td><td>${fajos[10000]} fajos (${fajos[10000]*50} und)</td><td>${formatCurrency(fajos[10000]*500000)}</td></tr>
                <tr><td>₡5,000</td><td>${fajos[5000]} fajos (${fajos[5000]*50} und)</td><td>${formatCurrency(fajos[5000]*250000)}</td></tr>
                <tr><td>₡2,000</td><td>${fajos[2000]} fajos (${fajos[2000]*50} und)</td><td>${formatCurrency(fajos[2000]*100000)}</td></tr>
                <tr><td>₡1,000</td><td>${fajos[1000]} fajos (${fajos[1000]*50} und)</td><td>${formatCurrency(fajos[1000]*50000)}</td></tr></tbody></table>
                <h4>💵 Billetes</h4><table style="width:100%;border-collapse:collapse;margin-bottom:20px;"><thead><tr style="background:#e2e8f0;"><th>Denominación</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>${detalleBilletes || '<tr><td colspan="3">Sin billetes</td></tr>'}</tbody></table>
                <h4>🪙 Monedas</h4><table style="width:100%;border-collapse:collapse;margin-bottom:20px;"><thead><tr style="background:#e2e8f0;"><th>Denominación</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>${detalleMonedas || '<tr><td colspan="3">Sin monedas</td></tr>'}</tbody></table>
                <div style="background:#e6f7ec;padding:16px;border-radius:20px;margin:16px 0;"><strong>💰 TOTAL BILLETES:</strong> ${formatCurrency(totals.totalBilletes)}<br><strong>🪙 TOTAL MONEDAS:</strong> ${formatCurrency(totals.totalMonedas)}<br><strong>📦 TOTAL FAJOS:</strong> ${formatCurrency(totals.totalFajos)}<br><strong>🎯 TOTAL EFECTIVO:</strong> ${formatCurrency(totals.totalGeneral)}<hr><strong>📈 VENTAS PROYECTADAS (Total):</strong> ${formatCurrency(proyDatos.ventasTotales)}<br><strong>📉 GASTOS PROYECTADOS:</strong> ${formatCurrency(proyDatos.gastosTotales)}<br><strong>⭐ UTILIDAD PROYECTADA:</strong> ${formatCurrency(proyDatos.utilidadTotal)}</div>
                <p style="font-size:0.7rem;color:#475569;text-align:center;">Reporte generado: ${new Date().toLocaleString()} | Colones (CRC)</p>
            </div>`;
        document.getElementById('reporteDetallado').innerHTML = html;
    }

    let modoLimpiar = false;

    function refreshAll() { 
        if (modoLimpiar) {
            // Limpiar todos los campos de entrada
            inputsBilletes.forEach(item => { item.input.value = '0'; });
            inputsMonedas.forEach(item => { item.input.value = '0'; });
            ['fajos20000', 'fajos10000', 'fajos5000', 'fajos2000', 'fajos1000'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '0';
            });
            
            // Cambiar texto del botón
            document.getElementById('recalcularBtn').textContent = '🔄 Recalcular';
            modoLimpiar = false;
        } else {
            // Cambiar texto del botón para indicar que el próximo clic limpiará
            document.getElementById('recalcularBtn').textContent = '🗑️ Limpiar Campos';
            modoLimpiar = true;
        }
        
        calcularTotalesCompletos(); 
        generarReporteGlobal(); 
    }
    function refreshProyeccionYReporte() { refreshProyeccion(); generarReporteGlobal(); }

    async function exportToPDF() {
        generarReporteGlobal();
        const element = document.getElementById('reporteDetallado');
        const opt = { margin: [0.5,0.5,0.5,0.5], filename: `reporte_cajapro_${new Date().toISOString().slice(0,19).replace(/:/g, '-')}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' } };
        const btn = document.getElementById('exportarPDFBtn');
        const originalText = btn.innerText;
        btn.innerText = 'Generando PDF...';
        btn.disabled = true;
        try { await html2pdf().set(opt).from(element).save(); } catch(e) { alert('Error al generar PDF'); } finally { btn.innerText = originalText; btn.disabled = false; }
    }

    function setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = { cierre: document.getElementById('cierreSection'), proyeccion: document.getElementById('proyeccionSection'), reportes: document.getElementById('reportesSection') };
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const sectionId = item.getAttribute('data-section');
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                Object.values(sections).forEach(s => s.classList.remove('active-section'));
                if (sectionId === 'cierre') sections.cierre.classList.add('active-section');
                if (sectionId === 'proyeccion') { sections.proyeccion.classList.add('active-section'); refreshProyeccion(); }
                if (sectionId === 'reportes') { sections.reportes.classList.add('active-section'); generarReporteGlobal(); }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        renderBilletes(); renderMonedas(); setupNavigation();
        document.getElementById('recalcularBtn').addEventListener('click', refreshAll);
        document.getElementById('actualizarProyeccionBtn').addEventListener('click', refreshProyeccionYReporte);
        document.getElementById('exportarPDFBtn').addEventListener('click', exportToPDF);
        ['promVentas', 'promGastos', 'porcUtilidad', 'porcGastos', 'numMeses', 'tipoProyeccion'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', refreshProyeccionYReporte);
        });
        ['fajos20000', 'fajos10000', 'fajos5000', 'fajos2000', 'fajos1000'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => { validarNumero(el); calcularTotalesCompletos(); });
        });
        refreshAll(); refreshProyeccion();
    });
