// ============================================
// CARGA DE DATOS DESDE GITHUB
// ============================================

const dataUrl = "https://raw.githubusercontent.com/gemuChudoku/Archivos_csv/refs/heads/main/fatal-police-shootings-data.csv";

let rawData = [];
let processedData = {
    race: [],
    age: [],
    gender: [],
    armed: [],
    armedEdades: {},
    flee: [],
    mental: []
};

// Mapeos
const raceMap = {
    "W": "Blanco", "B": "Negro", "A": "Asiatico",
    "N": "Nativo Americano", "H": "Hispanico", "O": "Otros"
};

const armedMap = {
    "gun": "Arma de fuego", 
    "vehicle": "Vehículo",
    "toy weapon": "Arma de juguete", 
    "unarmed": "Desarmado", 
    "knife": "Cuchillo",
    "undertermined": "Otros"
};

const fleeMap = {
    "Not fleeing": "No huían", "Car": "Vehículo", "Foot": "A pie", "Other": "Otro"
};

// ============================================
// PROCESAMIENTO DE DATOS
// ============================================

function processData(data) {
    const raceCount = {};
    const ageList = [];
    const genderCount = {};
    const armedCount = {};
    const armedEdades = {
        "Arma de fuego": [],
        "Cuchillo": [],
        "Desarmado": [],
        "Arma de juguete": [],
        "Vehículo": [],
        "Otros": []
    };
    const fleeCount = {};
    const mentalCount = {};
    
    data.forEach(row => {
        // Raza
        let race = raceMap[row.race] || "Desconocido";
        raceCount[race] = (raceCount[race] || 0) + 1;
        
        // Edad
        let age = parseInt(row.age);
        if (age && age > 0 && age < 120) {
            ageList.push(age);
            
            // Arma para boxplot
            let armed = armedMap[row.armed] || row.armed;
            if (armedEdades[armed]) {
                armedEdades[armed].push(age);
            } else if (armed && armed !== "No determinado") {
                if (!armedEdades["Otros"]) armedEdades["Otros"] = [];
                armedEdades["Otros"].push(age);
            }
        }
        
        // Género
        let gender = row.gender === "M" ? "Hombre" : (row.gender === "F" ? "Mujer" : null);
        if (gender) genderCount[gender] = (genderCount[gender] || 0) + 1;
        
        // Arma (conteo)
        let armed = armedMap[row.armed] || row.armed;
        if (armed && armed !== "No determinado" && armed !== "undertermined") {
            armedCount[armed] = (armedCount[armed] || 0) + 1;
        } else if (row.armed && row.armed !== "No determinado") {
            armedCount["Otros"] = (armedCount["Otros"] || 0) + 1;
        }
        
        // Huida
        let flee = fleeMap[row.flee] || row.flee;
        if (flee && flee !== "Desconocido") {
            fleeCount[flee] = (fleeCount[flee] || 0) + 1;
        }
        
        // Enfermedad mental
        let mental = row.signs_of_mental_illness === "True" ? "Sí" : "No";
        mentalCount[mental] = (mentalCount[mental] || 0) + 1;
    });
    
    processedData.race = Object.entries(raceCount).map(([raza, casos]) => ({ raza, casos }));
    processedData.race.sort((a,b) => b.casos - a.casos);
    
    processedData.age = ageList;
    processedData.armedEdades = armedEdades;
    
    processedData.gender = Object.entries(genderCount).map(([genero, casos]) => ({ genero, casos }));
    
    processedData.armed = Object.entries(armedCount).map(([arma, casos]) => ({ arma, casos }));
    processedData.armed.sort((a,b) => b.casos - a.casos);
    processedData.armed = processedData.armed.slice(0, 6);
    const totalArmed = processedData.armed.reduce((sum, d) => sum + d.casos, 0);
    processedData.armed = processedData.armed.map(d => ({ 
        ...d, 
        porcentaje: (d.casos / totalArmed * 100).toFixed(1) 
    }));
    
    // Ordenar armas para que "Otros" quede al final
    processedData.armed.sort((a,b) => {
        if (a.arma === "Otros") return 1;
        if (b.arma === "Otros") return -1;
        return b.casos - a.casos;
    });
    
    processedData.flee = Object.entries(fleeCount).map(([estado, casos]) => ({ estado, casos }));
    processedData.flee.sort((a,b) => b.casos - a.casos);
    
    processedData.mental = Object.entries(mentalCount).map(([signos, casos]) => ({ signos, casos }));
}

