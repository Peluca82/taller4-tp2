// TP2 - Concepto 1: Memoria (como registro)
// p5.js instance mode para el contenedor #canvas-container-memoria

let sketchMemoria = function(p) {
    let userCircle = {
        x: 0,
        y: 0,
        r: 35
    };

    let cornerShapes = [];
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

        maskGraphic = p.createGraphics(w, h);
        shapeGraphic = p.createGraphics(w, h);

        initCornerShapes(w, h);

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
        userCircle.r = p.min(w, h) * 0.09;

        maskGraphic = p.createGraphics(w, h);
        shapeGraphic = p.createGraphics(w, h);

        initCornerShapes(w, h);
    }

    function initCornerShapes(w, h) {
        let margin = 0.22;
        let size = p.min(w, h) * 0.28;

        cornerShapes = [
            { type: 'square', x: w * margin, y: h * margin, size: size, alpha: 0 },
            { type: 'circle', x: w * (1 - margin), y: h * margin, size: size, alpha: 0 },
            { type: 'triangle', x: w * margin, y: h * (1 - margin), size: size, alpha: 0 },
            { type: 'line', x: w * (1 - margin), y: h * (1 - margin), size: size, alpha: 0 }
        ];
    }

    p.draw = function() {
        p.background('#12141a');

        let card = document.getElementById('card-memoria');
        let isExpanded = card && card.classList.contains('expanded');

        if (isExpanded && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            userCircle.x = p.lerp(userCircle.x, p.mouseX, 0.2);
            userCircle.y = p.lerp(userCircle.y, p.mouseY, 0.2);
        } else if (!isExpanded) {
            let time = p.millis() * 0.0015;
            userCircle.x = p.lerp(userCircle.x, p.width / 2 + p.cos(time) * 15, 0.05);
            userCircle.y = p.lerp(userCircle.y, p.height / 2 + p.sin(time) * 15, 0.05);
        }

        let revealRadius = userCircle.r * 2.8;

        for (let shape of cornerShapes) {
            let d = p.dist(userCircle.x, userCircle.y, shape.x, shape.y);
            if (d < revealRadius) {
                let targetAlpha = p.map(d, revealRadius, shape.size * 0.5, 30, 255, true);
                shape.alpha = p.lerp(shape.alpha, targetAlpha, 0.1);
            } else {
                shape.alpha = p.lerp(shape.alpha, 0, 0.08);
            }
        }

        for (let shape of cornerShapes) {
            if (shape.alpha > 1) {
                drawShapeOutline(p, shape);
            }
        }

        p.noStroke();
        p.fill(240, 243, 248);
        p.ellipse(userCircle.x, userCircle.y, userCircle.r * 2);

        drawOverlapIntersection();
    };

    function getShapeColor() {
        let style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--shape-red-color').trim() || '#ff4757';
    }

    function drawShapeOutline(pg, shape) {
        let shapeColor = getShapeColor();
        let c = p.color(shapeColor);
        c.setAlpha(shape.alpha);

        pg.push();
        pg.translate(shape.x, shape.y);
        pg.rectMode(pg.CENTER);
        pg.ellipseMode(pg.CENTER);
        if (shape.type === 'square') {
            pg.noFill();
            pg.stroke(c);
            pg.strokeWeight(2);
            pg.rect(0, 0, shape.size, shape.size);
        } else if (shape.type === 'circle') {
            pg.noFill();
            pg.stroke(c);
            pg.strokeWeight(2);
            pg.ellipse(0, 0, shape.size, shape.size);
        } else if (shape.type === 'triangle') {
            pg.noFill();
            pg.stroke(c);
            pg.strokeWeight(2);
            let r = shape.size * 0.6;
            pg.triangle(0, -r, -r * 0.866, r * 0.5, r * 0.866, r * 0.5);
        } else if (shape.type === 'line') {
            pg.stroke(c);
            pg.strokeWeight(2);
            pg.line(-shape.size * 0.5, -shape.size * 0.5, shape.size * 0.5, shape.size * 0.5);
        }
        pg.pop();
    }

    function drawShapeFilled(pg, shape) {
        let shapeColor = getShapeColor();

        pg.push();
        pg.translate(shape.x, shape.y);
        pg.rectMode(pg.CENTER);
        pg.ellipseMode(pg.CENTER);
        pg.noStroke();
        pg.fill(shapeColor);
        if (shape.type === 'square') {
            pg.rect(0, 0, shape.size, shape.size);
        } else if (shape.type === 'circle') {
            pg.ellipse(0, 0, shape.size, shape.size);
        } else if (shape.type === 'triangle') {
            let r = shape.size * 0.6;
            pg.triangle(0, -r, -r * 0.866, r * 0.5, r * 0.866, r * 0.5);
        } else if (shape.type === 'line') {
            pg.stroke(shapeColor);
            pg.strokeWeight(4);
            pg.line(-shape.size * 0.5, -shape.size * 0.5, shape.size * 0.5, shape.size * 0.5);
        }
        pg.pop();
    }

    function drawOverlapIntersection() {
        for (let shape of cornerShapes) {
            if (shape.alpha > 5) {
                p.push();
                let clipPath = new Path2D();
                clipPath.arc(userCircle.x, userCircle.y, userCircle.r, 0, Math.PI * 2);
                p.drawingContext.clip(clipPath);
                drawShapeFilled(p, shape);
                p.pop();
            }
        }
    }

    p.windowResized = function() {
        resizeToContainer();
    };
};


