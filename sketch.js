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
// TP2 - Concepto 2: Herencia (como legado)
// p5.js instance mode para el contenedor #canvas-container-herencia
// ==========================================================================

let sketchHerencia = function(p) {
    let circleRadius = 30;

    // Círculo progenitor (usuario)
    let parentCircle = {
        x: 0,
        y: 0,
        alpha: 255
    };

    // Círculo heredero (repite el recorrido)
    let heirCircle = {
        x: 0,
        y: 0,
        visible: false,
        pathIndex: 0,
        alpha: 255
    };

    // Estados de interacción: 'IDLE', 'RECORDING', 'REPLAYING', 'RESETTING'
    let state = 'IDLE';
    let recordedPath = [];
    let replaySpeed = 1.0;
    let postReplayDelay = 0;

    // Para la animación autónoma en miniatura (grilla)
    let previewPath = [];
    let previewStep = 0;

    p.setup = function() {
        let container = document.getElementById('canvas-container-herencia');
        let w = container.clientWidth || 300;
        let h = container.clientHeight || 200;

        let canvas = p.createCanvas(w, h);
        canvas.parent('canvas-container-herencia');

        resetToCenter(w, h);

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                resizeToContainer();
            });
            ro.observe(container);
        }
    };

    function resetToCenter(w, h) {
        circleRadius = p.min(w, h) * 0.09;
        parentCircle.x = w / 2;
        parentCircle.y = h / 2;
        parentCircle.alpha = 255;

        heirCircle.x = w / 2;
        heirCircle.y = h / 2;
        heirCircle.visible = false;
        heirCircle.pathIndex = 0;
        heirCircle.alpha = 255;

        recordedPath = [];
        state = 'IDLE';
    }

    function resizeToContainer() {
        let container = document.getElementById('canvas-container-herencia');
        if (!container) return;
        let w = container.clientWidth;
        let h = container.clientHeight;
        if (w === 0 || h === 0) return;

        p.resizeCanvas(w, h);
        resetToCenter(w, h);
    }

    function getAccentColor() {
        let style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--shape-red-color').trim() || '#ff4757';
    }

    p.draw = function() {
        p.background('#12141a');

        let card = document.getElementById('card-herencia');
        let isExpanded = card && card.classList.contains('expanded');
        let accentColor = getAccentColor();

        if (isExpanded) {
            // =========================================================================
            // MODO INTERACTIVO (Tarjeta Expandida)
            // =========================================================================
            handleInteractiveMode(accentColor);
        } else {
            // =========================================================================
            // MODO PREVISUALIZACIÓN AUTÓNOMA (Tarjeta en Grilla)
            // =========================================================================
            handlePreviewMode(accentColor);
        }
    };

    function handleInteractiveMode(accentColor) {
        let mouseInCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;

        // Máquina de estados
        if (state === 'IDLE') {
            parentCircle.x = p.lerp(parentCircle.x, p.width / 2, 0.1);
            parentCircle.y = p.lerp(parentCircle.y, p.height / 2, 0.1);
            parentCircle.alpha = 255;
            heirCircle.visible = false;

            // Si el usuario hace clic o arrastra dentro del canvas
            if (p.mouseIsPressed && mouseInCanvas) {
                state = 'RECORDING';
                recordedPath = [];
                parentCircle.x = p.mouseX;
                parentCircle.y = p.mouseY;
                recordedPath.push({ x: parentCircle.x, y: parentCircle.y });
            }
        } 
        else if (state === 'RECORDING') {
            if (p.mouseIsPressed) {
                // Seguir al puntero
                parentCircle.x = p.lerp(parentCircle.x, p.mouseX, 0.35);
                parentCircle.y = p.lerp(parentCircle.y, p.mouseY, 0.35);

                // Guardar punto si hay desplazamiento mínimo para mantener suavidad
                let lastPoint = recordedPath[recordedPath.length - 1];
                if (!lastPoint || p.dist(lastPoint.x, lastPoint.y, parentCircle.x, parentCircle.y) > 3) {
                    recordedPath.push({ x: parentCircle.x, y: parentCircle.y });
                }
            } else {
                // Al soltar el mouse/touch
                if (recordedPath.length > 8) {
                    // Iniciar reproducción del legado
                    state = 'REPLAYING';
                    heirCircle.visible = true;
                    heirCircle.pathIndex = 0;
                    heirCircle.x = recordedPath[0].x;
                    heirCircle.y = recordedPath[0].y;
                    heirCircle.alpha = 255;
                    // Velocidad adaptativa según longitud del camino
                    replaySpeed = p.max(1, recordedPath.length / 90);
                } else {
                    // Camino muy corto -> resetear
                    state = 'IDLE';
                }
            }
        } 
        else if (state === 'REPLAYING') {
            // El círculo original queda en reposo como testigo con opacidad sutil
            parentCircle.alpha = p.lerp(parentCircle.alpha, 140, 0.1);

            // Avanzar el círculo heredero a lo largo de la trayectoria grabada
            heirCircle.pathIndex += replaySpeed;

            if (heirCircle.pathIndex < recordedPath.length - 1) {
                let currIdx = p.floor(heirCircle.pathIndex);
                let nextIdx = p.min(currIdx + 1, recordedPath.length - 1);
                let frac = heirCircle.pathIndex - currIdx;

                let p1 = recordedPath[currIdx];
                let p2 = recordedPath[nextIdx];

                heirCircle.x = p.lerp(p1.x, p2.x, frac);
                heirCircle.y = p.lerp(p1.y, p2.y, frac);
            } else {
                // Fin del recorrido alcanzado
                let lastPt = recordedPath[recordedPath.length - 1];
                heirCircle.x = lastPt.x;
                heirCircle.y = lastPt.y;
                postReplayDelay = p.millis();
                state = 'RESETTING';
            }
        } 
        else if (state === 'RESETTING') {
            // Pausa breve para contemplar el legado antes de retornar
            if (p.millis() - postReplayDelay > 400) {
                parentCircle.x = p.lerp(parentCircle.x, p.width / 2, 0.08);
                parentCircle.y = p.lerp(parentCircle.y, p.height / 2, 0.08);
                parentCircle.alpha = p.lerp(parentCircle.alpha, 255, 0.1);

                heirCircle.x = p.lerp(heirCircle.x, p.width / 2, 0.08);
                heirCircle.y = p.lerp(heirCircle.y, p.height / 2, 0.08);
                heirCircle.alpha = p.lerp(heirCircle.alpha, 0, 0.1);

                let dParent = p.dist(parentCircle.x, parentCircle.y, p.width / 2, p.height / 2);
                let dHeir = p.dist(heirCircle.x, heirCircle.y, p.width / 2, p.height / 2);

                if (dParent < 3 && dHeir < 3) {
                    resetToCenter(p.width, p.height);
                }
            }
        }

        // --- Renderizado Gráfico ---

        // 1. Dibujar la línea de trayectoria (el legado grabado)
        if (recordedPath.length > 1) {
            p.noFill();
            p.strokeWeight(2);
            let pathCol = p.color(accentColor);
            pathCol.setAlpha(60);
            p.stroke(pathCol);

            p.beginShape();
            for (let pt of recordedPath) {
                p.vertex(pt.x, pt.y);
            }
            p.endShape();
        }

        // 2. Dibujar Círculo Original / Progenitor (Blanco)
        p.noStroke();
        p.fill(240, 243, 248, parentCircle.alpha);
        p.ellipse(parentCircle.x, parentCircle.y, circleRadius * 2);

        // 3. Dibujar Círculo Heredero (Color dinámico del Bloque 1)
        if (heirCircle.visible) {
            let heirCol = p.color(accentColor);
            heirCol.setAlpha(heirCircle.alpha);

            // Aura / resplandor exterior suave
            let glowCol = p.color(accentColor);
            glowCol.setAlpha(heirCircle.alpha * 0.3);
            p.fill(glowCol);
            p.ellipse(heirCircle.x, heirCircle.y, circleRadius * 2.5);

            // Cuerpo del círculo heredero
            p.fill(heirCol);
            p.ellipse(heirCircle.x, heirCircle.y, circleRadius * 2);
        }
    }

    function handlePreviewMode(accentColor) {
        // En la miniatura de la grilla: animación cíclica armónica
        let time = p.millis() * 0.0015;
        let cx = p.width / 2;
        let cy = p.height / 2;
        let scaleX = p.width * 0.28;
        let scaleY = p.height * 0.24;

        // Movimiento armónico en forma de infinito / ocho suave
        let px = cx + p.sin(time) * scaleX;
        let py = cy + p.sin(time * 2) * 0.5 * scaleY;

        // Posición del heredero (retrasado en el tiempo: mismo recorrido exacto con delay)
        let delayTime = time - 0.7;
        let hx = cx + p.sin(delayTime) * scaleX;
        let hy = cy + p.sin(delayTime * 2) * 0.5 * scaleY;

        // Trayectoria guía muy tenue
        p.noFill();
        let trackCol = p.color(accentColor);
        trackCol.setAlpha(25);
        p.stroke(trackCol);
        p.strokeWeight(1.5);
        p.beginShape();
        for (let a = 0; a < p.TWO_PI; a += 0.1) {
            let x = cx + p.sin(a) * scaleX;
            let y = cy + p.sin(a * 2) * 0.5 * scaleY;
            p.vertex(x, y);
        }
        p.endShape(p.CLOSE);

        // 1. Círculo Progenitor (Blanco)
        p.noStroke();
        p.fill(240, 243, 248, 220);
        p.ellipse(px, py, circleRadius * 2);

        // 2. Círculo Heredero (Color dinámico)
        let heirCol = p.color(accentColor);
        p.fill(heirCol);
        p.ellipse(hx, hy, circleRadius * 2);
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


// ==========================================================================
// TP2 - Bloque 2: Concepto 6 - Colaboración (como coexistencia de lo diverso)
// p5.js instance mode para el contenedor #canvas-container-colaboracion
// ==========================================================================

let sketchColaboracion = function(p) {
    const TOTAL_LINES = 12;
    const LINES_PER_SQUARE = 4;
    const TOTAL_SQUARES = 3; // 12 líneas / 4 = 3 cuadrados máx.
    const HOLD_DURATION = 5000; // 5 segundos formado

    let lines = [];
    let squares = [];
    let squareSize = 60;

    // Miniatura autónoma
    let previewTimer = 0;
    let previewFormed = false;

    p.setup = function() {
        let container = document.getElementById('canvas-container-colaboracion');
        let w = container.clientWidth || 300;
        let h = container.clientHeight || 200;

        let canvas = p.createCanvas(w, h);
        canvas.parent('canvas-container-colaboracion');

        initSystem(w, h);

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                resizeToContainer();
            });
            ro.observe(container);
        }
    };

    function initSystem(w, h) {
        squareSize = p.min(w, h) * 0.28;
        lines = [];
        squares = [];

        // Inicializar los 3 cuadrados potenciales
        for (let i = 0; i < TOTAL_SQUARES; i++) {
            squares.push({
                id: i,
                state: 'INACTIVE', // 'INACTIVE', 'FORMING', 'FORMED'
                centerX: w / 2,
                centerY: h / 2,
                formedTime: 0,
                targetSize: squareSize
            });
        }

        // Inicializar las 12 líneas diversas
        for (let i = 0; i < TOTAL_LINES; i++) {
            let groupId = p.floor(i / LINES_PER_SQUARE);
            let sideId = i % LINES_PER_SQUARE; // 0: top, 1: right, 2: bottom, 3: left

            let angle = p.random(p.TWO_PI);
            let speed = p.random(0.5, 1.5);
            let posX = p.random(w * 0.1, w * 0.9);
            let posY = p.random(h * 0.1, h * 0.9);
            let len = squareSize;

            let half = len / 2;
            let x1 = posX - p.cos(angle) * half;
            let y1 = posY - p.sin(angle) * half;
            let x2 = posX + p.cos(angle) * half;
            let y2 = posY + p.sin(angle) * half;

            lines.push({
                id: i,
                group: groupId,
                side: sideId,
                status: 'FREE', // 'FREE', 'ASSEMBLING', 'LOCKED'
                x: posX,
                y: posY,
                vx: p.cos(angle) * speed,
                vy: p.sin(angle) * speed,
                angle: angle,
                vRot: p.random(-0.02, 0.02),
                len: len,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            });
        }
    }

    function resizeToContainer() {
        let container = document.getElementById('canvas-container-colaboracion');
        if (!container) return;
        let w = container.clientWidth;
        let h = container.clientHeight;
        if (w === 0 || h === 0) return;

        p.resizeCanvas(w, h);
        squareSize = p.min(w, h) * 0.28;
        for (let l of lines) {
            l.len = squareSize;
        }
        for (let sq of squares) {
            sq.targetSize = squareSize;
        }
    }

    function getAccentColor() {
        let style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--subsystem-2-accent').trim() || '#2ed573';
    }

    p.draw = function() {
        p.background('#12141a');

        let card = document.getElementById('card-colaboracion');
        let isExpanded = card && card.classList.contains('expanded');
        let accentColor = getAccentColor();

        if (isExpanded) {
            handleInteractiveMode(accentColor);
        } else {
            handlePreviewMode(accentColor);
        }
    };

    function handleInteractiveMode(accentColor) {
        let mouseInCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;

        // Si el usuario mantiene presionado el mouse, convocar un grupo de 4 líneas disponibles
        if (p.mouseIsPressed && mouseInCanvas) {
            // Verificar si ya hay un cuadrado formándose muy cerca del cursor actual
            let nearActive = squares.find(sq => sq.state !== 'INACTIVE' && p.dist(sq.centerX, sq.centerY, p.mouseX, p.mouseY) < squareSize * 0.6);

            if (!nearActive) {
                // Buscar el primer cuadrado inactivo/disponible
                let availableSq = squares.find(sq => sq.state === 'INACTIVE');
                if (availableSq) {
                    availableSq.state = 'FORMING';
                    availableSq.centerX = p.mouseX;
                    availableSq.centerY = p.mouseY;
                    availableSq.formedTime = 0;

                    // Asignar sus 4 líneas a 'ASSEMBLING'
                    for (let l of lines) {
                        if (l.group === availableSq.id) {
                            l.status = 'ASSEMBLING';
                        }
                    }
                }
            }
        }

        // Actualizar cuadrados y líneas
        updateSquaresAndLines(accentColor);
    }

    function updateSquaresAndLines(accentColor) {
        let now = p.millis();

        // 1. Actualizar estado de cuadrados
        for (let sq of squares) {
            if (sq.state === 'FORMING') {
                // Verificar si las 4 líneas del grupo ya llegaron a su posición objetivo
                let allAligned = true;
                for (let l of lines) {
                    if (l.group === sq.id) {
                        let targets = getSideTargets(sq, l.side);
                        let d1 = p.dist(l.x1, l.y1, targets.x1, targets.y1);
                        let d2 = p.dist(l.x2, l.y2, targets.x2, targets.y2);
                        if (d1 > 4 || d2 > 4) {
                            allAligned = false;
                            break;
                        }
                    }
                }

                if (allAligned) {
                    sq.state = 'FORMED';
                    sq.formedTime = now;
                    for (let l of lines) {
                        if (l.group === sq.id) {
                            l.status = 'LOCKED';
                        }
                    }
                }
            } else if (sq.state === 'FORMED') {
                // Si pasaron los 5 segundos (HOLD_DURATION), desarmar y dispersar
                if (now - sq.formedTime >= HOLD_DURATION) {
                    sq.state = 'INACTIVE';
                    for (let l of lines) {
                        if (l.group === sq.id) {
                            l.status = 'FREE';
                            // Impulso de dispersión radial
                            let angle = p.random(p.TWO_PI);
                            let speed = p.random(2.5, 4.5);
                            l.vx = p.cos(angle) * speed;
                            l.vy = p.sin(angle) * speed;
                            l.vRot = p.random(-0.06, 0.06);
                            l.x = (l.x1 + l.x2) / 2;
                            l.y = (l.y1 + l.y2) / 2;
                        }
                    }
                }
            }
        }

        // 2. Dibujar rellenos y efectos de cuadrados formados
        for (let sq of squares) {
            if (sq.state === 'FORMED' || sq.state === 'FORMING') {
                let s = sq.targetSize;
                let c = p.color(accentColor);
                
                // Relleno sutil con fade cuando está completamente formado
                if (sq.state === 'FORMED') {
                    let elapsed = now - sq.formedTime;
                    let remainingRatio = p.map(elapsed, 0, HOLD_DURATION, 1, 0, true);
                    c.setAlpha(25 * remainingRatio);
                    p.noStroke();
                    p.fill(c);
                    p.rectMode(p.CENTER);
                    p.rect(sq.centerX, sq.centerY, s, s);
                }
            }
        }

        // 3. Actualizar y dibujar cada una de las 12 líneas
        for (let l of lines) {
            let sq = squares[l.group];

            if (l.status === 'FREE') {
                // Movimiento orgánico libre y diverso
                l.x += l.vx;
                l.y += l.vy;
                l.angle += l.vRot;

                // Suave desaceleración hacia velocidad crucero
                l.vx = p.lerp(l.vx, p.cos(l.angle) * 0.8, 0.02);
                l.vy = p.lerp(l.vy, p.sin(l.angle) * 0.8, 0.02);

                // Rebote suave en los bordes
                let margin = 20;
                if (l.x < margin || l.x > p.width - margin) l.vx *= -1;
                if (l.y < margin || l.y > p.height - margin) l.vy *= -1;
                l.x = p.constrain(l.x, margin, p.width - margin);
                l.y = p.constrain(l.y, margin, p.height - margin);

                let half = l.len / 2;
                let targetX1 = l.x - p.cos(l.angle) * half;
                let targetY1 = l.y - p.sin(l.angle) * half;
                let targetX2 = l.x + p.cos(l.angle) * half;
                let targetY2 = l.y + p.sin(l.angle) * half;

                l.x1 = p.lerp(l.x1, targetX1, 0.25);
                l.y1 = p.lerp(l.y1, targetY1, 0.25);
                l.x2 = p.lerp(l.x2, targetX2, 0.25);
                l.y2 = p.lerp(l.y2, targetY2, 0.25);

                // Estilo línea libre: blanca semitransparente
                p.stroke(240, 243, 248, 160);
                p.strokeWeight(2.5);
                p.strokeCap(p.ROUND);
                p.line(l.x1, l.y1, l.x2, l.y2);
            } 
            else if (l.status === 'ASSEMBLING') {
                // Viajando hacia el lado correspondiente del cuadrado
                let targets = getSideTargets(sq, l.side);
                l.x1 = p.lerp(l.x1, targets.x1, 0.12);
                l.y1 = p.lerp(l.y1, targets.y1, 0.12);
                l.x2 = p.lerp(l.x2, targets.x2, 0.12);
                l.y2 = p.lerp(l.y2, targets.y2, 0.12);

                // Estilo en transición: color dinámico del Bloque 2
                let c = p.color(accentColor);
                c.setAlpha(200);
                p.stroke(c);
                p.strokeWeight(3);
                p.strokeCap(p.ROUND);
                p.line(l.x1, l.y1, l.x2, l.y2);
            } 
            else if (l.status === 'LOCKED') {
                // Formando parte del cuadrado colaborativo consolidado
                let targets = getSideTargets(sq, l.side);
                l.x1 = targets.x1;
                l.y1 = targets.y1;
                l.x2 = targets.x2;
                l.y2 = targets.y2;

                // Resplandor y color pleno del Bloque 2
                p.stroke(accentColor);
                p.strokeWeight(3.5);
                p.strokeCap(p.SQUARE);
                p.line(l.x1, l.y1, l.x2, l.y2);
            }
        }
    }

    function getSideTargets(sq, side) {
        let s = sq.targetSize;
        let half = s / 2;
        let cx = sq.centerX;
        let cy = sq.centerY;

        // 4 lados del cuadrado:
        // 0: Arriba (izq -> der)
        // 1: Derecha (arriba -> abajo)
        // 2: Abajo (der -> izq)
        // 3: Izquierda (abajo -> arriba)
        switch (side) {
            case 0: return { x1: cx - half, y1: cy - half, x2: cx + half, y2: cy - half };
            case 1: return { x1: cx + half, y1: cy - half, x2: cx + half, y2: cy + half };
            case 2: return { x1: cx + half, y1: cy + half, x2: cx - half, y2: cy + half };
            case 3: return { x1: cx - half, y1: cy + half, x2: cx - half, y2: cy - half };
        }
        return { x1: cx, y1: cy, x2: cx, y2: cy };
    }

    function handlePreviewMode(accentColor) {
        // En la miniatura: ciclo autónomo armónico donde 4 líneas forman un cuadrado en el centro y luego se dispersan
        let now = p.millis();

        if (squares[0].state === 'INACTIVE' && now - previewTimer > 2500) {
            // Iniciar formación en el centro
            squares[0].state = 'FORMING';
            squares[0].centerX = p.width / 2;
            squares[0].centerY = p.height / 2;
            for (let l of lines) {
                if (l.group === 0) l.status = 'ASSEMBLING';
            }
            previewTimer = now;
        }

        updateSquaresAndLines(accentColor);
    }

    p.windowResized = function() {
        resizeToContainer();
    };
};


