// TP2 - Concepto 1: Memoria (como registro)
// p5.js instance mode para el contenedor #canvas-container-memoria

let sketchMemoria = function(p) {
    // Círculo principal controlado por el usuario (ratón / touch)
    let userCircle = {
        x: 0,
        y: 0,
        r: 65 // Radio del círculo principal
    };

    // 4 figuras ocultas en las esquinas (Línea/Línea, Cuadrado, Círculo, Triángulo)
    // requeridas según consigna del TP2
    let cornerShapes = [];

    // Graficos booleanos para recorte / solapamiento (Boolean Masking)
    let maskGraphic;
    let shapeGraphic;

    p.setup = function() {
        let container = document.getElementById('canvas-container-memoria');
        let w = container.clientWidth || 300;
        let h = container.clientHeight || 200;

        let canvas = p.createCanvas(w, h);
        canvas.parent('canvas-container-memoria');

        userCircle.x = w / 2;
        userCircle.y = h / 2;

        // Crear buffers gráficos para la máscara de solapamiento
        maskGraphic = p.createGraphics(w, h);
        shapeGraphic = p.createGraphics(w, h);

        initCornerShapes(w, h);

        // ResizeObserver para detectar cuando la casilla se expande / maximiza
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                resizeToContainer();
            });
            ro.observe(container);
        }
    };

    function resizeToContainer() {
        let container = document.getElementById('canvas-container-memoria');
        if (!container) return;
        let w = container.clientWidth;
        let h = container.clientHeight;
        if (w === 0 || h === 0) return;

        p.resizeCanvas(w, h);

        maskGraphic = p.createGraphics(w, h);
        shapeGraphic = p.createGraphics(w, h);

        initCornerShapes(w, h);
    }

    function initCornerShapes(w, h) {
        let margin = 0.22; // Margen proporcional desde las esquinas
        let size = p.min(w, h) * 0.28;

        cornerShapes = [
            {
                type: 'square',
                x: w * margin,
                y: h * margin,
                size: size,
                alpha: 0,
                color: '#ff4757' // Rojo / Accent Bloque 1
            },
            {
                type: 'circle',
                x: w * (1 - margin),
                y: h * margin,
                size: size,
                alpha: 0,
                color: '#ff4757'
            },
            {
                type: 'triangle',
                x: w * margin,
                y: h * (1 - margin),
                size: size,
                alpha: 0,
                color: '#ff4757'
            },
            {
                type: 'line',
                x: w * (1 - margin),
                y: h * (1 - margin),
                size: size,
                alpha: 0,
                color: '#ff4757'
            }
        ];
    }

    p.draw = function() {
        p.background('#12141a');

        // Solo permitir interactuar si la tarjeta está expandida / maximizada
        let card = document.getElementById('card-memoria');
        let isExpanded = card && card.classList.contains('expanded');

        if (isExpanded && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            userCircle.x = p.lerp(userCircle.x, p.mouseX, 0.2);
            userCircle.y = p.lerp(userCircle.y, p.mouseY, 0.2);
        } else if (!isExpanded) {
            // Animación autónoma suave en vista grilla (previsualización estática/animada en el centro)
            let time = p.millis() * 0.0015;
            userCircle.x = p.lerp(userCircle.x, p.width / 2 + p.cos(time) * 15, 0.05);
            userCircle.y = p.lerp(userCircle.y, p.height / 2 + p.sin(time) * 15, 0.05);
        }

        // 1. Calcular distancia de revelado (Fade-In de transparencia)
        let revealRadius = userCircle.r * 2.8;

        for (let shape of cornerShapes) {
            let d = p.dist(userCircle.x, userCircle.y, shape.x, shape.y);
            
            if (d < revealRadius) {
                // Aumentar opacidad a medida que el círculo principal se acerca
                let targetAlpha = p.map(d, revealRadius, shape.size * 0.5, 30, 255, true);
                shape.alpha = p.lerp(shape.alpha, targetAlpha, 0.1);
            } else {
                // Disipar opacidad (fade out) cuando se aleja
                shape.alpha = p.lerp(shape.alpha, 0, 0.08);
            }
        }

        // 2. Dibujar contornos revelados de las 4 figuras de las esquinas (sin relleno)
        for (let shape of cornerShapes) {
            if (shape.alpha > 1) {
                drawShapeOutline(p, shape);
            }
        }

        // 3. Dibujar el Círculo Principal que controla el usuario (Blanco brillante)
        p.noStroke();
        p.fill(240, 243, 248);
        p.ellipse(userCircle.x, userCircle.y, userCircle.r * 2);

        // 4. MÁSCARA DE SOLAPAMIENTO (Relleno en las zonas interseccionadas)
        drawOverlapIntersection();
    };

    function drawShapeOutline(pg, shape) {
        pg.push();
        pg.translate(shape.x, shape.y);
        pg.rectMode(pg.CENTER);
        pg.ellipseMode(pg.CENTER);
        if (shape.type === 'square') {
            pg.noFill();
            pg.stroke(255, 71, 87, shape.alpha);
            pg.strokeWeight(2);
            pg.rect(0, 0, shape.size, shape.size);
        } else if (shape.type === 'circle') {
            pg.noFill();
            pg.stroke(255, 71, 87, shape.alpha);
            pg.strokeWeight(2);
            pg.ellipse(0, 0, shape.size, shape.size);
        } else if (shape.type === 'triangle') {
            pg.noFill();
            pg.stroke(255, 71, 87, shape.alpha);
            pg.strokeWeight(2);
            let r = shape.size * 0.6;
            pg.triangle(
                0, -r,
                -r * 0.866, r * 0.5,
                r * 0.866, r * 0.5
            );
        } else if (shape.type === 'line') {
            pg.stroke(255, 71, 87, shape.alpha);
            pg.strokeWeight(2);
            pg.line(-shape.size * 0.5, -shape.size * 0.5, shape.size * 0.5, shape.size * 0.5);
        }
        pg.pop();
    }

    function drawShapeFilled(pg, shape) {
        pg.push();
        pg.translate(shape.x, shape.y);
        pg.rectMode(pg.CENTER);
        pg.ellipseMode(pg.CENTER);
        pg.noStroke();
        pg.fill(255, 71, 87); // Relleno Rojo de solapamiento
        if (shape.type === 'square') {
            pg.rect(0, 0, shape.size, shape.size);
        } else if (shape.type === 'circle') {
            pg.ellipse(0, 0, shape.size, shape.size);
        } else if (shape.type === 'triangle') {
            let r = shape.size * 0.6;
            pg.triangle(
                0, -r,
                -r * 0.866, r * 0.5,
                r * 0.866, r * 0.5
            );
        } else if (shape.type === 'line') {
            pg.stroke(255, 71, 87);
            pg.strokeWeight(4);
            pg.line(-shape.size * 0.5, -shape.size * 0.5, shape.size * 0.5, shape.size * 0.5);
        }
        pg.pop();
    }

    function drawOverlapIntersection() {
        // Recorte vectorial directo sobre el lienzo principal mediante clip()
        // Esto elimina cualquier discrepancia de escala o resolución entre buffers
        for (let shape of cornerShapes) {
            if (shape.alpha > 5) {
                p.push();
                // 1. Crear máscara circular centrada en el círculo del usuario
                let clipPath = new Path2D();
                clipPath.arc(userCircle.x, userCircle.y, userCircle.r, 0, Math.PI * 2);
                p.drawingContext.clip(clipPath);

                // 2. Dibujar la figura rellena recortada de forma exacta dentro del círculo
                drawShapeFilled(p, shape);
                p.pop();
            }
        }
    }

    p.windowResized = function() {
        resizeToContainer();
    };
};

// Instanciar sketch de p5 en el elemento #canvas-container-memoria
document.addEventListener('DOMContentLoaded', () => {
    new p5(sketchMemoria);
});
