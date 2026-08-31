document.addEventListener('DOMContentLoaded', () => {

    /* =============================================
       SERVICE BOARD — Auto-slide (finder 캐러셀과 동일한 clone + requestAnimationFrame 패턴)
       ============================================= */
    const qsTrack = document.getElementById('qsTrack');
    const qsPrev = document.getElementById('qsPrev');
    const qsNext = document.getElementById('qsNext');
    let qsSetWidth = 0, qsCardStep = 0, qsOffset = 0, qsDirection = 1, qsPaused = false, qsOriginalCount = 0;
    const qsSpeed = 0.4;

    function qsApply() {
        if (qsTrack) qsTrack.style.transform = `translateX(${-qsOffset}px)`;
    }

    function qsMeasure() {
        if (!qsTrack || qsOriginalCount === 0) { qsSetWidth = 0; return; }
        // 이전에 숨겨둔 clone은 위치값이 0으로 잡히므로, 측정 전에 항상 보이는 상태로 되돌려야 함
        qsTrack.querySelectorAll('[aria-hidden="true"]').forEach(clone => { clone.style.display = ''; });

        const naturalWidth = qsTrack.children[qsOriginalCount].offsetLeft - qsTrack.children[0].offsetLeft;
        const wrapWidth = qsTrack.parentElement.clientWidth;
        const needsLoop = naturalWidth > wrapWidth;

        qsTrack.querySelectorAll('[aria-hidden="true"]').forEach(clone => {
            clone.style.display = needsLoop ? '' : 'none';
        });
        qsPrev && (qsPrev.style.display = needsLoop ? '' : 'none');
        qsNext && (qsNext.style.display = needsLoop ? '' : 'none');

        if (!needsLoop) { qsSetWidth = 0; qsOffset = 0; qsApply(); return; }
        qsSetWidth = naturalWidth;
        qsCardStep = qsSetWidth / qsOriginalCount;
    }

    function qsSetupClones() {
        if (!qsTrack) return;
        qsOriginalCount = qsTrack.children.length;
        qsOffset = 0;
        qsApply();
        if (qsOriginalCount === 0) { qsSetWidth = 0; return; }
        Array.from(qsTrack.children).forEach(pill => {
            const clone = pill.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.setAttribute('tabindex', '-1');
            qsTrack.appendChild(clone);
        });
        requestAnimationFrame(qsMeasure);
    }
    qsSetupClones();

    function qsTick() {
        if (!qsPaused && qsSetWidth > 0) {
            qsOffset += qsSpeed * qsDirection;
            if (qsOffset >= qsSetWidth) qsOffset -= qsSetWidth;
            else if (qsOffset <= 0) qsOffset += qsSetWidth;
            qsApply();
        }
        requestAnimationFrame(qsTick);
    }
    requestAnimationFrame(qsTick);

    qsPrev?.addEventListener('click', () => {
        qsDirection = -1;
        qsOffset -= qsCardStep;
        if (qsOffset <= 0) qsOffset += qsSetWidth;
        qsApply();
    });
    qsNext?.addEventListener('click', () => {
        qsDirection = 1;
        qsOffset += qsCardStep;
        if (qsOffset >= qsSetWidth) qsOffset -= qsSetWidth;
        qsApply();
    });
    qsTrack?.addEventListener('mouseenter', () => { qsPaused = true; });
    qsTrack?.addEventListener('mouseleave', () => { qsPaused = false; });

    /* 모바일: 손 닿아있는 동안만 정지, 떼면 바로 재개 (타이머 없음) */
    let qsDragging = false, qsDragStartX = 0, qsDragStartOffset = 0;
    qsTrack?.addEventListener('touchstart', e => {
        qsDragging = true;
        qsPaused = true;
        qsDragStartX = e.touches[0].clientX;
        qsDragStartOffset = qsOffset;
    }, { passive: true });
    qsTrack?.addEventListener('touchmove', e => {
        if (!qsDragging || qsSetWidth <= 0) return;
        const dx = e.touches[0].clientX - qsDragStartX;
        let next = qsDragStartOffset - dx;
        next = ((next % qsSetWidth) + qsSetWidth) % qsSetWidth;
        qsOffset = next;
        qsApply();
    }, { passive: true });
    qsTrack?.addEventListener('touchend', () => { qsDragging = false; qsPaused = false; });
    qsTrack?.addEventListener('touchcancel', () => { qsDragging = false; qsPaused = false; });

    window.addEventListener('resize', qsMeasure);

    /* =============================================
       FINDER — Store Data + Region Filter + List Render
       (실제 지도 연동 시 각 항목의 lat/lng만 채우면 됨)
       ============================================= */
    /* boxful.kr 실제 지점 API(api.boxful.kr/api/v1/store/list, product/locker/{id}) 전수 조사 기준 —
       하노이 지점(해외) 1곳 제외 총 43개 지점 전부 반영. services는 products[].detail_type으로 검증:
       storage-pickup-box=배송형 공유창고, b2b-warehouse=쇼핑몰 공유창고, consignment-sale=위탁판매,
       additional-facilities=게임룸/보드게임룸/건프라 조립룸. district는 실제 주소에서 추출. */
    const finderStores = [
        { name: '역삼초교 공유창고', sub: '강남구 짐보관 | Gangnam Self storage', region: '서울', district: '강남구', price: 'SB 월 30,000원~', img: 'images/stores/store_magok.png', lat: 37.49382668642271, lng: 127.03371489468867, services: ['배송형 공유창고'] },
        { name: '방이동 공유창고', sub: '잠실 짐보관 | Bangi Self storage', region: '서울', district: '송파구', price: '큐브 월 60,000원~', img: 'images/stores/store_yeonhui.png', lat: 37.511257, lng: 127.121281, services: [] },
        { name: '공유창고 월촌역점', sub: '대구 짐보관 | 대구 무인창고', region: '경상도', district: '달서구', price: 'SB 월 30,000원~', img: 'images/stores/store_yongsan.png', lat: 35.822944, lng: 128.546322, services: [] },
        { name: '언주역 공유창고', sub: '논현 짐보관 | Nonhyeon Self storage', region: '서울', district: '강남구', price: '스몰 월 115,000원~', img: 'images/stores/store_apgujeong.png', lat: 37.50777, lng: 127.032399, services: [] },
        { name: '의왕 공유창고', sub: '안양구 짐보관 | Anyang Self storage', region: '경기', district: '의왕시', price: '스몰 월 89,000원~', img: 'images/stores/store_gwangju.png', lat: 37.3518385, lng: 126.9629215, services: [] },
        { name: '인천계양 공유창고', sub: 'Incheon Self storage | 인천 짐보관', region: '인천', district: '계양구', price: '스몰 월 89,000원~', img: 'images/stores/store_gyodae.png', lat: 37.530076, lng: 126.708996, services: [] },
        { name: '공유창고 봉천2호점', sub: '관안구 짐보관 | 당곡역 공유창고', region: '서울', district: '관악구', price: '스몰 월 118,800원~', img: 'images/stores/store_magok.png', lat: 37.490745, lng: 126.927022, services: [] },
        { name: '역삼동 2호 공유창고', sub: '역삼 짐보관 | Yeoksam Self storage', region: '서울', district: '강남구', price: '스몰 월 120,000원~', img: 'images/stores/store_yeonhui.png', lat: 37.493207, lng: 127.031649, services: [] },
        { name: '수원 영통구 공유창고', sub: 'Suwon Self storage | 경기도짐보관', region: '경기', district: '영통구', price: '스몰 월 79,000원~', img: 'images/stores/store_yongsan.png', lat: 37.260615, lng: 127.061435, services: [] },
        { name: '제주이도 공유창고', sub: '연삼로 짐보관 | Ido Self storage', region: '제주도', district: '제주시', price: '큐브 월 77,000원~', img: 'images/stores/store_apgujeong.png', lat: 33.494202, lng: 126.533253, services: [] },
        { name: '셀프 공유창고 경기광주점', sub: '판교 근처 창고 임대', region: '경기', district: '광주시', price: '스몰 월 77,000원~', img: 'images/stores/store_gwangju.png', lat: 37.407129, lng: 127.206989, services: ['배송형 공유창고'] },
        { name: '경기도성남 세대창고 구입문의', sub: '무인매장 시스템', region: '경기', district: '광주시', price: '이용료 문의', img: 'images/stores/store_gyodae.png', lat: 37.4348061, lng: 127.221748, services: [] },
        { name: '풍납동 짐보관', sub: '강동구 공유창고 | Pungnap Self storage', region: '서울', district: '송파구', price: '스몰 월 100,000원~', img: 'images/stores/store_magok.png', lat: 37.5282464, lng: 127.115442, services: [] },
        { name: '부천 공유창고', sub: '오정구 짐보관 | Bucheon Self storage', region: '경기', district: '부천시', price: '세이프박스 월 30,000원~', img: 'images/stores/store_yeonhui.png', lat: 37.5189947, lng: 126.775634, services: [] },
        { name: '연동 공유창고', sub: '제주연동 짐보관 | Jeju Self storage', region: '제주도', district: '제주시', price: '세이프박스 월 25,000원~', img: 'images/stores/store_yongsan.png', lat: 33.4825623, lng: 126.491208, services: [] },
        { name: '함덕해수욕장 공유창고', sub: '제주시 짐보관 | Jeju Self storage', region: '제주도', district: '제주시', price: '세이프박스 월 20,000원~', img: 'images/stores/store_apgujeong.png', lat: 33.5353524, lng: 126.683263, services: [] },
        { name: '아라동 짐보관', sub: '제주대학병원 공유창고 | Jeju Self storage', region: '제주도', district: '제주시', price: '세이프박스 월 25,000원~', img: 'images/stores/store_gwangju.png', lat: 33.4702245, lng: 126.548135, services: [] },
        { name: '광교 공유창고', sub: 'Gwangyo Suwon Self storage | 수원짐보관', region: '경기', district: '수지구', price: '세이프박스 월 25,000원~', img: 'images/stores/store_gyodae.png', lat: 37.300365, lng: 127.071526, services: [] },
        { name: '용인시청 공유창고', sub: '처인구 짐보관 | Yongin Self storage', region: '경기', district: '처인구', price: 'SB 월 30,000원~', img: 'images/stores/store_magok.png', lat: 37.2395508, lng: 127.1572442, services: ['쇼핑몰 공유창고', '위탁판매', '게임룸', '보드게임룸', '건프라 조립룸'] },
        { name: '원흥역 짐보관', sub: '고양시 공유창고 | Goyang Self storage', region: '경기', district: '덕양구', price: 'SB 월 30,000원~', img: 'images/stores/store_yeonhui.png', lat: 37.6483967087209, lng: 126.8732438732838, services: [] },
        { name: '기흥 공유창고', sub: '용인 짐보관 | Yongin Self storage', region: '경기', district: '기흥구', price: 'SB 월 30,000원~', img: 'images/stores/store_yongsan.png', lat: 37.25193606825369, lng: 127.12799948330593, services: [] },
        { name: '공유창고 창원점', sub: '창원 짐보관 | Changwon Self storage', region: '경상도', district: '성산구', price: 'SB 월 30,000원~', img: 'images/stores/store_apgujeong.png', lat: 35.2204589, lng: 128.679549, services: [] },
        { name: '셀프 공유창고 송파점', sub: 'Songpa Self storage', region: '서울', district: '송파구', price: 'SB 월 30,000원~', img: 'images/stores/store_gwangju.png', lat: 37.50196730941605, lng: 127.1109296746503, services: ['쇼핑몰 공유창고'] },
        { name: '셀프 공유창고 용산점', sub: '', region: '서울', district: '용산구', price: '0.5M 월 66,000원~', img: 'images/stores/store_gyodae.png', lat: 37.5397603, lng: 126.9625896, services: ['배송형 공유창고'] },
        { name: '짐보관 서대문구', sub: '연희동 공유창고 | Yoenhui Self Storage', region: '서울', district: '서대문구', price: 'SB 월 30,000원~', img: 'images/stores/store_magok.png', lat: 37.5683597, lng: 126.9313351, services: [] },
        { name: '압구정 현대아파트 공유창고', sub: 'Apgujeong Self storage | Sinsa Declutter Service', region: '서울', district: '강남구', price: 'SB 월 30,000원~', img: 'images/stores/store_yeonhui.png', lat: 37.5312143, lng: 127.0354395, services: [] },
        { name: '교대역 서초동 공유창고', sub: 'Seocho Self storage Gangam | トランクルーム', region: '서울', district: '서초구', price: 'SB 월 30,000원~', img: 'images/stores/store_yongsan.png', lat: 37.4975085, lng: 127.0131622, services: [] },
        { name: '광주 삼동역 공유창고', sub: '경기도 짐보관 | Sungnam Self storage', region: '경기', district: '광주시', price: '0.5M 월 60,000원~', img: 'images/stores/store_apgujeong.png', lat: 37.407129, lng: 127.206989, services: [] },
        { name: '역삼동 뱅뱅사거리 공유창고', sub: 'Dogok  Self storage | Yeoksam Declutter Service', region: '서울', district: '강남구', price: '0.5M 월 99,999원~', img: 'images/stores/store_gwangju.png', lat: 37.4914889, lng: 127.0339855, services: [] },
        { name: '송파 문정동 공유창고', sub: 'Munjeong  Self storage | Songpa Declutter Service', region: '서울', district: '송파구', price: 'SB 월 30,000원~', img: 'images/stores/store_gyodae.png', lat: 37.4840131, lng: 127.1222271, services: [] },
        { name: '마곡 강서구 박스풀 공유창고', sub: 'Magok Boxful Self storage | Gangseo Declutter Service', region: '서울', district: '강서구', price: '0.5M 월 66,000원~', img: 'images/stores/store_magok.png', lat: 37.562865, lng: 126.823619, services: [] },
        { name: '경북대학교 공유창고', sub: '대구 북구 짐보관 | Daegu Self Storage', region: '경상도', district: '북구', price: '0.5S 월 44,000원~', img: 'images/stores/store_yeonhui.png', lat: 35.886596, lng: 128.603519, services: ['배송형 공유창고', '게임룸'] },
        { name: '진주 공유창고', sub: '진주 짐보관 | Jinju Self Storage', region: '경상도', district: '진주시', price: 'SB 월 30,000원~', img: 'images/stores/store_yongsan.png', lat: 35.154375, lng: 128.117244, services: [] },
        { name: '용인테크노밸리 공유창고', sub: '용인 짐보관 | Yongin Self storage', region: '경기', district: '기흥구', price: 'SB 월 300,000원~', img: 'images/stores/store_apgujeong.png', lat: 37.291268, lng: 127.147953, services: [] },
        { name: '공유창고 제주동문시장점', sub: '제주도 이삿짐보관 | Jeju Self storage', region: '제주도', district: '제주시', price: 'SB 월 30,000원~', img: 'images/stores/store_gwangju.png', lat: 33.513515, lng: 126.527376, services: [] },
        { name: '공유창고 대구역점', sub: '대구 짐보관 | Daegu Self Storage', region: '경상도', district: '북구', price: 'SB 월 30,000원~', img: 'images/stores/store_gyodae.png', lat: 35.87532, lng: 128.59997, services: ['배송형 공유창고'] },
        { name: '공유창고 원주역점', sub: '원주역 짐보관 | Wonju Self Storage', region: '강원도', district: '원주시', price: '세이프박스 월 30,000원~', img: 'images/stores/store_magok.png', lat: 37.3197, lng: 127.9575, services: [] },
        { name: '공유창고 전주점', sub: '전주 짐보관 | Jeonju Self Storage', region: '전라도', district: '완산구', price: '세이프박스 월 30,000원~', img: 'images/stores/store_yeonhui.png', lat: 35.816671, lng: 127.126046, services: [] },
        { name: '공유창고 창원지방법원점', sub: '진주 짐보관 | Jinju Sinan Self Storage', region: '경상도', district: '진주시', price: 'SB 월 30,000원~', img: 'images/stores/store_yongsan.png', lat: 35.1916, lng: 128.0773, services: [] },
        { name: '공유창고 대구본동점', sub: '대구 짐보관 | Daegu Bondong Self Storage', region: '경상도', district: '달서구', price: 'SB 월 30,000원~', img: 'images/stores/store_apgujeong.png', lat: 35.8363689, lng: 128.5374137, services: [] },
        { name: '공유창고 김포한강점', sub: '김포 이삿짐보관 | Gimpo Hangang Self Storage', region: '경기', district: '김포시', price: '4M 월 330,000원~', img: 'images/stores/store_gwangju.png', lat: 37.65274636, lng: 126.619035348, services: [] },
        { name: '공유창고 여수점', sub: '여수 짐보관 | Yeosu Self Storage', region: '전라도', district: '여수시', price: 'SB 월 30,000원~', img: 'images/stores/store_gyodae.png', lat: 34.7735, lng: 127.6436, services: [] },
        { name: '공유창고 세종점', sub: '세종 짐보관 | Sejong Self Storage', region: '세종', district: '세종시', price: 'SB 월 30,000원~', img: 'images/stores/store_magok.png', lat: 36.5095, lng: 127.2625, services: [] },
    ];
    finderStores.forEach(s => s.services.unshift('셀프 공유창고'));

    const finderList = document.getElementById('finderList');
    const finderListFade = document.getElementById('finderListFade');
    const finderCarousel = document.getElementById('finderCarousel');
    const finderMapEl = document.getElementById('finderMap');

    finderList?.addEventListener('scroll', () => updateFinderListFade(), { passive: true });
    window.addEventListener('resize', () => updateFinderListFade());

    let finderRegion = 'all';
    let finderQuery = '';
    let finderServices = [];
    let leafletMap = null;
    let leafletMarkers = [];

    function renderFinderMap() {
        if (!finderMapEl || typeof L === 'undefined') return;
        if (!leafletMap) {
            leafletMap = L.map(finderMapEl).setView([36.4, 127.9], 7);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(leafletMap);
        }
        leafletMarkers.forEach(m => leafletMap.removeLayer(m));
        leafletMarkers = [];
        const stores = getFilteredStores();
        stores.forEach(store => {
            if (store.lat == null || store.lng == null) return;
            const marker = L.marker([store.lat, store.lng]).addTo(leafletMap);
            marker.bindPopup(`<b>${store.name}</b>${store.price}`);
            leafletMarkers.push(marker);
        });
        if (stores.length) {
            const bounds = L.latLngBounds(stores.filter(s => s.lat != null).map(s => [s.lat, s.lng]));
            leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
        }
    }

    function getFilteredStores() {
        let stores = finderRegion === 'all' ? finderStores : finderStores.filter(s => s.region === finderRegion);
        if (finderQuery) {
            const q = finderQuery.toLowerCase();
            stores = stores.filter(s =>
                s.name.toLowerCase().includes(q) ||
                (s.sub && s.sub.toLowerCase().includes(q)) ||
                s.region.toLowerCase().includes(q) ||
                (s.district && s.district.toLowerCase().includes(q))
            );
        }
        if (finderServices.length) {
            stores = stores.filter(s => finderServices.some(svc => (s.services || []).includes(svc)));
        }
        return stores;
    }

    function updateFinderListFade() {
        if (!finderList || !finderListFade) return;
        const hasMoreBelow = finderList.scrollHeight - finderList.scrollTop - finderList.clientHeight > 4;
        finderListFade.classList.toggle('visible', hasMoreBelow);
    }

    function renderFinderList() {
        if (!finderList) return;
        const stores = getFilteredStores();
        finderList.innerHTML = stores.length ? stores.map(store => `
            <div class="finder-list-item">
                <div class="finder-list-photo"><img src="${store.img}" alt="${store.name}" loading="lazy"></div>
                <div class="finder-list-info">
                    <h4>${store.name}${store.sub ? `<br>${store.sub}` : ''}</h4>
                    <p class="finder-list-price">${store.price}</p>
                </div>
            </div>
        `).join('') : `<p class="finder-empty">검색 결과가 없습니다</p>`;
        finderList.scrollTop = 0;
        updateFinderListFade();
    }

    function renderFinderCarousel() {
        if (!finderCarousel) return;
        finderCarousel.innerHTML = getFilteredStores().map(store => `
            <div class="finder-card">
                <div class="finder-card-photo"><img src="${store.img}" alt="${store.name}" loading="lazy"></div>
                <h4>${store.name}${store.sub ? `<br>${store.sub}` : ''}</h4>
                <p class="finder-card-price">${store.price}</p>
            </div>
        `).join('');
        fcSetupClones();
    }

    function renderFinder() {
        renderFinderList();
        renderFinderCarousel();
        renderFinderMap();
    }

    /* Auto-slide (부가서비스 캐러셀과 동일한 clone + requestAnimationFrame 패턴) */
    const finderPrev = document.getElementById('finderPrev');
    const finderNext = document.getElementById('finderNext');
    let fcSetWidth = 0, fcCardStep = 0, fcOffset = 0, fcDirection = 1, fcPaused = false, fcOriginalCount = 0, fcPauseUntil = 0;
    const fcSpeed = 0.5;

    function fcApply() {
        if (finderCarousel) finderCarousel.style.transform = `translateX(${-fcOffset}px)`;
    }

    function fcSetupClones() {
        if (!finderCarousel) return;
        fcOriginalCount = finderCarousel.children.length;
        fcOffset = 0;
        fcApply();
        if (fcOriginalCount === 0) { fcSetWidth = 0; return; }
        Array.from(finderCarousel.children).forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            clone.querySelectorAll('a').forEach(a => a.setAttribute('tabindex', '-1'));
            finderCarousel.appendChild(clone);
        });
        requestAnimationFrame(fcMeasure);
    }

    /* display:none인 동안은 offsetLeft가 0이라 목록보기로 전환될 때도 다시 재야 함 */
    function fcMeasure() {
        if (!finderCarousel || fcOriginalCount === 0) { fcSetWidth = 0; return; }
        // 이전에 숨겨둔 clone은 위치값이 0으로 잡히므로, 측정 전에 항상 보이는 상태로 되돌려야 함
        finderCarousel.querySelectorAll('[aria-hidden="true"]').forEach(clone => { clone.style.display = ''; });

        const naturalWidth = finderCarousel.children[fcOriginalCount].offsetLeft - finderCarousel.children[0].offsetLeft;
        const wrapWidth = finderCarousel.parentElement.clientWidth;

        // 카드들이 보이는 영역을 넘치지 않으면(=넘어갈 게 없으면) 복제본을 숨기고 정지
        const needsLoop = naturalWidth > wrapWidth;
        finderCarousel.querySelectorAll('[aria-hidden="true"]').forEach(clone => {
            clone.style.display = needsLoop ? '' : 'none';
        });
        finderPrev && (finderPrev.style.display = needsLoop ? '' : 'none');
        finderNext && (finderNext.style.display = needsLoop ? '' : 'none');

        if (!needsLoop) {
            fcSetWidth = 0;
            fcOffset = 0;
            fcApply();
            return;
        }
        fcSetWidth = naturalWidth;
        fcCardStep = fcSetWidth / fcOriginalCount;
    }

    function fcTick() {
        if (!fcPaused && fcSetWidth > 0 && Date.now() > fcPauseUntil) {
            fcOffset += fcSpeed * fcDirection;
            if (fcOffset >= fcSetWidth) fcOffset -= fcSetWidth;
            else if (fcOffset <= 0) fcOffset += fcSetWidth;
            fcApply();
        }
        requestAnimationFrame(fcTick);
    }
    requestAnimationFrame(fcTick);

    finderPrev?.addEventListener('click', () => {
        fcDirection = -1;
        fcOffset -= fcCardStep;
        if (fcOffset <= 0) fcOffset += fcSetWidth;
        fcApply();
    });
    finderNext?.addEventListener('click', () => {
        fcDirection = 1;
        fcOffset += fcCardStep;
        if (fcOffset >= fcSetWidth) fcOffset -= fcSetWidth;
        fcApply();
    });
    finderCarousel?.addEventListener('mouseenter', () => { fcPaused = true; });
    finderCarousel?.addEventListener('mouseleave', () => { fcPaused = false; });

    /* Touch swipe — pauses auto-slide while dragging */
    let fcDragging = false, fcDragStartX = 0, fcDragStartOffset = 0;
    finderCarousel?.addEventListener('touchstart', e => {
        fcDragging = true;
        fcDragStartX = e.touches[0].clientX;
        fcDragStartOffset = fcOffset;
        fcPauseUntil = Date.now() + 5000;
    }, { passive: true });
    finderCarousel?.addEventListener('touchmove', e => {
        if (!fcDragging || fcSetWidth <= 0) return;
        const dx = e.touches[0].clientX - fcDragStartX;
        let next = fcDragStartOffset - dx;
        next = ((next % fcSetWidth) + fcSetWidth) % fcSetWidth;
        fcOffset = next;
        fcApply();
    }, { passive: true });
    finderCarousel?.addEventListener('touchend', () => { fcDragging = false; });

    const finderFilters = document.querySelectorAll('.finder-filter');
    finderFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            finderFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            finderRegion = filter.dataset.region;
            renderFinder();
        });
    });

    /* 지역 필터 행 — 가로 스크롤 가능함을 알려주는 페이드 + 화살표 (모바일에서도 항상 노출) */
    const finderFilterRow = document.getElementById('finderFilterRow');
    const finderFilterFade = document.getElementById('finderFilterFade');
    const finderFilterPrev = document.getElementById('finderFilterPrev');
    const finderFilterNext = document.getElementById('finderFilterNext');

    function updateFinderFilterNav() {
        if (!finderFilterRow) return;
        const maxScroll = finderFilterRow.scrollWidth - finderFilterRow.clientWidth;
        const hasOverflow = maxScroll > 4;
        finderFilterPrev?.classList.toggle('visible', hasOverflow && finderFilterRow.scrollLeft > 4);
        const hasMoreRight = hasOverflow && finderFilterRow.scrollLeft < maxScroll - 4;
        finderFilterNext?.classList.toggle('visible', hasMoreRight);
        finderFilterFade?.classList.toggle('visible', hasMoreRight);
    }
    finderFilterRow?.addEventListener('scroll', updateFinderFilterNav, { passive: true });
    window.addEventListener('resize', updateFinderFilterNav);
    finderFilterPrev?.addEventListener('click', () => finderFilterRow.scrollBy({ left: -160, behavior: 'smooth' }));
    finderFilterNext?.addEventListener('click', () => finderFilterRow.scrollBy({ left: 160, behavior: 'smooth' }));
    requestAnimationFrame(updateFinderFilterNav);

    /* 서비스 종류 필터 (검색바 내 아이콘+문구 커스텀 드롭다운, 단일 선택) */
    const hssTrigger = document.getElementById('hssTrigger');
    const hssPanel = document.getElementById('hssPanel');
    const hssTriggerIcon = document.getElementById('hssTriggerIcon');
    const hssTriggerLabel = document.getElementById('hssTriggerLabel');
    const hssOptions = document.querySelectorAll('.hss-option');

    function closeHssPanel() {
        hssPanel?.setAttribute('hidden', '');
        hssTrigger?.setAttribute('aria-expanded', 'false');
        document.getElementById('heroSearchForm')?.classList.remove('hs-service-focus');
    }
    function openHssPanel() {
        hssPanel?.removeAttribute('hidden');
        hssTrigger?.setAttribute('aria-expanded', 'true');
        document.getElementById('heroSearchForm')?.classList.add('hs-service-focus');
    }

    hssTrigger?.addEventListener('click', () => {
        const isOpen = hssTrigger.getAttribute('aria-expanded') === 'true';
        isOpen ? closeHssPanel() : openHssPanel();
    });

    hssOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const value = opt.dataset.value;
            const iconSrc = opt.querySelector('.hss-option-icon img')?.getAttribute('src') || '';
            hssTriggerIcon.innerHTML = iconSrc ? `<img src="${iconSrc}" alt="" loading="lazy">` : '';
            hssTriggerLabel.textContent = opt.querySelector('span:last-child').textContent;
            hssOptions.forEach(o => {
                o.classList.toggle('active', o === opt);
                o.setAttribute('aria-selected', o === opt ? 'true' : 'false');
            });
            finderServices = value ? [value] : [];
            closeHssPanel();
            renderFinder();
        });
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('.hero-search-service')) closeHssPanel();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeHssPanel();
    });

    renderFinder();

    /* =============================================
       FINDER — List / Map View Toggle (버튼 하나가 교차로 전환)
       ============================================= */
    const finderViewToggle = document.getElementById('finderViewToggle');
    const finderViewList = document.getElementById('finderViewList');
    const finderViewMap = document.getElementById('finderViewMap');

    const fvIconList = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>';
    const fvIconMap = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>';

    let finderCurrentView = 'map';

    function applyFinderView() {
        const isMap = finderCurrentView === 'map';
        finderViewList?.classList.toggle('active', !isMap);
        finderViewMap?.classList.toggle('active', isMap);

        // 버튼은 지금 화면이 아니라 "눌렀을 때 전환될 화면"을 보여줌
        if (finderViewToggle) {
            const label = isMap ? '목록으로 보기' : '지도로 보기';
            finderViewToggle.innerHTML = (isMap ? fvIconList : fvIconMap) + `<span class="finder-view-label">${label}</span>`;
            finderViewToggle.setAttribute('aria-label', label);
        }
        if (!isMap) requestAnimationFrame(fcMeasure);
        if (isMap) requestAnimationFrame(() => leafletMap?.invalidateSize());
    }

    finderViewToggle?.addEventListener('click', () => {
        finderCurrentView = finderCurrentView === 'map' ? 'list' : 'map';
        applyFinderView();
    });

    applyFinderView();

    window.addEventListener('resize', () => {
        if (finderViewList?.classList.contains('active')) fcMeasure();
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
            // Only an ssOffset within [0, ssSetWidth] is guaranteed to have real
            // card content covering the whole viewport (the track only holds one
            // extra clone set). Picking a candidate whose raw target falls outside
            // that range would center it over blank space instead.
            let best = null;
            let bestOffset = 0;
            let bestDist = Infinity;
            candidates.forEach(el => {
                const elCenter = el.offsetLeft + el.offsetWidth / 2;
                const rawOffset = elCenter - viewportCenterLocal;
                if (rawOffset < 0 || rawOffset > ssSetWidth) return; // would show blank space
                const travel = Math.abs(rawOffset - ssOffset);
                if (travel < bestDist) {
                    bestDist = travel;
                    best = el;
                    bestOffset = rawOffset;
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
       FINDER — Search Bar
       ============================================= */
    const heroSearchForm = document.getElementById('heroSearchForm');
    const heroSearchInput = document.getElementById('heroSearchInput');

    /* 모바일: 지역 입력창에 포커스하면 서비스 트리거는 아이콘만 남기고 줄어들어 입력창에 공간을 더 줌 */
    heroSearchInput?.addEventListener('focus', () => heroSearchForm?.classList.add('hs-input-focus'));
    heroSearchInput?.addEventListener('blur', () => heroSearchForm?.classList.remove('hs-input-focus'));

    heroSearchForm?.addEventListener('submit', e => {
        e.preventDefault();
        finderQuery = heroSearchInput.value.trim();
        finderRegion = 'all';
        finderFilters.forEach(f => f.classList.toggle('active', f.dataset.region === 'all'));
        renderFinder();
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

                    visibleEl.style.setProperty('border-color', '#00C6B2', 'important');
                    visibleEl.style.setProperty('box-shadow', '0 8px 32px -8px rgba(0,0,0,0.1)', 'important');
                    visibleEl.style.setProperty('transform', 'translateY(-4px)', 'important');
                    setTimeout(() => {
                        visibleEl.style.removeProperty('border-color');
                        visibleEl.style.removeProperty('box-shadow');
                        visibleEl.style.removeProperty('transform');
                    }, 4000);
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }
            }
        });
    });

});