// ==========================================================================
// TP2 - Concepto: Incertidumbre (como desconocimiento de lo diverso)
// p5.js instance mode para el contenedor #canvas-container-incertidumbre
// ==========================================================================

let sketchIncertidumbre = function(p) {
    let triangles = [];
    let baseSize = 50;
    let previewTimer = 0;
    let splitTimer = 0; // Temporizador para la reunión tras dividirse
    const REUNION_DELAY = 5000; // 5 segundos para reunirse en un único triángulo

    // Paleta de colores para mutaciones de incertidumbre
    const COLOR_PALETTE = [
        '#f0f3f8', // Blanco neutro
        '#c694d9', // Acento Subsistema 3 (Lila / Violeta claro)
        '#8660af', // Acento Subsistema 2 (Púrpura)
        '#ff4757', // Acento Subsistema 1 (Coral)
        '#2ed573', // Verde brillante
        '#70a1ff', // Azul eléctrico
        '#ffa502'  // Ámbar
    ];

    p.setup = function() {
        let container = document.getElementById('canvas-container-incertidumbre');
        let w = container.clientWidth || 300;
        let h = container.clientHeight || 200;

        let canvas = p.createCanvas(w, h);
        canvas.parent('canvas-container-incertidumbre');

        resetSimulation(w, h);

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                resizeToContainer();
            });
            ro.observe(container);
        }
    };

    function resetSimulation(w, h) {
        baseSize = p.min(w, h) * 0.24;
        triangles = [{
            x: w / 2,
            y: h / 2,
            targetX: w / 2,
            targetY: h / 2,
            size: baseSize,
            targetSize: baseSize,
            color: '#f0f3f8',
            angle: 0,
            targetAngle: 0,
            alpha: 255
        }];
        splitTimer = 0;
    }

    function resizeToContainer() {
        let container = document.getElementById('canvas-container-incertidumbre');
        if (!container) return;
        let w = container.clientWidth;
        let h = container.clientHeight;
        if (w === 0 || h === 0) return;

        p.resizeCanvas(w, h);
        baseSize = p.min(w, h) * 0.24;
        for (let tri of triangles) {
            tri.targetSize = baseSize;
            tri.targetX = p.constrain(tri.targetX, baseSize, w - baseSize);
            tri.targetY = p.constrain(tri.targetY, baseSize, h - baseSize);
        }
    }

    p.draw = function() {
        p.background('#12141a');

        let card = document.getElementById('card-incertidumbre');
        let isExpanded = card && card.classList.contains('expanded');

        if (isExpanded) {
            handleInteractiveMode();
        } else {
            handlePreviewMode();
        }

        handleReunionLogic();
        renderTriangles();
    };

    function handleInteractiveMode() {
        // En modo interactivo, el usuario intenta clickear el triángulo
        // Si hace clic, se gestiona en p.mousePressed
    }

    p.mousePressed = function() {
        let card = document.getElementById('card-incertidumbre');
        let isExpanded = card && card.classList.contains('expanded');
        if (!isExpanded) return;

        let mouseInCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
        if (!mouseInCanvas) return;

        // Comprobar si se intentó clickear algún triángulo activo
        let clickedIndices = [];
        for (let i = triangles.length - 1; i >= 0; i--) {
            let tri = triangles[i];
            let hitRadius = tri.size * 0.75;
            if (p.dist(p.mouseX, p.mouseY, tri.x, tri.y) <= hitRadius) {
                clickedIndices.push(i);
            }
        }

        if (clickedIndices.length > 0) {
            // Reaccionar al intento de clic en el/los triángulos impactados
            for (let idx of clickedIndices) {
                triggerIncertitudeReaction(triangles[idx], idx);
            }
        }
    };

    function triggerIncertitudeReaction(tri, index) {
        let margin = tri.targetSize;
        let newX = p.random(margin, p.width - margin);
        let newY = p.random(margin, p.height - margin);

        // 1. Salto de posición aleatorio en el espacio
        tri.targetX = newX;
        tri.targetY = newY;
        tri.targetAngle += p.random([-p.HALF_PI, p.HALF_PI, p.PI, -p.QUARTER_PI, p.QUARTER_PI, p.TWO_PI / 3]);

        // 2. Elegir aleatoriamente 1 de las 4 funciones:
        // 'COLOR' | 'SPLIT' | 'GROW' | 'SHRINK'
        let actions = ['COLOR', 'SPLIT', 'GROW', 'SHRINK'];
        let action = p.random(actions);

        switch (action) {
            case 'COLOR': {
                // Cambiar a un color aleatorio de la paleta
                let availableColors = COLOR_PALETTE.filter(c => c !== tri.color);
                tri.color = p.random(availableColors);
                break;
            }
            case 'SPLIT': {
                // Dividirse en triángulos más pequeños
                if (triangles.length < 6) {
                    tri.targetSize = p.max(tri.targetSize * 0.7, baseSize * 0.5);
                    // Crear triángulo hijo
                    let splitChild = {
                        x: tri.x,
                        y: tri.y,
                        targetX: p.random(margin, p.width - margin),
                        targetY: p.random(margin, p.height - margin),
                        size: tri.size,
                        targetSize: tri.targetSize,
                        color: p.random(COLOR_PALETTE),
                        angle: tri.angle,
                        targetAngle: tri.targetAngle + p.random(-p.PI, p.PI),
                        alpha: 255
                    };
                    triangles.push(splitChild);
                    splitTimer = p.millis(); // Iniciar cuenta regresiva de 5 segundos para la reunión
                } else {
                    // Si ya hay varios divididos, reiniciar temporizador
                    splitTimer = p.millis();
                }
                break;
            }
            case 'GROW': {
                // Aumentar su tamaño
                tri.targetSize = p.min(tri.targetSize * 1.45, baseSize * 2.2);
                break;
            }
            case 'SHRINK': {
                // Disminuir su tamaño
                tri.targetSize = p.max(tri.targetSize * 0.6, baseSize * 0.4);
                break;
            }
        }
    }

    function handleReunionLogic() {
        // Si hay más de 1 triángulo y pasaron los 5 segundos de la división, volver a unirse
        if (triangles.length > 1 && splitTimer > 0) {
            let elapsed = p.millis() - splitTimer;
            if (elapsed >= REUNION_DELAY) {
                // Atraer los triángulos hacia el triángulo principal (triangles[0])
                let rootTri = triangles[0];
                rootTri.targetSize = p.lerp(rootTri.targetSize, baseSize, 0.05);

                for (let i = triangles.length - 1; i >= 1; i--) {
                    let tri = triangles[i];
                    tri.targetX = rootTri.x;
                    tri.targetY = rootTri.y;
                    tri.targetSize = p.lerp(tri.targetSize, 0, 0.08);

                    let d = p.dist(tri.x, tri.y, rootTri.x, rootTri.y);
                    if (d < 8 || tri.size < 4) {
                        // Se fusiona con el principal
                        triangles.splice(i, 1);
                    }
                }

                if (triangles.length === 1) {
                    splitTimer = 0;
                    rootTri.targetSize = baseSize;
                }
            }
        }
    }

    function handlePreviewMode() {
        // En la miniatura de la grilla: mutación autónoma periódica cada 1.8 segundos
        let now = p.millis();
        if (now - previewTimer > 1800) {
            if (triangles.length === 0) resetSimulation(p.width, p.height);

            let randomTri = p.random(triangles);
            if (randomTri) {
                triggerIncertitudeReaction(randomTri, triangles.indexOf(randomTri));
            }
            previewTimer = now;
        }
    }

    function renderTriangles() {
        for (let tri of triangles) {
            // Interpolación suave y elástica para movimiento cinético
            tri.x = p.lerp(tri.x, tri.targetX, 0.18);
            tri.y = p.lerp(tri.y, tri.targetY, 0.18);
            tri.size = p.lerp(tri.size, tri.targetSize, 0.14);
            tri.angle = p.lerp(tri.angle, tri.targetAngle, 0.14);

            p.push();
            p.translate(tri.x, tri.y);
            p.rotate(tri.angle);

            let r = tri.size * 0.65;
            // Coordenadas del triángulo equilátero
            let x1 = 0;
            let y1 = -r;
            let x2 = r * 0.866025;
            let y2 = r * 0.5;
            let x3 = -r * 0.866025;
            let y3 = r * 0.5;

            // Resplandor exterior suave
            let glow = p.color(tri.color);
            glow.setAlpha(35);
            p.noStroke();
            p.fill(glow);
            let glowScale = 1.3;
            p.triangle(x1 * glowScale, y1 * glowScale, x2 * glowScale, y2 * glowScale, x3 * glowScale, y3 * glowScale);

            // Cuerpo del triángulo
            p.fill(tri.color);
            p.stroke('#ffffff');
            p.strokeWeight(1.5);
            p.strokeJoin(p.ROUND);
            p.triangle(x1, y1, x2, y2, x3, y3);

            p.pop();
        }
    }

    p.windowResized = function() {
        resizeToContainer();
    };
};


