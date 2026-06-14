/**
 * 自行车稳定性动力学分析 — 科研展示网页
 * Main Script: Animations, Interactivity & Physics Visualizations
 */

(function () {
    'use strict';

    // ============================================
    // Utility: Wait for DOM & external resources
    // ============================================
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initKaTeX();
        initProgressBar();
        initScrollReveal();
        initNavDots();
        initHeroCanvas();
        initWheelDiagram();
        initSpokeAnalysis();
        initStabilityCanvas();
        initHeroAnimations();
        initFormulaModules();
        initPresentationMode();
    }

    // ============================================
    // KaTeX Auto-Render
    // ============================================
    function initKaTeX() {
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false,
                strict: false
            });
        }
    }

    // ============================================
    // Progress Bar
    // ============================================
    function initProgressBar() {
        const bar = document.getElementById('progressBar');
        if (!bar) return;

        function update() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            bar.style.width = progress + '%';
        }

        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    // ============================================
    // Scroll Reveal (IntersectionObserver)
    // ============================================
    function initScrollReveal() {
        const elements = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        elements.forEach(el => observer.observe(el));
    }

    // ============================================
    // Navigation Dots
    // ============================================
    function initNavDots() {
        const dots = document.querySelectorAll('.nav-dot');
        const sections = [];

        dots.forEach(dot => {
            const sectionId = dot.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) sections.push({ dot, section });

            dot.addEventListener('click', () => {
                const target = document.getElementById(sectionId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Update active dot on scroll
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        dots.forEach(d => d.classList.remove('active'));
                        const match = sections.find(s => s.section === entry.target);
                        if (match) match.dot.classList.add('active');
                    }
                });
            },
            { threshold: 0.3 }
        );

        sections.forEach(s => observer.observe(s.section));
    }

    // ============================================
    // Hero Canvas — Wireframe Rotating Wheel
    // ============================================
    function initHeroCanvas() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let w, h, dpr;
        let angle = 0;
        let animId;

        function resize() {
            dpr = window.devicePixelRatio || 1;
            w = canvas.parentElement.clientWidth;
            h = canvas.parentElement.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function drawWheel(cx, cy, radius, spokeCount, rotation) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation);

            // Outer rim
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.12)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Inner rim
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.92, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Hub
            ctx.beginPath();
            ctx.arc(0, 0, radius * 0.08, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Spokes
            for (let i = 0; i < spokeCount; i++) {
                const theta = (i / spokeCount) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(theta) * radius * 0.08, Math.sin(theta) * radius * 0.08);
                ctx.lineTo(Math.cos(theta) * radius * 0.92, Math.sin(theta) * radius * 0.92);
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.06)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }

            // Center dot
            ctx.beginPath();
            ctx.arc(0, 0, 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
            ctx.fill();

            ctx.restore();
        }

        // Draw a simplified bicycle wireframe
        function drawBicycle(cx, cy, scale, rotation) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(scale, scale);

            const wheelR = 60;
            const wheelDist = 140;
            const rearX = -wheelDist / 2;
            const frontX = wheelDist / 2;

            // Draw rear wheel
            ctx.save();
            ctx.translate(rearX, 0);
            ctx.rotate(rotation);
            drawWheelLocal(wheelR);
            ctx.restore();

            // Draw front wheel
            ctx.save();
            ctx.translate(frontX, 0);
            ctx.rotate(rotation);
            drawWheelLocal(wheelR);
            ctx.restore();

            // Frame
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.15)';
            ctx.lineWidth = 1.2;

            // Seat tube
            ctx.beginPath();
            ctx.moveTo(rearX + 20, -10);
            ctx.lineTo(rearX + 40, -50);
            ctx.stroke();

            // Top tube
            ctx.beginPath();
            ctx.moveTo(rearX + 40, -50);
            ctx.lineTo(frontX - 30, -45);
            ctx.stroke();

            // Down tube
            ctx.beginPath();
            ctx.moveTo(rearX + 20, -10);
            ctx.lineTo(frontX - 20, 10);
            ctx.stroke();

            // Head tube
            ctx.beginPath();
            ctx.moveTo(frontX - 30, -45);
            ctx.lineTo(frontX - 20, 10);
            ctx.stroke();

            // Chain stay
            ctx.beginPath();
            ctx.moveTo(rearX, 0);
            ctx.lineTo(rearX + 20, -10);
            ctx.stroke();

            // Seat stay
            ctx.beginPath();
            ctx.moveTo(rearX, 0);
            ctx.lineTo(rearX + 40, -50);
            ctx.stroke();

            // Fork
            ctx.beginPath();
            ctx.moveTo(frontX - 20, 10);
            ctx.lineTo(frontX, 0);
            ctx.stroke();

            // Handlebar
            ctx.beginPath();
            ctx.moveTo(frontX - 35, -50);
            ctx.lineTo(frontX - 25, -40);
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        function drawWheelLocal(r) {
            // Simplified wheel for bicycle wireframe
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();

            for (let i = 0; i < 12; i++) {
                const theta = (i / 12) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(theta) * r * 0.9, Math.sin(theta) * r * 0.9);
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.04)';
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }
        }

        // Floating particles — reduced for projection clarity
        const particles = [];
        function initParticles() {
            particles.length = 0;
            for (let i = 0; i < 20; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.2,
                    vy: (Math.random() - 0.5) * 0.2,
                    r: Math.random() * 1.2 + 0.4,
                    alpha: Math.random() * 0.15 + 0.03
                });
            }
        }

        function drawParticles() {
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
                ctx.fill();
            });

            // Connect nearby particles — subtle for projection
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 212, 255, ${0.02 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);
            angle += 0.008;

            drawParticles();

            // Large decorative wheel (background)
            drawWheel(w * 0.75, h * 0.5, Math.min(w, h) * 0.35, 24, angle * 0.5);

            // Bicycle wireframe
            drawBicycle(w * 0.5, h * 0.52, Math.min(w, h) / 500, angle);

            // Small decorative wheel
            drawWheel(w * 0.2, h * 0.3, Math.min(w, h) * 0.12, 16, -angle * 0.8);

            animId = requestAnimationFrame(animate);
        }

        resize();
        initParticles();
        animate();

        window.addEventListener('resize', () => {
            resize();
            initParticles();
        });
    }

    // ============================================
    // Hero Entrance Animations (GSAP)
    // ============================================
    function initHeroAnimations() {
        if (typeof gsap === 'undefined') return;

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.to('.hero__eyebrow', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
          .to('.hero__title', { opacity: 1, y: 0, duration: 1 }, '-=0.5')
          .to('.hero__subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
          .to('.hero__en-subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
          .to('.hero__cta', { opacity: 1, y: 0, duration: 0.8 }, '-=0.5')
          .to('#scrollHint', { opacity: 0.6, duration: 1 }, '-=0.3');

        // Parallax on scroll
        gsap.registerPlugin(ScrollTrigger);

        gsap.to('.hero__content', {
            scrollTrigger: {
                trigger: '.hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            },
            y: -80,
            opacity: 0
        });

        // Fade scroll hint on scroll
        gsap.to('#scrollHint', {
            scrollTrigger: {
                trigger: '.hero',
                start: '10% top',
                end: '30% top',
                scrub: true
            },
            opacity: 0
        });
    }

    // ============================================
    // Wheel Diagram (SVG Interactive)
    // ============================================
    function initWheelDiagram() {
        const svg = document.getElementById('wheelSVG');
        const spokesGroup = document.getElementById('svgSpokes');
        const labelsGroup = document.getElementById('svgLabels');
        if (!svg || !spokesGroup) return;

        const spokeCount = 32;
        const cx = 200, cy = 200, innerR = 22, outerR = 158;

        // Generate spokes
        for (let i = 0; i < spokeCount; i++) {
            const theta = (i / spokeCount) * Math.PI * 2;
            const x1 = cx + Math.cos(theta) * innerR;
            const y1 = cy + Math.sin(theta) * innerR;
            const x2 = cx + Math.cos(theta) * outerR;
            const y2 = cy + Math.sin(theta) * outerR;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', 'rgba(0, 212, 255, 0.12)');
            line.setAttribute('stroke-width', '0.8');
            spokesGroup.appendChild(line);
        }

        // Show labels on hover
        const diagram = document.getElementById('wheelDiagram');
        if (diagram && labelsGroup) {
            diagram.addEventListener('mouseenter', () => {
                labelsGroup.style.transition = 'opacity 0.5s';
                labelsGroup.style.opacity = '1';
            });
            diagram.addEventListener('mouseleave', () => {
                labelsGroup.style.opacity = '0';
            });
        }

        // Info card hover highlights
        const cards = document.querySelectorAll('.model__info-card');
        const rim = document.getElementById('svgRim');
        const tire = document.getElementById('svgTire');
        const hub = document.getElementById('svgHub');

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const part = card.getAttribute('data-part');
                cards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                if (part === 'rim' && rim) {
                    rim.setAttribute('stroke', 'rgba(0, 212, 255, 0.4)');
                    tire.setAttribute('stroke', 'rgba(0, 212, 255, 0.3)');
                } else if (part === 'spoke') {
                    spokesGroup.querySelectorAll('line').forEach(l => {
                        l.setAttribute('stroke', 'rgba(79, 140, 255, 0.35)');
                    });
                } else if (part === 'hub' && hub) {
                    hub.setAttribute('stroke', 'rgba(167, 139, 250, 0.5)');
                    hub.setAttribute('fill', 'rgba(167, 139, 250, 0.1)');
                }
            });

            card.addEventListener('mouseleave', () => {
                rim.setAttribute('stroke', 'rgba(255,255,255,0.1)');
                tire.setAttribute('stroke', 'rgba(0,212,255,0.15)');
                hub.setAttribute('stroke', 'rgba(255,255,255,0.2)');
                hub.setAttribute('fill', 'rgba(255,255,255,0.05)');
                spokesGroup.querySelectorAll('line').forEach(l => {
                    l.setAttribute('stroke', 'rgba(0, 212, 255, 0.12)');
                });
                card.classList.remove('active');
            });
        });
    }

    // ============================================
    // Spoke Analysis (Slider + Charts)
    // ============================================
    function initSpokeAnalysis() {
        const slider = document.getElementById('spokeSlider');
        const countDisplay = document.getElementById('spokeCountDisplay');
        const metricI = document.getElementById('metricI');
        const metricAlpha = document.getElementById('metricAlpha');
        const metricL = document.getElementById('metricL');

        if (!slider) return;

        // Physics model parameters
        const R = 0.33;           // Wheel radius (m)
        const m_rim = 0.8;        // Rim mass (kg)
        const m_hub = 0.15;       // Hub mass (kg)
        const m_spoke_each = 0.008; // Mass per spoke (kg)
        const m_tire = 0.35;      // Tire mass (kg)
        const r_hub = 0.03;       // Hub radius (m)
        const omega = 15;         // Angular velocity (rad/s) ~15 rad/s
        const tau_applied = 1.0;  // Applied torque (N·m)

        function calcPhysics(n) {
            const m_spokes = n * m_spoke_each;
            const I_rim = m_rim * R * R;
            const I_tire = m_tire * R * R;
            const I_hub = 0.5 * m_hub * r_hub * r_hub;
            const I_spokes = n * (1 / 3) * m_spoke_each * (R * R); // simplified
            const I_total = I_rim + I_tire + I_hub + I_spokes;
            const alpha = tau_applied / I_total;
            const L = I_total * omega;
            return { I: I_total, alpha, L };
        }

        // Pre-compute data for charts
        const labels = [];
        const dataI = [];
        const dataAlpha = [];
        const dataL = [];

        for (let n = 16; n <= 64; n++) {
            labels.push(n);
            const p = calcPhysics(n);
            dataI.push(p.I);
            dataAlpha.push(p.alpha);
            dataL.push(p.L);
        }

        // Chart.js configuration — projection-optimized font sizes
        const chartDefaults = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(11,16,32,0.95)',
                    borderColor: 'rgba(0,212,255,0.4)',
                    borderWidth: 1,
                    titleFont: { family: 'JetBrains Mono', size: 14 },
                    bodyFont: { family: 'JetBrains Mono', size: 14 },
                    padding: 14,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'JetBrains Mono', size: 13 } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                    ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'JetBrains Mono', size: 13 } }
                }
            }
        };

        // Vertical line plugin (for slider indicator)
        const verticalLinePlugin = {
            id: 'verticalLine',
            afterDraw(chart) {
                const activeIndex = chart._activeSpokeIndex;
                if (activeIndex == null) return;
                const meta = chart.getDatasetMeta(0);
                if (!meta.data[activeIndex]) return;
                const point = meta.data[activeIndex];
                const ctx = chart.ctx;
                const yScale = chart.scales.y;

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(point.x, yScale.top);
                ctx.lineTo(point.x, yScale.bottom);
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#00d4ff';
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.stroke();

                ctx.restore();
            }
        };

        // Create charts
        const ctxI = document.getElementById('chartI');
        const ctxAlpha = document.getElementById('chartAlpha');
        const ctxL = document.getElementById('chartL');

        const chartI = ctxI ? new Chart(ctxI, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: dataI,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: { ...chartDefaults },
            plugins: [verticalLinePlugin]
        }) : null;

        const chartAlpha = ctxAlpha ? new Chart(ctxAlpha, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: dataAlpha,
                    borderColor: '#4f8cff',
                    backgroundColor: 'rgba(79, 140, 255, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: { ...chartDefaults },
            plugins: [verticalLinePlugin]
        }) : null;

        const chartLInstance = ctxL ? new Chart(ctxL, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: dataL,
                    borderColor: '#a78bfa',
                    backgroundColor: 'rgba(167, 139, 250, 0.05)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }]
            },
            options: { ...chartDefaults },
            plugins: [verticalLinePlugin]
        }) : null;

        function updateDisplay(n) {
            const physics = calcPhysics(n);

            // Update text metrics
            if (countDisplay) countDisplay.textContent = n;
            if (metricI) metricI.textContent = physics.I.toFixed(3);
            if (metricAlpha) metricAlpha.textContent = physics.alpha.toFixed(2);
            if (metricL) metricL.textContent = physics.L.toFixed(2);

            // Update chart indicators
            const idx = n - 16;
            [chartI, chartAlpha, chartLInstance].forEach(chart => {
                if (chart) {
                    chart._activeSpokeIndex = idx;
                    chart.update('none');
                }
            });

            // Update spoke wheel visualization
            drawSpokeWheel(n);
        }

        // Spoke wheel SVG
        function drawSpokeWheel(n) {
            const svgSpokes = document.getElementById('spokeWheelSpokes');
            if (!svgSpokes) return;

            // Clear existing
            svgSpokes.innerHTML = '';

            const cx = 110, cy = 110, innerR = 16, outerR = 90;

            for (let i = 0; i < n; i++) {
                const theta = (i / n) * Math.PI * 2;
                const x1 = cx + Math.cos(theta) * innerR;
                const y1 = cy + Math.sin(theta) * innerR;
                const x2 = cx + Math.cos(theta) * outerR;
                const y2 = cy + Math.sin(theta) * outerR;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('stroke', 'rgba(0, 212, 255, 0.2)');
                line.setAttribute('stroke-width', '0.6');
                svgSpokes.appendChild(line);
            }
        }

        // Event listener
        slider.addEventListener('input', () => {
            updateDisplay(parseInt(slider.value));
        });

        // Initial draw
        updateDisplay(32);
    }

    // ============================================
    // Stability Canvas — Animated Precession
    // ============================================
    function initStabilityCanvas() {
        const canvas = document.getElementById('stabilityCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let w, h, dpr;
        let time = 0;
        let animId;
        let isVisible = false;

        function resize() {
            dpr = window.devicePixelRatio || 1;
            const rect = canvas.parentElement.getBoundingClientRect();
            w = rect.width;
            h = 550;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function drawArrow(fromX, fromY, toX, toY, color, lineWidth) {
            const headLen = 10;
            const angle = Math.atan2(toY - fromY, toX - fromX);

            ctx.beginPath();
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth || 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(toX, toY);
            ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
        }

        function drawWheel3D(cx, cy, radius, tilt, rotation) {
            ctx.save();
            ctx.translate(cx, cy);

            // Tilt the wheel (simulate 3D by squishing vertically)
            const scaleY = Math.cos(tilt);
            ctx.scale(1, Math.max(0.1, scaleY));

            // Spokes
            const spokeCount = 24;
            for (let i = 0; i < spokeCount; i++) {
                const theta = (i / spokeCount) * Math.PI * 2 + rotation;
                const x = Math.cos(theta) * radius;
                const y = Math.sin(theta) * radius;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(x, y);
                ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
                ctx.lineWidth = 0.6;
                ctx.stroke();
            }

            // Rim
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Hub
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
            ctx.fill();

            ctx.restore();
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            time += 0.015;

            const cx = w / 2;
            const cy = h / 2;
            const wheelR = Math.min(w, h) * 0.25;

            // Oscillating tilt angle (simulating tilt → precession → recovery cycle)
            const cyclePhase = time * 0.3;
            const tilt = Math.sin(cyclePhase) * 0.4;
            const precession = time * 0.5;
            const wheelSpin = time * 3;

            // Ground line
            ctx.beginPath();
            ctx.moveTo(cx - 200, cy + wheelR + 30);
            ctx.lineTo(cx + 200, cy + wheelR + 30);
            ctx.strokeStyle = 'rgba(255,255,255,0.04)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw the wheel with tilt
            drawWheel3D(cx, cy, wheelR, tilt, wheelSpin);

            // Angular momentum vector (along rotation axis, horizontal)
            const L_len = wheelR * 1.2;
            const L_dir = tilt > 0 ? 1 : -1;
            drawArrow(
                cx, cy,
                cx + L_len * Math.cos(tilt * 0.3), cy - L_len * 0.3,
                'rgba(0, 212, 255, 0.7)', 2.5
            );
            ctx.font = '16px JetBrains Mono';
            ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
            ctx.fillText('L', cx + L_len * Math.cos(tilt * 0.3) + 8, cy - L_len * 0.3 - 4);

            // Gravity vector (downward)
            const gLen = wheelR * 0.7;
            drawArrow(
                cx, cy,
                cx, cy + gLen,
                'rgba(248, 113, 113, 0.6)', 2
            );
            ctx.fillStyle = 'rgba(248, 113, 113, 0.7)';
            ctx.fillText('mg', cx + 8, cy + gLen - 4);

            // Torque vector (perpendicular to both L and mg)
            if (Math.abs(tilt) > 0.05) {
                const tauAngle = tilt > 0 ? -Math.PI / 2 : Math.PI / 2;
                const tauLen = wheelR * 0.6;
                drawArrow(
                    cx, cy,
                    cx + Math.cos(tauAngle) * tauLen, cy + Math.sin(tauAngle) * tauLen,
                    'rgba(251, 191, 36, 0.6)', 2
                );
                ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
                ctx.fillText('τ', cx + Math.cos(tauAngle) * tauLen + 8, cy + Math.sin(tauAngle) * tauLen);
            }

            // Precession arc
            if (Math.abs(tilt) > 0.1) {
                const arcR = wheelR * 0.5;
                ctx.beginPath();
                ctx.arc(cx, cy - wheelR * 0.1, arcR, -0.5, 0.5);
                ctx.strokeStyle = 'rgba(52, 211, 153, 0.3)';
                ctx.lineWidth = 1.5;
                ctx.setLineDash([4, 4]);
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = 'rgba(52, 211, 153, 0.6)';
                ctx.fillText('Ωp', cx + arcR + 4, cy - wheelR * 0.1);
            }

            // Phase indicator
            const phases = [
                { label: '倾斜 Tilt', color: '#f87171', range: [-0.4, -0.1] },
                { label: '进动 Precession', color: '#fbbf24', range: [-0.1, 0.1] },
                { label: '回正 Recovery', color: '#34d399', range: [0.1, 0.4] }
            ];

            const currentTilt = Math.sin(cyclePhase);
            let currentPhase = phases[1];
            if (currentTilt < -0.1) currentPhase = phases[0];
            else if (currentTilt > 0.1) currentPhase = phases[2];

            ctx.font = '18px JetBrains Mono';
            ctx.fillStyle = currentPhase.color;
            ctx.textAlign = 'center';
            ctx.fillText(currentPhase.label, cx, h - 30);
            ctx.textAlign = 'left';

            // Tilt angle indicator
            ctx.font = '14px JetBrains Mono';
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillText(`θ = ${(tilt * 180 / Math.PI).toFixed(1)}°`, 20, 30);

            animId = requestAnimationFrame(draw);
        }

        // Only animate when visible
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !isVisible) {
                        isVisible = true;
                        resize();
                        draw();
                    } else if (!entry.isIntersecting && isVisible) {
                        isVisible = false;
                        cancelAnimationFrame(animId);
                    }
                });
            },
            { threshold: 0.2 }
        );

        resize();
        observer.observe(canvas.parentElement);

        window.addEventListener('resize', () => {
            if (isVisible) resize();
        });
    }

    // ============================================
    // Formula Modules — Scroll Animations & Spokes
    // ============================================
    function initFormulaModules() {
        // Generate CSS-based spoke lines for the animated wheels
        generateWheelSpokes('fmSpokes1', 20);
        generateWheelSpokes('fmSpokes2', 16);

        // IntersectionObserver for formula entrance animations
        const formulaModules = document.querySelectorAll('.fm');
        const fmObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                    }
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
        );

        formulaModules.forEach(fm => fmObserver.observe(fm));

        // Variable highlight on hover — cycle through variables
        formulaModules.forEach(fm => {
            const vars = fm.querySelectorAll('.fm__var');
            let highlightInterval = null;
            let currentIndex = 0;

            // Auto-highlight variables when module comes into view
            const autoObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            startAutoHighlight();
                        } else {
                            stopAutoHighlight();
                        }
                    });
                },
                { threshold: 0.5 }
            );

            autoObserver.observe(fm);

            function startAutoHighlight() {
                if (highlightInterval) return;
                currentIndex = 0;
                highlightNext();
                highlightInterval = setInterval(highlightNext, 2000);
            }

            function stopAutoHighlight() {
                if (highlightInterval) {
                    clearInterval(highlightInterval);
                    highlightInterval = null;
                }
                vars.forEach(v => v.classList.remove('highlight'));
            }

            function highlightNext() {
                vars.forEach(v => v.classList.remove('highlight'));
                if (vars.length > 0) {
                    vars[currentIndex].classList.add('highlight');
                    currentIndex = (currentIndex + 1) % vars.length;
                }
            }

            // Manual hover overrides auto-highlight
            vars.forEach((v, i) => {
                v.addEventListener('mouseenter', () => {
                    stopAutoHighlight();
                    vars.forEach(x => x.classList.remove('highlight'));
                    v.classList.add('highlight');
                });
                v.addEventListener('mouseleave', () => {
                    v.classList.remove('highlight');
                    // Restart auto-highlight after a brief pause
                    setTimeout(() => {
                        if (!fm.matches(':hover')) startAutoHighlight();
                    }, 500);
                });
            });
        });
    }

    /**
     * Generate CSS spoke lines inside a wheel element
     */
    function generateWheelSpokes(containerId, count) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const spoke = document.createElement('div');
            spoke.className = 'fm__wheel-spoke';
            spoke.style.transform = `rotate(${(i / count) * 360}deg)`;
            container.appendChild(spoke);
        }
    }

    // ============================================
    // Presentation Mode Toggle
    // ============================================
    function initPresentationMode() {
        const btn = document.getElementById('presToggle');
        if (!btn) return;

        btn.addEventListener('click', () => {
            document.body.classList.toggle('presentation-mode');
        });
    }

})();
