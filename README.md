# 🔫 Análisis de Muertes por Disparos Policiales en EE.UU. (2015-2019)

## 📊 Descripción
Este proyecto consiste en el análisis exploratorio de un dataset sobre incidentes de muertes causadas por disparos de la policía en Estados Unidos durante el período 2015-2019. A través de una aplicación interactiva desarrollada con **D3.js**, se presentan diferentes visualizaciones que permiten identificar patrones, tendencias y relaciones entre variables como la edad, género, raza, tipo de arma, nivel de amenaza y estado de huida.

**Aplicación en línea:** https://haarveyd.github.io/d3app/

---

## 📁 Dataset

- **Fuente**: The Washington Post (en colaboración con el FBI y los CDC)
- **URL**: https://raw.githubusercontent.com/gemuChudoku/Archivos_csv/refs/heads/main/fatal-police-shootings-data.csv
- **Período**: 2015 - 2019
- **Registros**: 5,416 incidentes fatales
- **Variables**: 14 columnas que incluyen edad, género, raza, estado, ciudad, tipo de arma, nivel de amenaza, estado de huida, signos de enfermedad mental, uso de cámara corporal y fecha

---

## 📈 Hallazgos Principales

### 1. Disparidad racial persistente
- **Blancos:** 2,282 casos (42.1%) - Mayor número absoluto, proporcional a su población (~60% en EE.UU.)
- **Afroamericanos:** 1,195 casos (22.1%) - Tasa 2.5 veces superior a los blancos
- **Hispanos:** 839 casos (15.5%) - Representación elevada

### 2. Concentración en adultos jóvenes
- Pico en el rango de 30-39 años (1,414 casos)
- 53% de las víctimas tienen entre 20 y 39 años
- Edad promedio: 36.5 años | Mediana: 35 años

### 3. Disparidad de género abrumadora
- **Hombres:** 95.5% de las víctimas (5,172 casos)
- **Mujeres:** 4.5% (244 casos)
- Los hombres representan 27 veces más víctimas que las mujeres en relación a su proporción poblacional

### 4. Mayoría de casos sin intento de huida
- **63.9%** de los incidentes ocurren sin que la víctima esté huyendo
- Contradice la narrativa común de que estos eventos ocurren durante persecuciones

### 5. Arma de fuego como factor predominante
- **67.5%** portaba un arma de fuego
- 17.5% cuchillo | 7.8% desarmado | 4.1% arma de juguete | 3.1% vehículo
- 1 de cada 8 casos (12.4%) involucra a personas desarmadas o con armas de juguete

### 6. Salud mental como factor asociado
- **25%** de los casos presentaban signos de enfermedad mental
- Proporción muy superior a la población general (5-7%)

### 7. Estabilidad temporal del fenómeno
- El número anual de incidentes se mantuvo estable entre 2015 y 2019
- Rango: 962 - 1,002 casos anuales
- Sin reducciones significativas a pesar del debate público y reformas

### 8. Concentración geográfica desigual
- Estados con mayor concentración: California, Texas, Florida
- Tasas per cápita más altas: Oklahoma, Nuevo México, Arizona, Nevada, Luisiana

### 9. Bajo uso de cámaras corporales
- Solo el **28%** de los incidentes contaba con registro de cámara corporal

---

## 🎨 Visualizaciones Implementadas

| N° | Visualización | Descripción |
|----|---------------|-------------|
| 1 | Gráfico de barras | Casos por raza |
| 2 | Histograma | Distribución etaria de las víctimas |
| 3 | Matriz de correlación (Heatmap) | Correlación entre variables numéricas |
| 4 | Boxplot | Edad según tipo de arma |
| 5 | Gráfico de barras | Signos de enfermedad mental |
| 6 | Gráfico de barras | Comportamiento de huida |
| 7 | Gráfico circular (Pie chart) | Proporción de tipo de arma |
| 8 | Gráfico de barras | Distribución de casos por género |

---

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura de la aplicación
- **CSS3** - Estilos, grid, flexbox, responsive design
- **D3.js v7** - Visualizaciones interactivas
- **GitHub Pages** - Despliegue y hosting

---

## 📂 Estructura del Proyecto
d3app/
├── index.html # Página principal
├── css/
│ └── style.css # Estilos y layout
├── js/
│ └── main.js # Lógica y visualizaciones D3.js
└── README.md # Documentación


---

## 💻 Instalación y Ejecución Local

### Requisitos Previos

- **Navegador web** (Chrome, Firefox, Edge, Safari)
- **Visual Studio Code** (recomendado)
- **Live Server** (extensión de VS Code) o cualquier servidor HTTP local

### Opción 1: Live Server (Recomendada)

1. Abre Visual Studio Code
2. Ve a la pestaña de **Extensiones** (Ctrl+Shift+X)
3. Busca "**Live Server**" (de Ritwick Dey) e instálala
4. Abre la carpeta del proyecto en VS Code
5. Haz clic derecho en `index.html`
6. Selecciona **"Open with Live Server"**
7. Se abrirá automáticamente en: `http://127.0.0.1:5500`

### Opción 2: Clonar desde GitHub

```bash
# Clonar el repositorio
git clone https://github.com/haarveyd/d3app.git

# Entrar a la carpeta
cd d3app

# Abrir index.html en el navegador

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

🌐 Acceso Online
La aplicación está desplegada en GitHub Pages:

🔗 https://haarveyd.github.io/d3app/


📊 Funcionalidades de la App
Navegación por sidebar - Acceso a todas las visualizaciones

Gráficos interactivos - Hover tooltips con información detallada

Diseño responsive - Adaptable a dispositivos móviles

Matriz de correlación - Visualización de relaciones entre variables

Boxplot de edades - Distribución etaria según tipo de arma

Gráfico circular - Proporciones con leyenda externa

⚠️ Limitaciones del Análisis
Los datos dependen de reportes oficiales que pueden contener sesgos de registro

No se incluyen muertes por otras formas de fuerza policial (asfixia, golpes, etc.)

La variable "nivel de amenaza" es subjetiva y determinada por los agentes

No hay información sistemática sobre el contexto completo del incidente

El dataset no incluye incidentes no fatales

👨‍💻 Autores
Carlos Losada 
Harvey Lozada 

📧 Contacto: hdlozadag@libertadores.edu.co

🔗 Enlaces de interés
Repositorio GitHub: https://github.com/haarveyd/d3app

App en vivo: https://haarveyd.github.io/d3app/

Fuente de datos: https://github.com/gemuChudoku/Archivos_csv