// ==========================================================================
// TP2 - Bloque 3: Concepto 8 - Ansiedad (como pre-ocupación sobre el futuro)
// p5.js instance mode para el contenedor #canvas-container-ansiedad
// ==========================================================================

let sketchAnsiedad = function(p) {
    let baseSize = 60;
    let phase = 0;
    
    // Velocidades de pulsación (rápida/ansiosa vs calmada/regulada)
    const FAST_SPEED = 0.18;
    const CALM_SPEED = 0.04;
    let currentSpeed = FAST_SPEED;
    
    // Ondas expansivas de pulso
    let pulseRings = [];

    p.setup = function() {
        let container = document.getElementById('canvas-container-ansiedad');
        let w = container.clientWidth || 300;
        let h = container.clientHeight || 200;

        let canvas = p.createCanvas(w, h);
        canvas.parent('canvas-container-ansiedad');

        resetSimulation(w, h);

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                resizeToContainer();
            });
            ro.observe(container);
        }
    };

    function resetSimulation(w, h) {
        baseSize = p.min(w, h) * 0.26;
        currentSpeed = FAST_SPEED;
        phase = 0;
        pulseRings = [];
    }

    function resizeToContainer() {
        let container = document.getElementById('canvas-container-ansiedad');
        if (!container) return;
        let w = container.clientWidth;
        let h = container.clientHeight;
        if (w === 0 || h === 0) return;

        p.resizeCanvas(w, h);
        baseSize = p.min(w, h) * 0.26;
    }

    function getAccentColor() {
        let style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--subsystem-3-accent').trim() || '#c694d9';
    }

    p.draw = function() {
        p.background('#12141a');

        let card = document.getElementById('card-ansiedad');
        let isExpanded = card && card.classList.contains('expanded');
        let accentColor = getAccentColor();

        let mouseInCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
        let isControlling = isExpanded && p.mouseIsPressed && mouseInCanvas;

        // Regulación de velocidad:
        // Si el usuario mantiene pulsado, desacelera al ritmo calmado.
        // Al soltar, la pulsación vuelve inevitablemente a la velocidad rápida.
        let targetSpeed = isControlling ? CALM_SPEED : FAST_SPEED;
        currentSpeed = p.lerp(currentSpeed, targetSpeed, isControlling ? 0.04 : 0.06);

        phase += currentSpeed;

        // Doble latido asimétrico (sensación de latido cardíaco / taquicardia)
        let rawPulse = p.sin(phase) + 0.35 * p.sin(phase * 2);
        let pulseScale = p.map(rawPulse, -1.35, 1.35, 0.82, 1.28);

        // Nivel de agitación / temblor (jitter)
        let agitation = p.map(currentSpeed, CALM_SPEED, FAST_SPEED, 0, 1, true);
        let jitterX = agitation > 0.2 ? p.random(-2.5 * agitation, 2.5 * agitation) : 0;
        let jitterY = agitation > 0.2 ? p.random(-2.5 * agitation, 2.5 * agitation) : 0;

        let cx = p.width / 2 + jitterX;
        let cy = p.height / 2 + jitterY;

        // Generar anillo de onda en cada pico de pulsación
        if (p.cos(phase) > 0.96 && pulseRings.length < 8) {
            pulseRings.push({
                scale: pulseScale * 0.9,
                alpha: p.map(agitation, 0, 1, 90, 200),
                speed: p.map(agitation, 0, 1, 0.015, 0.045)
            });
        }

        // 1. Dibujar ondas expansivas de eco/latido
        for (let i = pulseRings.length - 1; i >= 0; i--) {
            let ring = pulseRings[i];
            ring.scale += ring.speed;
            ring.alpha -= 3.2;

            if (ring.alpha <= 0) {
                pulseRings.splice(i, 1);
                continue;
            }

            p.push();
            p.translate(cx, cy);
            let ringCol = p.color(accentColor);
            ringCol.setAlpha(ring.alpha);
            p.noFill();
            p.stroke(ringCol);
            p.strokeWeight(p.map(agitation, 0, 1, 1.2, 2.2));
            drawEquilateralTriangle(baseSize * ring.scale);
            p.pop();
        }

        // 2. Resplandor central reactivo
        p.push();
        p.translate(cx, cy);
        let glowCol = p.color(accentColor);
        glowCol.setAlpha(p.map(agitation, 0, 1, 20, 55));
        p.noStroke();
        p.fill(glowCol);
        drawEquilateralTriangle(baseSize * pulseScale * 1.35);

        // 3. Triángulo Principal (Ansiedad / Latido)
        let triFill = p.color(accentColor);
        if (agitation < 0.3) {
            // Estado calmado: más suave y armónico
            triFill.setAlpha(220);
        } else {
            // Estado ansioso: color pleno con trazo vibrante
            triFill.setAlpha(255);
        }
        p.fill(triFill);
        p.stroke(240, 243, 248, 240);
        p.strokeWeight(p.map(agitation, 0, 1, 1.5, 3.0));
        p.strokeJoin(p.ROUND);
        drawEquilateralTriangle(baseSize * pulseScale);

        // Núcleo interno
        p.noStroke();
        p.fill(240, 243, 248, p.map(agitation, 0, 1, 120, 240));
        drawEquilateralTriangle(baseSize * pulseScale * 0.35);
        p.pop();
    };

    function drawEquilateralTriangle(size) {
        let r = size * 0.65;
        let x1 = 0;
        let y1 = -r;
        let x2 = r * 0.866025;
        let y2 = r * 0.5;
        let x3 = -r * 0.866025;
        let y3 = r * 0.5;
        p.triangle(x1, y1, x2, y2, x3, y3);
    }

    p.windowResized = function() {
        resizeToContainer();
    };
};