// ==========================================================================
// TP2 - Concepto 3: Caducidad (como lo perdido en el tránsito)
// p5.js instance mode para el contenedor #canvas-container-caducidad
// ==========================================================================

let sketchCaducidad = function(p) {
    // Círculo contenedor blanco en el centro
    let outerContainer = {
        x: 0,
        y: 0,
        r: 100 // Radio inicial del contenedor blanco
    };

    // Bola interior dinámica (del color --shape-red-color)
    let innerBall = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        r: 30,          // Radio actual
        maxR: 30,       // Radio original
        isAlive: true,  // Estado de existencia
        respawnTimer: 0
    };

    p.setup = function() {
        let container = document.getElementById('canvas-container-caducidad');
        let w = container.clientWidth || 300;
        let h = container.clientHeight || 200;

        let canvas = p.createCanvas(w, h);
        canvas.parent('canvas-container-caducidad');

        resetSimulation(w, h);

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                resizeToContainer();
            });
            ro.observe(container);
        }
    };

    function resetSimulation(w, h) {
        outerContainer.x = w / 2;
        outerContainer.y = h / 2;
        outerContainer.r = p.min(w, h) * 0.32; // Contenedor blanco proporcional

        let maxInnerR = outerContainer.r * 0.28;
        innerBall.maxR = maxInnerR;
        innerBall.r = maxInnerR;
        innerBall.x = outerContainer.x;
        innerBall.y = outerContainer.y;

        // Velocidad aleatoria más lenta
        let angle = p.random(p.TWO_PI);
        let speed = p.random(0.8, 1.4);
        innerBall.vx = p.cos(angle) * speed;
        innerBall.vy = p.sin(angle) * speed;
        innerBall.isAlive = true;
        innerBall.respawnTimer = 0;
    }

    function resizeToContainer() {
        let container = document.getElementById('canvas-container-caducidad');
        if (!container) return;
        let w = container.clientWidth;
        let h = container.clientHeight;
        if (w === 0 || h === 0) return;

        p.resizeCanvas(w, h);
        resetSimulation(w, h);
    }

    function getRedColor() {
        let style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--shape-red-color').trim() || '#ff4757';
    }

    p.draw = function() {
        p.background('#12141a');

        let card = document.getElementById('card-caducidad');
        let isExpanded = card && card.classList.contains('expanded');

        // El usuario mueve la bola blanca cuando la casilla está maximizada
        if (isExpanded && p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            outerContainer.x = p.lerp(outerContainer.x, p.mouseX, 0.15);
            outerContainer.y = p.lerp(outerContainer.y, p.mouseY, 0.15);
        } else if (!isExpanded) {
            // En vista grilla, la bola blanca vuelve suavemente al centro
            outerContainer.x = p.lerp(outerContainer.x, p.width / 2, 0.05);
            outerContainer.y = p.lerp(outerContainer.y, p.height / 2, 0.05);
        }

        // 1. Dibujar Círculo Contenedor Blanco (puede salir del canvas libremente)
        p.noStroke();
        p.fill(240, 243, 248);
        p.ellipse(outerContainer.x, outerContainer.y, outerContainer.r * 2);

        if (innerBall.isAlive) {
            if (isExpanded) {
                // =========================================================================
                // MODO INTERACTIVO COMPLETO (Tarjeta Maximada / Expandida)
                // =========================================================================
                // Ajuste diferenciado de velocidad: Desktop vs Mobile
                let isDesktop = window.matchMedia('(min-width: 768px) and (hover: hover)').matches;
                let speedScale = isDesktop ? 2.5 : 1.1; // En Mobile va a 1.1x, en Desktop a 2.5x
                let maxSpeedScale = isDesktop ? 4.5 : 2.0;

                let sizeRatio = p.map(innerBall.r, innerBall.maxR, 3, 1.0, 1.75, true);
                let baseSpeed = speedScale * sizeRatio;
                let maxSpeed = maxSpeedScale * sizeRatio;

                let noiseVel = p.noise(p.frameCount * 0.04) - 0.5;
                let angleShift = noiseVel * 0.12;
                let currentSpeed = p.constrain(p.mag(innerBall.vx, innerBall.vy), baseSpeed, maxSpeed);
                let currentAngle = p.atan2(innerBall.vy, innerBall.vx) + angleShift;

                innerBall.vx = p.cos(currentAngle) * currentSpeed;
                innerBall.vy = p.sin(currentAngle) * currentSpeed;

                // --- Fuerza de desvío progresivo (steering) con mayor antelación para curvarse suavemente sin tocar la pared ---
                let canvasMargin = 60;
                if (innerBall.x < canvasMargin) innerBall.vx += (canvasMargin - innerBall.x) * 0.04;
                if (innerBall.x > p.width - canvasMargin) innerBall.vx -= (innerBall.x - (p.width - canvasMargin)) * 0.04;
                if (innerBall.y < canvasMargin) innerBall.vy += (canvasMargin - innerBall.y) * 0.04;
                if (innerBall.y > p.height - canvasMargin) innerBall.vy -= (innerBall.y - (p.height - canvasMargin)) * 0.04;

                innerBall.x += innerBall.vx;
                innerBall.y += innerBall.vy;

                // Garantizar 100% que la bola NUNCA trascienda o sobresalga los límites del canvas
                innerBall.x = p.constrain(innerBall.x, innerBall.r, p.width - innerBall.r);
                innerBall.y = p.constrain(innerBall.y, innerBall.r, p.height - innerBall.r);

                // Crecimiento muy lento hacia el tamaño original si se achicó
                if (innerBall.r < innerBall.maxR) {
                    innerBall.r = p.lerp(innerBall.r, innerBall.maxR, 0.002);
                }

                // Detección de colisión y rebote con la bola blanca móvil (reduce tamaño)
                let distFromCenter = p.dist(innerBall.x, innerBall.y, outerContainer.x, outerContainer.y);
                let maxAllowedDist = outerContainer.r - innerBall.r;

                if (distFromCenter >= maxAllowedDist && distFromCenter > 0) {
                    let normalX = (innerBall.x - outerContainer.x) / distFromCenter;
                    let normalY = (innerBall.y - outerContainer.y) / distFromCenter;

                    innerBall.x = outerContainer.x + normalX * maxAllowedDist;
                    innerBall.y = outerContainer.y + normalY * maxAllowedDist;

                    let dot = innerBall.vx * normalX + innerBall.vy * normalY;
                    innerBall.vx -= 1.8 * dot * normalX;
                    innerBall.vy -= 1.8 * dot * normalY;

                    innerBall.r -= innerBall.maxR * 0.15;

                    if (innerBall.r <= 2) {
                        innerBall.r = 0;
                        innerBall.isAlive = false;
                        innerBall.respawnTimer = p.millis();
                    }
                }
            } else {
                // =========================================================================
                // MODO PREVISUALIZACIÓN SERENA (Tarjeta Minimizada en Grilla)
                // =========================================================================
                // Velocidad súper pausada y suave
                let speed = 0.10;
                let noiseVel = p.noise(p.frameCount * 0.008) - 0.5;
                let angleShift = noiseVel * 0.03;
                let currentAngle = p.atan2(innerBall.vy, innerBall.vx) + angleShift;

                // Dirección base aleatoria muy lenta
                innerBall.vx = p.cos(currentAngle) * speed;
                innerBall.vy = p.sin(currentAngle) * speed;

                // Atraer suavemente la velocidad hacia el centro a medida que se aleja
                let distFromCenter = p.dist(innerBall.x, innerBall.y, outerContainer.x, outerContainer.y);
                let safeZone = (outerContainer.r - innerBall.r) * 0.4; // Zona central libre

                if (distFromCenter > safeZone) {
                    // Fuerza de desvío suave y progresiva hacia el centro
                    let pullStrength = p.map(distFromCenter, safeZone, outerContainer.r - innerBall.r, 0, 0.04, true);
                    let toCenterX = (outerContainer.x - innerBall.x);
                    let toCenterY = (outerContainer.y - innerBall.y);
                    
                    innerBall.vx += toCenterX * pullStrength * 0.1;
                    innerBall.vy += toCenterY * pullStrength * 0.1;
                }

                // Avanzar posición
                innerBall.x += innerBall.vx;
                innerBall.y += innerBall.vy;

                // Asegurar tamaño original en previsualización
                if (innerBall.r < innerBall.maxR) {
                    innerBall.r = p.lerp(innerBall.r, innerBall.maxR, 0.05);
                }
            }

            // Dibujar la bola interior del color dinámico
            let redColor = getRedColor();
            p.noStroke();
            p.fill(redColor);
            p.ellipse(innerBall.x, innerBall.y, innerBall.r * 2);

        } else {
            // Renacer tras 2 segundos para seguir jugando
            if (p.millis() - innerBall.respawnTimer > 2000) {
                resetSimulation(p.width, p.height);
            }
        }
    };

    p.windowResized = function() {
        resizeToContainer();
    };
};


// Instanciar sketches de p5.js al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    new p5(sketchMemoria);
    new p5(sketchCaducidad);
});
