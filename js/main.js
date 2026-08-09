/**
 * TP2 - Sistema de Signos (Multimedial 4)
 * Lógica de interacción para la grilla y expansión de casillas
 */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.concept-card');
    const overlay = document.getElementById('grid-overlay');

    // Función para abrir/expandir una tarjeta
    function expandCard(card) {
        if (card.classList.contains('expanded')) return;
        
        // Cerrar cualquier tarjeta previa si estuviera abierta
        const currentExpanded = document.querySelector('.concept-card.expanded');
        if (currentExpanded) {
            collapseCard(currentExpanded);
        }

        card.classList.add('expanded');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll al estar en modal
    }

    // Función para contraer/cerrar una tarjeta
    function collapseCard(card) {
        card.classList.remove('expanded');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll
    }

    // Event listeners para cada tarjeta
    cards.forEach(card => {
        const closeBtn = card.querySelector('.close-btn');

        // Click en la tarjeta para expandir
        card.addEventListener('click', (e) => {
            // Evitar que el clic en el botón de cerrar active nuevamente la expansión
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

    // Clic en el overlay oscuro para cerrar la vista expandida
    overlay.addEventListener('click', () => {
        const activeCard = document.querySelector('.concept-card.expanded');
        if (activeCard) {
            collapseCard(activeCard);
        }
    });

    // Soporte para cerrar presionando la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeCard = document.querySelector('.concept-card.expanded');
            if (activeCard) {
                collapseCard(activeCard);
            }
        }
    });
});