// ==========================================================================
// TP2 - Bloque 3: Concepto 9 - Expectativa (como anticipación)
// p5.js instance mode para el contenedor #canvas-container-expectativa
// ==========================================================================

let sketchExpectativa = function(p) {
    let origin = { x: 0, y: 0 };
    let projectile = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 30,
        angle: -Math.PI / 2,
        active: false,
        trail: []
    };

    let expectedAngle = -Math.PI / 2;
    let state = 'AIMING'; // 'AIMING', 'FLYING', 'RESETTING'
    let flightStartTime = 0;
    let previewTimer = 0;
    let previewAimAngle = -Math.PI / 2;

    p.setup = function() {
        let container = document.getElementById('canvas-container-expectativa');
        let w = container.clientWidth || 300;
        let h = container.clientHeight || 200;

        let canvas = p.createCanvas(w, h);
        canvas.parent('canvas-container-expectativa');

        resetSimulation(w, h);

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                resizeToContainer();
            });
            ro.observe(container);
        }
    };

    function resetSimulation(w, h) {
        origin.x = w / 2;
        origin.y = h * 0.75;
        projectile.size = p.min(w, h) * 0.16;
        projectile.x = origin.x;
        projectile.y = origin.y;
        projectile.vx = 0;
        projectile.vy = 0;
        projectile.angle = -Math.PI / 2;
        projectile.active = false;
        projectile.trail = [];
        state = 'AIMING';
    }

    function resizeToContainer() {
        let container = document.getElementById('canvas-container-expectativa');
        if (!container) return;
        let w = container.clientWidth;
        let h = container.clientHeight;
        if (w === 0 || h === 0) return;

        p.resizeCanvas(w, h);
        resetSimulation(w, h);
    }

    function getAccentColor() {
        let style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--subsystem-3-accent').trim() || '#c694d9';
    }

    p.draw = function() {
        p.background('#12141a');

        let card = document.getElementById('card-expectativa');
        let isExpanded = card && card.classList.contains('expanded');
        let accentColor = getAccentColor();

        if (isExpanded) {
            handleInteractiveMode(accentColor);
        } else {
            handlePreviewMode(accentColor);
        }

        renderScene(accentColor);
    };

    function handleInteractiveMode(accentColor) {
        let mouseInCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;

        if (state === 'AIMING') {
            if (mouseInCanvas) {
                // Calcular ángulo hacia el cursor (la expectativa deseada)
                let dx = p.mouseX - origin.x;
                let dy = p.mouseY - origin.y;
                if (p.dist(origin.x, origin.y, p.mouseX, p.mouseY) > 10) {
                    expectedAngle = p.atan2(dy, dx);
                }
            }
            projectile.angle = p.lerp(projectile.angle, expectedAngle + p.HALF_PI, 0.15);
            projectile.x = origin.x;
            projectile.y = origin.y;
        } 
        else if (state === 'FLYING') {
            updateFlight();
        } 
        else if (state === 'RESETTING') {
            updateResetting();
        }
    }

    p.mousePressed = function() {
        let card = document.getElementById('card-expectativa');
        let isExpanded = card && card.classList.contains('expanded');
        if (!isExpanded) return;

        let mouseInCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
        if (!mouseInCanvas) return;

        if (state === 'AIMING') {
            launchUnexpected();
        }
    };

    function launchUnexpected() {
        state = 'FLYING';
        flightStartTime = p.millis();
        projectile.trail = [];

        // Generar un ángulo totalmente divergente/aleatorio, rompiendo la expectativa
        // Desvío marcado de al menos 90 a 270 grados respecto de lo esperado
        let divergence = p.random([p.PI * 0.6, -p.PI * 0.6, p.PI * 0.85, -p.PI * 0.85, p.PI]);
        let randomActualAngle = expectedAngle + divergence + p.random(-0.3, 0.3);

        let launchSpeed = p.random(11, 16);
        projectile.vx = p.cos(randomActualAngle) * launchSpeed;
        projectile.vy = p.sin(randomActualAngle) * launchSpeed;
        projectile.angle = randomActualAngle + p.HALF_PI;
    }

    function updateFlight() {
        projectile.x += projectile.vx;
        projectile.y += projectile.vy;

        // Fricción suave
        projectile.vx *= 0.985;
        projectile.vy *= 0.985;
        projectile.angle = p.atan2(projectile.vy, projectile.vx) + p.HALF_PI;

        // Registrar estela
        if (p.frameCount % 2 === 0) {
            projectile.trail.push({ x: projectile.x, y: projectile.y, alpha: 200 });
            if (projectile.trail.length > 25) projectile.trail.shift();
        }

        // Rebotes en los bordes del canvas
        let margin = projectile.size * 0.6;
        if (projectile.x < margin) {
            projectile.x = margin;
            projectile.vx *= -0.85;
        } else if (projectile.x > p.width - margin) {
            projectile.x = p.width - margin;
            projectile.vx *= -0.85;
        }
        if (projectile.y < margin) {
            projectile.y = margin;
            projectile.vy *= -0.85;
        } else if (projectile.y > p.height - margin) {
            projectile.y = p.height - margin;
            projectile.vy *= -0.85;
        }

        // Tras 2 segundos o desaceleración, regresar al origen
        if (p.millis() - flightStartTime > 2200 || p.mag(projectile.vx, projectile.vy) < 0.5) {
            state = 'RESETTING';
        }
    }

    function updateResetting() {
        projectile.x = p.lerp(projectile.x, origin.x, 0.1);
        projectile.y = p.lerp(projectile.y, origin.y, 0.1);
        projectile.angle = p.lerp(projectile.angle, expectedAngle + p.HALF_PI, 0.1);

        for (let pt of projectile.trail) {
            pt.alpha -= 8;
        }

        if (p.dist(projectile.x, projectile.y, origin.x, origin.y) < 3) {
            projectile.x = origin.x;
            projectile.y = origin.y;
            projectile.trail = [];
            state = 'AIMING';
        }
    }

    function handlePreviewMode(accentColor) {
        // En la miniatura de la grilla: apuntado sinusoidal y disparo inesperado autónomo en bucle
        let now = p.millis();
        let time = now * 0.002;

        if (state === 'AIMING') {
            expectedAngle = -p.HALF_PI + p.sin(time) * 0.8;
            projectile.angle = expectedAngle + p.HALF_PI;

            if (now - previewTimer > 2400) {
                launchUnexpected();
                previewTimer = now;
            }
        } else if (state === 'FLYING') {
            updateFlight();
        } else if (state === 'RESETTING') {
            updateResetting();
        }
    }

    function renderScene(accentColor) {
        // 1. Dibujar la Guía de Anticipación / Expectativa (Línea punteada tipo videojuego)
        if (state === 'AIMING') {
            renderExpectationGuide(accentColor);
        }

        // 2. Dibujar Estela del proyectil
        for (let i = 0; i < projectile.trail.length; i++) {
            let pt = projectile.trail[i];
            let c = p.color(accentColor);
            c.setAlpha(pt.alpha * 0.6);
            p.noStroke();
            p.fill(c);
            let s = p.map(i, 0, projectile.trail.length, 3, projectile.size * 0.6);
            p.ellipse(pt.x, pt.y, s);
        }

        // 3. Dibujar Base de Lanzamiento
        p.noStroke();
        p.fill(240, 243, 248, 40);
        p.ellipse(origin.x, origin.y, projectile.size * 1.5, projectile.size * 0.5);

        // 4. Dibujar Triángulo Proyectil
        p.push();
        p.translate(projectile.x, projectile.y);
        p.rotate(projectile.angle);

        // Resplandor del proyectil
        let glow = p.color(accentColor);
        glow.setAlpha(40);
        p.noStroke();
        p.fill(glow);
        drawEquilateralTriangle(projectile.size * 1.35);

        // Cuerpo del triángulo
        p.fill(accentColor);
        p.stroke(240, 243, 248);
        p.strokeWeight(1.8);
        p.strokeJoin(p.ROUND);
        drawEquilateralTriangle(projectile.size);

        // Centro blanco
        p.noStroke();
        p.fill(240, 243, 248, 200);
        drawEquilateralTriangle(projectile.size * 0.4);

        p.pop();
    }

    function renderExpectationGuide(accentColor) {
        let totalDots = 14;
        let spacing = 18;
        let animOffset = (p.millis() * 0.03) % spacing;

        p.push();
        for (let i = 1; i <= totalDots; i++) {
            let d = i * spacing + animOffset;
            let dotX = origin.x + p.cos(expectedAngle) * d;
            let dotY = origin.y + p.sin(expectedAngle) * d;

            if (dotX < 0 || dotX > p.width || dotY < 0 || dotY > p.height) break;

            let alpha = p.map(i, 1, totalDots, 220, 25);
            let dotSize = p.map(i, 1, totalDots, 6, 2.5);

            // Resplandor del punto guía
            let cGlow = p.color(accentColor);
            cGlow.setAlpha(alpha * 0.4);
            p.noStroke();
            p.fill(cGlow);
            p.ellipse(dotX, dotY, dotSize * 2);

            // Punto guía
            p.fill(240, 243, 248, alpha);
            p.ellipse(dotX, dotY, dotSize);
        }
        p.pop();
    }

    function drawEquilateralTriangle(size) {
        let r = size * 0.65;
        let x1 = 0;
        let y1 = -r;
        let x2 = r * 0.866025;
        let y2 = r * 0.5;
        let x3 = -r * 0.866025;
        let y3 = r * 0.5;
        p.triangle(x1, y1, x2, y2, x3, y3);
    }

    p.windowResized = function() {
        resizeToContainer();
    };
};