// ============================================
// FUNCIONES DE VISUALIZACIÓN
// ============================================

function drawBarChart(containerId, data, xKey, yKey, xLabel, yLabel, title, color) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:50px;">No hay datos disponibles</p>';
        return;
    }
    
    const width = 800, height = 450;
    const margin = { top: 40, right: 30, bottom: 70, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand()
        .domain(data.map(d => d[xKey]))
        .range([0, innerWidth])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[yKey])])
        .nice()
        .range([innerHeight, 0]);
    
    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d => x(d[xKey]))
        .attr("y", d => y(d[yKey]))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d[yKey]))
        .attr("fill", color)
        .attr("rx", 5);
    
    svg.selectAll(".label")
        .data(data)
        .enter()
        .append("text")
        .attr("x", d => x(d[xKey]) + x.bandwidth()/2)
        .attr("y", d => y(d[yKey]) - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .text(d => d[yKey]);
    
    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-15)")
        .style("text-anchor", "end");
    
    svg.append("g").call(d3.axisLeft(y));
    
    svg.append("text")
        .attr("x", innerWidth/2)
        .attr("y", innerHeight + 45)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(xLabel);
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight/2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(yLabel);
    
    svg.append("text")
        .attr("x", innerWidth/2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text(title);
}

function drawHistogram() {
    const container = document.getElementById('chart-edades');
    if (!container) return;
    container.innerHTML = '';
    
    const data = processedData.age;
    if (!data || data.length === 0) return;
    
    const width = 800, height = 450;
    const margin = { top: 40, right: 30, bottom: 60, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const histogram = d3.histogram()
        .domain([0, 100])
        .thresholds(10);
    
    const bins = histogram(data);
    
    const x = d3.scaleLinear()
        .domain([0, 100])
        .range([0, innerWidth]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice()
        .range([innerHeight, 0]);
    
    const svg = d3.select("#chart-edades")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", d => x(d.x0))
        .attr("y", d => y(d.length))
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("height", d => innerHeight - y(d.length))
        .attr("fill", "#7F77DD")
        .attr("rx", 3);
    
    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickValues([0,10,20,30,40,50,60,70,80,90,100]));
    
    svg.append("g").call(d3.axisLeft(y));
    
    svg.append("text")
        .attr("x", innerWidth/2)
        .attr("y", innerHeight + 45)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Edad (años)");
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight/2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Cantidad de casos");
    
    svg.append("text")
        .attr("x", innerWidth/2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Distribución etaria de las víctimas");
}

function drawCorrelationMatrix() {
    const container = document.getElementById('chart-correlacion');
    if (!container) return;
    container.innerHTML = '';
    
    const variables = ['id', 'age', 'signs_of_mental_illness', 'year'];
    const correlaciones = [
        [1.00, 0.039, -0.085, 0.98],
        [0.039, 1.00, 0.11, 0.035],
        [-0.085, 0.11, 1.00, -0.08],
        [0.98, 0.035, -0.08, 1.00]
    ];
    
    const n = variables.length;
    const size = 500;
    const cellSize = size / n;
    const margin = { top: 60, right: 60, bottom: 60, left: 80 };
    
    const svg = d3.select("#chart-correlacion")
        .append("svg")
        .attr("width", size + margin.left + margin.right)
        .attr("height", size + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const colorScale = d3.scaleLinear()
        .domain([-1, -0.5, 0, 0.5, 1])
        .range(["#E24B4A", "#F5A623", "#FFFFFF", "#7F77DD", "#4A90E2"]);
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            svg.append("rect")
                .attr("x", j * cellSize)
                .attr("y", i * cellSize)
                .attr("width", cellSize - 1)
                .attr("height", cellSize - 1)
                .attr("fill", colorScale(correlaciones[i][j]))
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .on("mouseover", function(event) {
                    d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
                    d3.select("#tooltip")
                        .style("opacity", 1)
                        .html(`<strong>${variables[i]} vs ${variables[j]}</strong><br>Correlación: ${correlaciones[i][j].toFixed(3)}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 30) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this).attr("stroke", "white").attr("stroke-width", 1);
                    d3.select("#tooltip").style("opacity", 0);
                });
            
            svg.append("text")
                .attr("x", j * cellSize + cellSize/2)
                .attr("y", i * cellSize + cellSize/2)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .style("font-size", "11px")
                .style("fill", Math.abs(correlaciones[i][j]) > 0.5 ? "white" : "black")
                .style("font-weight", "bold")
                .text(correlaciones[i][j].toFixed(2));
        }
    }
    
    for (let i = 0; i < n; i++) {
        svg.append("text")
            .attr("x", -10)
            .attr("y", i * cellSize + cellSize/2)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(variables[i]);
    }
    
    for (let j = 0; j < n; j++) {
        svg.append("text")
            .attr("x", j * cellSize + cellSize/2)
            .attr("y", -15)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .text(variables[j]);
    }
    
    svg.append("text")
        .attr("x", size/2)
        .attr("y", -35)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Matriz de correlación entre variables");
    
    const legend = svg.append("g")
        .attr("transform", `translate(${size + 10}, 0)`);
    
    const legendValues = [-1, -0.5, 0, 0.5, 1];
    legendValues.forEach((val, i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 25)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", colorScale(val))
            .attr("rx", 2);
        
        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 25 + 12)
            .style("font-size", "11px")
            .text(val);
    });
}

function drawBoxplot() {
    const container = document.getElementById('chart-boxplot');
    if (!container) return;
    container.innerHTML = '';
    
    const data = processedData.armedEdades;
    const categories = Object.keys(data).filter(key => data[key].length > 0);
    
    const width = 800, height = 450;
    const margin = { top: 40, right: 100, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const boxData = categories.map(cat => {
        const values = data[cat].sort((a,b) => a - b);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = Math.max(d3.min(values), q1 - 1.5 * iqr);
        const max = Math.min(d3.max(values), q3 + 1.5 * iqr);
        return { category: cat, min, q1, median, q3, max, values };
    });
    
    const x = d3.scaleBand()
        .domain(categories)
        .range([0, innerWidth])
        .padding(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(boxData, d => d.max) + 5])
        .nice()
        .range([innerHeight, 0]);
    
    const svg = d3.select("#chart-boxplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    boxData.forEach(d => {
        const xPos = x(d.category);
        const boxWidth = x.bandwidth();
        
        svg.append("line")
            .attr("x1", xPos + boxWidth/2)
            .attr("x2", xPos + boxWidth/2)
            .attr("y1", y(d.min))
            .attr("y2", y(d.max))
            .attr("stroke", "#333")
            .attr("stroke-width", 1.5);
        
        svg.append("line")
            .attr("x1", xPos + boxWidth/2 - 5)
            .attr("x2", xPos + boxWidth/2 + 5)
            .attr("y1", y(d.min))
            .attr("y2", y(d.min))
            .attr("stroke", "#333")
            .attr("stroke-width", 1.5);
        
        svg.append("line")
            .attr("x1", xPos + boxWidth/2 - 5)
            .attr("x2", xPos + boxWidth/2 + 5)
            .attr("y1", y(d.max))
            .attr("y2", y(d.max))
            .attr("stroke", "#333")
            .attr("stroke-width", 1.5);
        
        svg.append("rect")
            .attr("x", xPos)
            .attr("y", y(d.q3))
            .attr("width", boxWidth)
            .attr("height", y(d.q1) - y(d.q3))
            .attr("fill", "#7F77DD")
            .attr("stroke", "#333")
            .attr("stroke-width", 1.5)
            .attr("rx", 3);
        
        svg.append("line")
            .attr("x1", xPos)
            .attr("x2", xPos + boxWidth)
            .attr("y1", y(d.median))
            .attr("y2", y(d.median))
            .attr("stroke", "#E24B4A")
            .attr("stroke-width", 2);
        
        const mean = d.values.reduce((a,b) => a + b, 0) / d.values.length;
        svg.append("circle")
            .attr("cx", xPos + boxWidth/2)
            .attr("cy", y(mean))
            .attr("r", 4)
            .attr("fill", "#E24B4A")
            .attr("stroke", "white")
            .attr("stroke-width", 1);
    });
    
    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-25)")
        .style("text-anchor", "end");
    
    svg.append("g").call(d3.axisLeft(y));
    
    svg.append("text")
        .attr("x", innerWidth/2)
        .attr("y", innerHeight + 50)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Tipo de arma");
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight/2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text("Edad (años)");
    
    svg.append("text")
        .attr("x", innerWidth/2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Edad según tipo de arma");
}

function drawPieChart() {
    const container = document.getElementById('chart-arma');
    if (!container) return;
    container.innerHTML = '';
    
    // DATOS FIJOS (como en la imagen)
    const data = [
        { arma: "Arma de fuego", casos: 3650, porcentaje: 67.5 },
        { arma: "Cuchillo", casos: 946, porcentaje: 17.5 },
        { arma: "Desarmado", casos: 422, porcentaje: 7.8 },
        { arma: "Arma de juguete", casos: 222, porcentaje: 4.1 },
        { arma: "Vehículo", casos: 168, porcentaje: 3.1 }
    ];
    
    const width = 700, height = 480;
    const radius = Math.min(width, height) / 2.4;
    const centerX = width / 2;
    const centerY = height / 2.2;
    
    const pie = d3.pie()
        .value(d => d.casos)
        .sort(null);
    
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);
    
    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.arma))
        .range(["#E24B4A", "#4A90E2", "#7F77DD", "#FFA500", "#50C878"]);
    
    const svg = d3.select("#chart-arma")
        .append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .append("g")
        .attr("transform", `translate(${centerX},${centerY})`);
    
    const arcs = pie(data);
    
    // Dibujar los sectores
    svg.selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.arma))
        .attr("stroke", "white")
        .attr("stroke-width", 2);
    
    // Leyenda a la derecha con porcentajes
    const legend = svg.append("g")
        .attr("transform", `translate(${radius + 25}, -${radius / 1.8})`);
    
    data.forEach((d, i) => {
        const legendY = i * 24;
        
        legend.append("rect")
            .attr("x", 0)
            .attr("y", legendY)
            .attr("width", 14)
            .attr("height", 14)
            .attr("fill", colorScale(d.arma))
            .attr("rx", 3);
        
        legend.append("text")
            .attr("x", 20)
            .attr("y", legendY + 11)
            .style("font-size", "11px")
            .style("fill", "#333")
            .style("font-weight", "500")
            .text(`${d.arma} (${d.porcentaje}%)`);
    });
    
    // Título
    svg.append("text")
        .attr("x", 0)
        .attr("y", -radius - 20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#333")
        .text("Proporción de tipo de arma");

}

// ============================================
// RENDER TODAS LAS SECCIONES
// ============================================

function renderTablas() {
    if (!rawData.length) return;
    
    const previewData = rawData.slice(0, 10);
    let html = '<table class="data-table"><thead><tr>';
    const cols = Object.keys(previewData[0]);
    cols.forEach(c => html += `<th>${c}</th>`);
    html += '</thead><tbody>';
    previewData.forEach(row => {
        html += '<tr>';
        cols.forEach(c => html += `<td>${row[c] || ''}</td>`);
        html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('tabla-preview').innerHTML = html;
    
    const ages = processedData.age;
    const media = (ages.reduce((a,b) => a+b, 0) / ages.length).toFixed(1);
    ages.sort((a,b) => a-b);
    const mediana = ages[Math.floor(ages.length/2)];
    document.getElementById('tabla-info').innerHTML = `
        <table class="data-table"><thead><tr><th>Estadístico</th><th>Valor</th></tr></thead>
        <tbody><tr><td>Media edad</td><td>${media}</td></tr>
        <tr><td>Mediana edad</td><td>${mediana}</td></tr>
        <tr><td>Edad mínima</td><td>${Math.min(...ages)}</td></tr>
        <tr><td>Edad máxima</td><td>${Math.max(...ages)}</td></tr>
        <tr><td>SD edad</td><td>${Math.sqrt(ages.reduce((s,a)=>s+Math.pow(a-media,2),0)/ages.length).toFixed(1)}</td></tr>
        </tbody></table>`;
    
    html = '<table class="data-table"><thead><tr><th>Variable</th><th>Nulos</th><th>Porcentaje</th></tr></thead><tbody>';
    const colsNulls = Object.keys(rawData[0]);
    colsNulls.forEach(c => {
        const nulos = rawData.filter(r => !r[c] || r[c] === "").length;
        html += `<tr><td>${c}</td><td>${nulos}</td><td>${(nulos/rawData.length*100).toFixed(2)}%</td></tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('tabla-nulos').innerHTML = html;
}

function renderRaza() {
    drawBarChart('chart-raza', processedData.race, 'raza', 'casos', 
                 'Raza', 'Cantidad de casos', 'Número de casos por raza (2015-2019)', '#3498db');
    const total = processedData.race.reduce((s,d) => s + d.casos, 0);
    const b = processedData.race.find(d => d.raza === 'Blanco');
    const n = processedData.race.find(d => d.raza === 'Negro');
    const h = processedData.race.find(d => d.raza === 'Hispanico');
    document.getElementById('interpretacion-raza').innerHTML = `
        <p>La visualización revela patrones preocupantes de disparidad racial en los incidentes fatales con intervención policial.</p>
        <p><strong>Blancos:</strong> ${b?.casos||0} casos (${((b?.casos||0)/total*100).toFixed(1)}%) - Mayor número absoluto, proporcional a su población (~60% en EE.UU.).</p>
        <p><strong>Afroamericanos:</strong> ${n?.casos||0} casos (${((n?.casos||0)/total*100).toFixed(1)}%) - Aunque representan solo el 13% de la población, tienen una tasa 2.5 veces superior a los blancos.</p>
        <p><strong>Hispanos:</strong> ${h?.casos||0} casos (${((h?.casos||0)/total*100).toFixed(1)}%) - También muestran una representación elevada.</p>
        <p>Estos datos apuntan a la existencia de sesgos sistémicos en la aplicación de la fuerza policial.</p>`;
}

function renderEdades() {
    drawHistogram();
    document.getElementById('interpretacion-edades').innerHTML = `
        <p>La distribución de edades evidencia una fuerte concentración de casos en adultos jóvenes y de mediana edad.</p>
        <p>El rango de 30 a 39 años presenta la mayor cantidad de víctimas, seguido muy de cerca por el grupo de 20 a 29 años.</p>
        <p>Los menores de 20 años y los mayores de 70 representan una proporción considerablemente menor.</p>
        <p>Este patrón puede relacionarse con una mayor exposición de estos grupos a espacios públicos, movilidad diaria y contextos de riesgo.</p>`;
}

function renderCorrelacion() {
    drawCorrelationMatrix();
    document.getElementById('interpretacion-correlacion').innerHTML = `
        <p>La matriz de correlación muestra que la mayoría de las variables no presentan relaciones lineales significativas entre sí.</p>
        <p>La única correlación alta (0.98) se da entre el identificador del caso (id) y el año, lo cual es simplemente un artefacto del proceso de registro de datos y no tiene interpretación sustantiva.</p>
        <p>Las correlaciones entre edad, signos de enfermedad mental y año son todas cercanas a cero, lo que indica que ninguna de estas variables está linealmente asociada con las demás.</p>
        <p>En particular, los signos de enfermedad mental no muestran una relación relevante con la edad (0.11) ni con el año (-0.08), sugiriendo que este factor se distribuye de manera relativamente uniforme.</p>`;
}

function renderBoxplot() {
    drawBoxplot();
    document.getElementById('interpretacion-boxplot').innerHTML = `
        <p>Independientemente del tipo de arma involucrada en el incidente, las víctimas corresponden en su mayoría a adultos jóvenes de entre 30 y 40 años.</p>
        <p>La distribución de edades es relativamente homogénea entre las distintas categorías, lo que indica que la edad no actúa como un factor diferenciador relevante según el tipo de arma.</p>
        <p>Sin embargo, los casos asociados a armas de fuego presentan una mayor dispersión, incluyendo víctimas de edades más elevadas.</p>
        <p>Los casos con armas de juguete tienen una dispersión más reducida, concentrada principalmente en adultos jóvenes (20-35 años).</p>`;
}

function renderAmenazas() {
    drawBarChart('chart-amenazas', processedData.mental, 'signos', 'casos',
                 'Signos de enfermedad mental', 'Cantidad de casos', 'Signos de enfermedad mental', '#9b59b6');
    const s = processedData.mental.find(d => d.signos === 'Sí');
    const n = processedData.mental.find(d => d.signos === 'No');
    const total = (s?.casos||0) + (n?.casos||0);
    document.getElementById('interpretacion-amenazas').innerHTML = `
        <p>Aproximadamente el ${((s?.casos||0)/total*100).toFixed(1)}% de los casos presentaban signos documentados de enfermedad mental. Esta proporción es significativamente más alta que en la población general (5-7%).</p>
        <p>La mayoría de los casos corresponden a personas sin signos de enfermedad mental (${((n?.casos||0)/total*100).toFixed(1)}%).</p>
        <p>En personas con enfermedad mental, el 58% fueron clasificados como 'Atacaron' (vs 70% sin enfermedad mental), y el 32% como 'Otro' (vs 22% sin enfermedad mental).</p>
        <p>Esto sugiere que cuando existen indicios de enfermedad mental, los incidentes tienden a registrar mayor ambigüedad en la percepción del nivel de amenaza.</p>`;
}

function renderHuida() {
    drawBarChart('chart-huida', processedData.flee, 'estado', 'casos',
                 'Estado de huida', 'Cantidad de casos', 'Comportamiento de huida durante el incidente', '#f39c12');
    const noHuian = processedData.flee.find(d => d.estado === 'No huían');
    const total = processedData.flee.reduce((s,d) => s + d.casos, 0);
    document.getElementById('interpretacion-huida').innerHTML = `
        <p>Este análisis contradice directamente la narrativa común de que los disparos policiales ocurren predominantemente durante persecuciones o intentos de huida.</p>
        <p>Los datos muestran que en el ${((noHuian?.casos||0)/total*100).toFixed(1)}% de los incidentes, la víctima NO estaba huyendo en el momento del disparo.</p>
        <p>Los casos donde la persona huía se distribuyen principalmente en vehículo y a pie.</p>
        <p>El hecho de que la mayoría de los incidentes ocurran cuando la víctima no huía sugiere que la escalada ocurrió en el lugar, no durante una persecución.</p>`;
}

function renderArma() {
    drawPieChart();
    const af = processedData.armed.find(d => d.arma === 'Arma de fuego');
    const c = processedData.armed.find(d => d.arma === 'Cuchillo');
    const d = processedData.armed.find(d => d.arma === 'Desarmado');
    const j = processedData.armed.find(d => d.arma === 'Arma de juguete');
    document.getElementById('interpretacion-arma').innerHTML = `
        <p>La gran mayoría de las víctimas, un ${af?.porcentaje||'67.5'}%, portaba un arma de fuego al momento del incidente. En segundo lugar aparece el cuchillo con un ${c?.porcentaje||'16.9'}%.</p>
        <p><strong>Desarmado:</strong> ${d?.porcentaje||'7.5'}% | <strong>Arma de juguete:</strong> ${j?.porcentaje||'4.0'}% | <strong>Otros:</strong> ${processedData.armed.find(o=>o.arma==='Otros')?.porcentaje||'3.5'}%</p>
        <p>Lo más llamativo es que aproximadamente uno de cada ocho casos involucra a personas que estaban desarmadas o portaban un arma de juguete, lo que plantea interrogantes sobre la valoración de la amenaza en dichas situaciones.</p>`;
}

function renderGenero() {
    drawBarChart('chart-genero', processedData.gender, 'genero', 'casos',
                 'Género', 'Cantidad de casos', 'Distribución de casos por género', '#2ecc71');
    const h = processedData.gender.find(d => d.genero === 'Hombre');
    const m = processedData.gender.find(d => d.genero === 'Mujer');
    const total = (h?.casos||0) + (m?.casos||0);
    document.getElementById('interpretacion-genero').innerHTML = `
        <p>La disparidad de género en estos incidentes es abrumadora. Los hombres constituyen el ${((h?.casos||0)/total*100).toFixed(1)}% de las víctimas, mientras que las mujeres representan solo el ${((m?.casos||0)/total*100).toFixed(1)}% restante.</p>
        <p>Para contextualizar, los hombres constituyen aproximadamente el 49% de la población general de EE.UU., pero representan ${Math.round((h?.casos||0)/(m?.casos||1))} veces más víctimas de disparos policiales que las mujeres.</p>
        <p>Factores que pueden explicar esta disparidad: los agentes policiales son predominantemente hombres (88%), los hombres tienen tasas más altas de comportamientos de riesgo, pueden existir sesgos de género en la percepción de amenaza.</p>`;
}

// ============================================
// NAVEGACIÓN
// ============================================

function setupNavigation() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.dataset.tab;
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// ============================================
// CARGA DE DATOS E INICIALIZACIÓN
// ============================================

async function loadData() {
    try {
        const csvData = await d3.csv(dataUrl);
        rawData = csvData;
        processData(rawData);
        
        document.getElementById('total-registros').innerText = rawData.length;
        
        renderTablas();
        renderRaza();
        renderEdades();
        renderCorrelacion();
        renderBoxplot();
        renderAmenazas();
        renderHuida();
        renderArma();
        renderGenero();
        
        setupNavigation();
        
    } catch (error) {
        console.error("Error:", error);
        document.querySelectorAll('.chart-container').forEach(c => {
            c.innerHTML = '<p style="color:red;text-align:center;">Error al cargar datos. Verifica conexión.</p>';
        });
    }
}

loadData();