/**
 * TP2 - Sistema de Signos (Multimedial 4)
 * Lógica limpia y pulida de expansión/contracción de casillas
 */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.concept-card');
    const overlay = document.getElementById('grid-overlay');

    function expandCard(card) {
        if (card.classList.contains('expanded')) return;

        // Si hay otra tarjeta expandida, la cerramos
        const currentExpanded = document.querySelector('.concept-card.expanded');
        if (currentExpanded) {
            collapseCard(currentExpanded);
        }

        card.classList.add('expanded');
        overlay.classList.add('active');
    }

    function collapseCard(card) {
        if (!card.classList.contains('expanded')) return;

        card.classList.remove('expanded');
        overlay.classList.remove('active');
    }

    // Event Listeners
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.close-btn')) {
                e.stopPropagation();
                collapseCard(card);
                return;
            }

            if (!card.classList.contains('expanded')) {
                expandCard(card);
            }
        });
    });

    overlay.addEventListener('click', () => {
        const activeCard = document.querySelector('.concept-card.expanded');
        if (activeCard) {
            collapseCard(activeCard);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeCard = document.querySelector('.concept-card.expanded');
            if (activeCard) {
                collapseCard(activeCard);
            }
        }
    });

    // Control de Pantalla Completa (Fullscreen API)
    const fsBtn = document.getElementById('fullscreen-btn');
    if (fsBtn) {
        fsBtn.addEventListener('click', () => {
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                const docEl = document.documentElement;
                if (docEl.requestFullscreen) {
                    docEl.requestFullscreen();
                } else if (docEl.webkitRequestFullscreen) { /* Safari / iOS */
                    docEl.webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        });
    }
});