// ==========================================================================
// TP2 - Bloque 2: Concepto 5 - Empatía (como comprensión del otro)
// p5.js instance mode para el contenedor #canvas-container-empatia
// ==========================================================================

let sketchEmpatia = function(p) {
    let squares = [];
    let connections = [];
    let draggingFrom = null;
    let baseSize = 45;
    let previewTimer = 0;
    let previewStep = 0;
    let allConnectedTime = 0;

    p.setup = function() {
        let container = document.getElementById('canvas-container-empatia');
        let w = container.clientWidth || 300;
        let h = container.clientHeight || 200;

        let canvas = p.createCanvas(w, h);
        canvas.parent('canvas-container-empatia');

        initSquares(w, h);

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                resizeToContainer();
            });
            ro.observe(container);
        }
    };

    function initSquares(w, h) {
        baseSize = p.min(w, h) * 0.16;
        squares = [];
        connections = [];
        draggingFrom = null;
        allConnectedTime = 0;

        // Cuadrado 0: La fuente empática inicial con color
        squares.push({
            id: 0,
            x: w * 0.5,
            y: h * 0.5,
            baseX: w * 0.5,
            baseY: h * 0.5,
            noiseOff: p.random(100),
            size: baseSize,
            hasColor: true,
            colorProgress: 1.0,
            glow: 0
        });

        // 4 cuadrados receptores alrededor (inicialmente sin color)
        let positions = [
            { x: w * 0.25, y: h * 0.3 },
            { x: w * 0.75, y: h * 0.3 },
            { x: w * 0.22, y: h * 0.75 },
            { x: w * 0.78, y: h * 0.75 }
        ];

        for (let i = 0; i < positions.length; i++) {
            squares.push({
                id: i + 1,
                x: positions[i].x,
                y: positions[i].y,
                baseX: positions[i].x,
                baseY: positions[i].y,
                noiseOff: p.random(100),
                size: baseSize,
                hasColor: false,
                colorProgress: 0.0,
                glow: 0
            });
        }
    }

    function resizeToContainer() {
        let container = document.getElementById('canvas-container-empatia');
        if (!container) return;
        let w = container.clientWidth;
        let h = container.clientHeight;
        if (w === 0 || h === 0) return;

        p.resizeCanvas(w, h);
        initSquares(w, h);
    }

    function getAccentColor() {
        let style = getComputedStyle(document.documentElement);
        return style.getPropertyValue('--subsystem-2-accent').trim() || '#8660af';
    }

    p.draw = function() {
        p.background('#12141a');

        let card = document.getElementById('card-empatia');
        let isExpanded = card && card.classList.contains('expanded');
        let accentColor = getAccentColor();

        if (isExpanded) {
            handleInteractiveMode(accentColor);
        } else {
            handlePreviewMode(accentColor);
        }

        updateAndRender(accentColor);
    };

    function handleInteractiveMode(accentColor) {
        // Si todos los cuadrados están coloreados, dar unos segundos de resonancia antes de un reseteo suave
        let allColored = squares.every(sq => sq.hasColor);
        if (allColored) {
            if (allConnectedTime === 0) allConnectedTime = p.millis();
            if (p.millis() - allConnectedTime > 6000) {
                // Reiniciar para permitir volver a conectar
                for (let i = 1; i < squares.length; i++) {
                    squares[i].hasColor = false;
                }
                connections = [];
                allConnectedTime = 0;
            }
        }
    }

    p.mousePressed = function() {
        let card = document.getElementById('card-empatia');
        let isExpanded = card && card.classList.contains('expanded');
        if (!isExpanded) return;

        let mouseInCanvas = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height;
        if (!mouseInCanvas) return;

        // Comprobar si el usuario presionó sobre un cuadrado que YA tiene color
        for (let sq of squares) {
            let hitRadius = sq.size * 0.75;
            if (p.dist(p.mouseX, p.mouseY, sq.x, sq.y) <= hitRadius) {
                if (sq.hasColor) {
                    draggingFrom = sq;
                }
                break;
            }
        }
    };

    p.mouseReleased = function() {
        let card = document.getElementById('card-empatia');
        let isExpanded = card && card.classList.contains('expanded');
        if (!isExpanded) return;

        if (draggingFrom) {
            // Comprobar si se soltó sobre otro cuadrado
            for (let sq of squares) {
                if (sq.id !== draggingFrom.id) {
                    let hitRadius = sq.size * 0.85;
                    if (p.dist(p.mouseX, p.mouseY, sq.x, sq.y) <= hitRadius) {
                        // Crear conexión si no existe ya
                        let exists = connections.some(c => 
                            (c.from === draggingFrom.id && c.to === sq.id) || 
                            (c.from === sq.id && c.to === draggingFrom.id)
                        );

                        if (!exists) {
                            connections.push({ from: draggingFrom.id, to: sq.id, flowOffset: 0 });
                            sq.hasColor = true;
                            sq.glow = 1.0;
                        }
                        break;
                    }
                }
            }
            draggingFrom = null;
        }
    };

    function handlePreviewMode(accentColor) {
        // En la miniatura de la grilla: ciclo autónomo de transmisión de empatía
        let now = p.millis();
        if (now - previewTimer > 1800) {
            previewTimer = now;
            previewStep++;

            if (previewStep <= 4) {
                let targetSq = squares[previewStep];
                if (targetSq) {
                    connections.push({ from: 0, to: targetSq.id, flowOffset: 0 });
                    targetSq.hasColor = true;
                    targetSq.glow = 1.0;
                }
            } else if (previewStep > 6) {
                // Reiniciar ciclo en miniatura
                for (let i = 1; i < squares.length; i++) {
                    squares[i].hasColor = false;
                }
                connections = [];
                previewStep = 0;
            }
        }
    }

    function updateAndRender(accentColor) {
        let time = p.millis() * 0.0015;

        // 1. Actualizar posiciones flotantes suaves de los cuadrados
        for (let sq of squares) {
            let floatX = p.sin(time + sq.noiseOff) * (baseSize * 0.15);
            let floatY = p.cos(time * 0.8 + sq.noiseOff) * (baseSize * 0.15);
            sq.x = sq.baseX + floatX;
            sq.y = sq.baseY + floatY;

            // Transición de color al llenarse
            if (sq.hasColor) {
                sq.colorProgress = p.lerp(sq.colorProgress, 1.0, 0.08);
            } else {
                sq.colorProgress = p.lerp(sq.colorProgress, 0.0, 0.08);
            }

            if (sq.glow > 0) sq.glow = p.lerp(sq.glow, 0, 0.05);
        }

        // 2. Dibujar Líneas de Conexión Activas (Transmisión empática)
        for (let conn of connections) {
            let sq1 = squares.find(s => s.id === conn.from);
            let sq2 = squares.find(s => s.id === conn.to);
            if (sq1 && sq2) {
                // Línea base luminosa
                p.strokeWeight(2.5);
                let lineCol = p.color(accentColor);
                lineCol.setAlpha(160);
                p.stroke(lineCol);
                p.line(sq1.x, sq1.y, sq2.x, sq2.y);

                // Partícula de luz viajando por la línea de empatía
                conn.flowOffset = (conn.flowOffset + 0.02) % 1.0;
                let px = p.lerp(sq1.x, sq2.x, conn.flowOffset);
                let py = p.lerp(sq1.y, sq2.y, conn.flowOffset);

                p.noStroke();
                p.fill(240, 243, 248, 220);
                p.ellipse(px, py, 6);
                let pGlow = p.color(accentColor);
                pGlow.setAlpha(80);
                p.fill(pGlow);
                p.ellipse(px, py, 14);
            }
        }

        // 3. Dibujar Línea Elástica de Arrastre
        if (draggingFrom) {
            p.strokeWeight(2.5);
            let dragCol = p.color(accentColor);
            dragCol.setAlpha(200);
            p.stroke(dragCol);
            p.line(draggingFrom.x, draggingFrom.y, p.mouseX, p.mouseY);

            // Puntero de conexión
            p.noStroke();
            p.fill(240, 243, 248, 220);
            p.ellipse(p.mouseX, p.mouseY, 8);
        }

        // 4. Dibujar los Cuadrados
        p.rectMode(p.CENTER);
        for (let sq of squares) {
            p.push();
            p.translate(sq.x, sq.y);

            // Resplandor exterior si tiene color o al recibirlo
            if (sq.colorProgress > 0.05) {
                let glowCol = p.color(accentColor);
                glowCol.setAlpha(p.map(sq.colorProgress, 0, 1, 0, 45) + sq.glow * 80);
                p.noStroke();
                p.fill(glowCol);
                p.rect(0, 0, sq.size * 1.35, sq.size * 1.35, 4);
            }

            // Fondo / Relleno del cuadrado
            if (sq.colorProgress > 0.01) {
                let fillCol = p.color(accentColor);
                fillCol.setAlpha(p.map(sq.colorProgress, 0, 1, 0, 240));
                p.fill(fillCol);
            } else {
                p.fill(18, 20, 26, 200); // Fondo oscuro vacío
            }

            // Borde del cuadrado
            let borderAlpha = p.map(sq.colorProgress, 0, 1, 100, 255);
            p.stroke(240, 243, 248, borderAlpha);
            p.strokeWeight(sq.hasColor ? 2.5 : 1.5);
            p.rect(0, 0, sq.size, sq.size, 3);

            // Núcleo empático central
            if (sq.colorProgress > 0.1) {
                p.noStroke();
                p.fill(240, 243, 248, p.map(sq.colorProgress, 0, 1, 0, 180));
                p.rect(0, 0, sq.size * 0.35, sq.size * 0.35, 2);
            }

            p.pop();
        }
    }

    p.windowResized = function() {
        resizeToContainer();
    };
};


// Instanciar sketches de p5.js al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    new p5(sketchMemoria);
    new p5(sketchHerencia);
    new p5(sketchCaducidad);
    new p5(sketchColaboracion);
    new p5(sketchIncertidumbre);
    new p5(sketchAnsiedad);
    new p5(sketchExpectativa);
    new p5(sketchEmpatia);
});
