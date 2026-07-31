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

    if (ssTrack) {
        const originalCount = ssTrack.children.length;
        Array.from(ssTrack.children).forEach(card => {
            const clone = card.cloneNode(true);
            clone.removeAttribute('id');
            clone.setAttribute('aria-hidden', 'true');
            clone.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
            ssTrack.appendChild(clone);
        });

        let ssSetWidth = 0;
        let ssCardStep = 0;
        const computeSsSetWidth = () => {
            ssSetWidth = ssTrack.children[originalCount].offsetLeft - ssTrack.children[0].offsetLeft;
            ssCardStep = ssSetWidth / originalCount;
        };
        computeSsSetWidth();
        window.addEventListener('resize', computeSsSetWidth);

        let ssDirection = 1;
        let ssPaused = false;
        const ssSpeed = 0.6;

        function ssTick() {
            if (!ssPaused && ssSetWidth > 0 && Date.now() > ssPauseUntil) {
                ssTrack.scrollLeft += ssSpeed * ssDirection;
                if (ssTrack.scrollLeft >= ssSetWidth) {
                    ssTrack.scrollLeft -= ssSetWidth;
                } else if (ssTrack.scrollLeft <= 0) {
                    ssTrack.scrollLeft += ssSetWidth;
                }
            }
            requestAnimationFrame(ssTick);
        }
        requestAnimationFrame(ssTick);

        ssPrev?.addEventListener('click', () => {
            ssDirection = -1;
            ssTrack.scrollLeft -= ssCardStep;
        });
        ssNext?.addEventListener('click', () => {
            ssDirection = 1;
            ssTrack.scrollLeft += ssCardStep;
        });
        ssTrack.addEventListener('mouseenter', () => { ssPaused = true; });
        ssTrack.addEventListener('mouseleave', () => { ssPaused = false; });
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

                    const trackRect = ssTrack.getBoundingClientRect();
                    const targetRect = target.getBoundingClientRect();
                    const currentCenter = targetRect.left + targetRect.width / 2;
                    const trackCenter = trackRect.left + trackRect.width / 2;
                    ssTrack.scrollLeft += (currentCenter - trackCenter);

                    const pageTargetTop = target.getBoundingClientRect().top + window.scrollY;
                    window.scrollTo({
                        top: pageTargetTop - (window.innerHeight / 2) + (target.offsetHeight / 2),
                        behavior: 'smooth'
                    });

                    target.classList.add('ss-highlight');
                    setTimeout(() => target.classList.remove('ss-highlight'), 1800);
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            }
        });
    });

});
