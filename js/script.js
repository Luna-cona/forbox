document.addEventListener('DOMContentLoaded', () => {

    /* =============================================
       FINDER — Region Filter + Carousel Nav
       ============================================= */
    const finderFilters = document.querySelectorAll('.finder-filter');
    finderFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            finderFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
        });
    });

    const finderCarousel = document.getElementById('finderCarousel');
    const finderPrev = document.getElementById('finderPrev');
    const finderNext = document.getElementById('finderNext');
    const finderScrollAmount = 260;

    finderPrev?.addEventListener('click', () => {
        finderCarousel?.scrollBy({ left: -finderScrollAmount, behavior: 'smooth' });
    });
    finderNext?.addEventListener('click', () => {
        finderCarousel?.scrollBy({ left: finderScrollAmount, behavior: 'smooth' });
    });

    /* =============================================
       AMENITY SERVICE CARDS — Auto Carousel
       ============================================= */
    const ssTrack = document.getElementById('ssTrack');
    const ssPrev = document.getElementById('ssPrev');
    const ssNext = document.getElementById('ssNext');
    let ssPauseUntil = 0;
    let ssJumpTo = null;

    if (ssTrack) {
        const originalCount = ssTrack.children.length;
        Array.from(ssTrack.children).forEach(card => {
            const clone = card.cloneNode(true);
            if (card.id) clone.dataset.cloneOf = card.id;
            clone.removeAttribute('id');
            clone.setAttribute('aria-hidden', 'true');
            clone.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
            ssTrack.appendChild(clone);
        });

        let ssSetWidth = 0;
        let ssCardStep = 0;
        let ssOffset = 0;
        const computeSsSetWidth = () => {
            ssSetWidth = ssTrack.children[originalCount].offsetLeft - ssTrack.children[0].offsetLeft;
            ssCardStep = ssSetWidth / originalCount;
        };
        computeSsSetWidth();
        window.addEventListener('resize', computeSsSetWidth);

        let ssDirection = 1;
        let ssPaused = false;
        const ssSpeed = 0.6;

        function ssApply() {
            ssTrack.style.transform = `translateX(${-ssOffset}px)`;
        }

        ssJumpTo = (id) => {
            const candidates = ssTrack.querySelectorAll(`#${id}, [data-clone-of="${id}"]`);
            const viewportWidth = ssTrack.parentElement.getBoundingClientRect().width;
            const viewportCenterLocal = viewportWidth / 2;

            // Pure layout math (offsetLeft is transform-independent), so this
            // is immune to any CSS transition currently in flight.
            let best = null;
            let bestOffset = 0;
            let bestDist = Infinity;
            candidates.forEach(el => {
                const elCenter = el.offsetLeft + el.offsetWidth / 2;
                // candidate new ssOffset so this element lands centered
                let candidateOffset = elCenter - viewportCenterLocal;
                candidateOffset = ((candidateOffset % ssSetWidth) + ssSetWidth) % ssSetWidth;
                // distance this candidate would have to travel from current ssOffset
                let travel = Math.abs(candidateOffset - ssOffset);
                travel = Math.min(travel, ssSetWidth - travel);
                if (travel < bestDist) {
                    bestDist = travel;
                    best = el;
                    bestOffset = candidateOffset;
                }
            });
            if (!best) return null;

            ssOffset = bestOffset;
            ssTrack.style.transition = 'none';
            ssTrack.offsetHeight; // force reflow so the transition below actually animates
            ssTrack.style.transition = 'transform 0.6s ease';
            ssApply();
            setTimeout(() => { ssTrack.style.transition = ''; }, 650);
            return best;
        };

        function ssTick() {
            if (!ssPaused && ssSetWidth > 0 && Date.now() > ssPauseUntil) {
                ssOffset += ssSpeed * ssDirection;
                if (ssOffset >= ssSetWidth) {
                    ssOffset -= ssSetWidth;
                } else if (ssOffset <= 0) {
                    ssOffset += ssSetWidth;
                }
                ssApply();
            }
            requestAnimationFrame(ssTick);
        }
        requestAnimationFrame(ssTick);

        ssPrev?.addEventListener('click', () => {
            ssDirection = -1;
            ssOffset -= ssCardStep;
            if (ssOffset <= 0) ssOffset += ssSetWidth;
            ssApply();
        });
        ssNext?.addEventListener('click', () => {
            ssDirection = 1;
            ssOffset += ssCardStep;
            if (ssOffset >= ssSetWidth) ssOffset -= ssSetWidth;
            ssApply();
        });
        ssTrack.addEventListener('mouseenter', () => { ssPaused = true; });
        ssTrack.addEventListener('mouseleave', () => { ssPaused = false; });

        /* Manual drag / swipe — takes priority over the auto-slide */
        let ssDragging = false;
        let ssDragStartX = 0;
        let ssDragStartY = 0;
        let ssDragStartOffset = 0;
        let ssDragIsHorizontal = null;

        const ssDragStart = (clientX, clientY) => {
            ssDragging = true;
            ssDragStartX = clientX;
            ssDragStartY = clientY;
            ssDragStartOffset = ssOffset;
            ssDragIsHorizontal = null;
            ssTrack.style.transition = 'none';
        };
        const ssDragMove = (clientX, clientY, e) => {
            if (!ssDragging) return;
            const dx = clientX - ssDragStartX;
            const dy = clientY - ssDragStartY;

            if (ssDragIsHorizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
                ssDragIsHorizontal = Math.abs(dx) > Math.abs(dy);
                if (ssDragIsHorizontal) ssPauseUntil = Date.now() + 5000;
            }
            if (!ssDragIsHorizontal) return; // let the page scroll vertically instead

            if (e && e.cancelable) e.preventDefault();
            let next = ssDragStartOffset - dx;
            next = ((next % ssSetWidth) + ssSetWidth) % ssSetWidth;
            ssOffset = next;
            ssApply();
        };
        const ssDragEnd = () => {
            if (!ssDragging) return;
            ssDragging = false;
            ssTrack.style.transition = '';
            if (ssDragIsHorizontal) ssPauseUntil = Date.now() + 5000;
        };

        ssTrack.addEventListener('touchstart', e => {
            ssDragStart(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        ssTrack.addEventListener('touchmove', e => {
            ssDragMove(e.touches[0].clientX, e.touches[0].clientY, e);
        }, { passive: false });
        ssTrack.addEventListener('touchend', ssDragEnd);

        ssTrack.addEventListener('mousedown', e => { ssDragStart(e.clientX, e.clientY); });
        window.addEventListener('mousemove', e => ssDragMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', ssDragEnd);
    }

    /* =============================================
       SCENARIOS — Persona Tabs
       ============================================= */
    const stabs = document.querySelectorAll('.stab');
    const spanels = document.querySelectorAll('.spanel');

    stabs.forEach(tab => {
        tab.addEventListener('click', () => {
            stabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const persona = tab.dataset.persona;
            spanels.forEach(panel => {
                panel.classList.toggle('active', panel.dataset.persona === persona);
            });
        });
    });

    /* =============================================
       HERO — Custom Service Selector
       ============================================= */
    const serviceSelect = document.getElementById('serviceSelect');
    const serviceSelectTrigger = document.getElementById('serviceSelectTrigger');
    const serviceSelectLabel = serviceSelectTrigger?.querySelector('span');
    const serviceSelectOptions = document.querySelectorAll('.custom-select-option');
    const serviceGoBtn = document.getElementById('serviceGoBtn');
    let selectedValue = '';

    serviceSelectTrigger?.addEventListener('click', e => {
        e.stopPropagation();
        serviceSelect.classList.toggle('open');
    });

    serviceSelectOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectedValue = option.dataset.value;
            serviceSelectLabel.textContent = option.textContent;
            serviceSelectOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            serviceSelect.classList.remove('open');
        });
    });

    document.addEventListener('click', e => {
        if (serviceSelect && !serviceSelect.contains(e.target)) {
            serviceSelect.classList.remove('open');
        }
    });

    serviceGoBtn?.addEventListener('click', () => {
        if (!selectedValue) return;
        const target = document.querySelector(selectedValue);
        target?.scrollIntoView({ behavior: 'smooth' });
    });

    /* =============================================
       SMOOTH SCROLL for anchor links
       ============================================= */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                if (ssTrack && ssTrack.contains(target)) {
                    ssPauseUntil = Date.now() + 4000;
                    const visibleEl = ssJumpTo?.(targetId.slice(1)) || target;

                    const pageTargetTop = visibleEl.getBoundingClientRect().top + window.scrollY;
                    window.scrollTo({
                        top: pageTargetTop - (window.innerHeight / 2) + (visibleEl.offsetHeight / 2),
                        behavior: 'smooth'
                    });

                    visibleEl.style.setProperty('border', '3px solid #00C6B2', 'important');
                    visibleEl.style.setProperty('box-shadow', '0 0 0 5px rgba(0,198,178,0.35)', 'important');
                    setTimeout(() => {
                        visibleEl.style.removeProperty('border');
                        visibleEl.style.removeProperty('box-shadow');
                    }, 4000);
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            }
        });
    });

});
