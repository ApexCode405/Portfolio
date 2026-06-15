document.addEventListener('DOMContentLoaded', () => {

    let isVisualFeedbackEnabled = true;
    let isOptimizationModeActive = false;
    let deviceIsMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    const customCursorNode = document.getElementById('apex-custom-cursor');
    const shapeNodes = document.querySelectorAll('.soft-shape');
    const mobileFeedbackContainer = document.getElementById('mobile-feedback-container');
    const networkCanvas = document.getElementById('network-canvas');
    const canvasContext = networkCanvas.getContext('2d');

    const themeSelectorContainer = document.getElementById('theme-selector-container');
    const themeActivePill = themeSelectorContainer.querySelector('.theme-active-pill');
    const themeButtons = themeSelectorContainer.querySelectorAll('.theme-btn-node');
    const themeIndexes = { 'dark': 0, 'light': 1, 'oled': 2 };

    function setTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('apex-theme-core', themeName);
        themeButtons.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName));
        themeActivePill.className = `theme-active-pill theme-selector-pos-${themeIndexes[themeName] || 0}`;
        document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
        setTimeout(() => { document.body.style.transition = ''; }, 500);
    }

    themeButtons.forEach(btn => btn.addEventListener('click', () => setTheme(btn.getAttribute('data-theme'))));
    setTheme(localStorage.getItem('apex-theme-core') || 'dark');

    const burgerMenuBtn = document.getElementById('burger-menu-btn');
    const controlDrawer = document.getElementById('control-drawer');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    burgerMenuBtn.addEventListener('click', () => controlDrawer.classList.add('open'));
    const closeMenu = () => controlDrawer.classList.remove('open');
    closeDrawerBtn.addEventListener('click', closeMenu);
    drawerLinks.forEach(link => link.addEventListener('click', closeMenu));

    const toggleFeedback = document.getElementById('toggle-visual-feedback');
    const toggleOptMode = document.getElementById('toggle-optimization-mode');

    toggleFeedback.addEventListener('change', (e) => {
        isVisualFeedbackEnabled = e.target.checked;
        if (!isVisualFeedbackEnabled) {
            if (customCursorNode) customCursorNode.style.display = 'none';
            if (mobileFeedbackContainer) mobileFeedbackContainer.innerHTML = '';
        } else {
            if (!deviceIsMobile && customCursorNode) customCursorNode.style.display = 'flex';
        }
    });

    toggleOptMode.addEventListener('change', (e) => {
        isOptimizationModeActive = e.target.checked;
        if (isOptimizationModeActive) {
            document.body.classList.add('optimization-mode-active');
        } else {
            document.body.classList.remove('optimization-mode-active');
        }
    });

    const shapeClasses = ['shape-square', 'shape-triangle', 'shape-circle', 'shape-star', 'shape-pentagon'];
    let currentShapeIndex = 0;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    if (!deviceIsMobile && customCursorNode) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function renderHardwareCursor() {
            if (isVisualFeedbackEnabled) {
                customCursorNode.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(renderHardwareCursor);
        }
        requestAnimationFrame(renderHardwareCursor);

        function advanceShapeSequence() {
            shapeNodes.forEach(node => node.classList.remove('active'));
            currentShapeIndex = (currentShapeIndex + 1) % shapeClasses.length;
            const targetClass = shapeClasses[currentShapeIndex];
            const targetNode = document.querySelector(`.soft-shape.${targetClass}`);
            if (targetNode) targetNode.classList.add('active');
        }

        let holdInterval = null;

        const interactables = document.querySelectorAll('a, button, .interaction-target');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if(!isVisualFeedbackEnabled) return;
                customCursorNode.classList.add('rotate-loop');
                advanceShapeSequence();
                holdInterval = setInterval(advanceShapeSequence, 600);
            });
            el.addEventListener('mouseleave', () => {
                clearInterval(holdInterval);
                customCursorNode.classList.remove('rotate-loop');
            });
        });

        window.addEventListener('mousedown', () => {
            if(isVisualFeedbackEnabled) advanceShapeSequence();
        });

        window.addEventListener('contextmenu', () => {
            clearInterval(holdInterval);
            customCursorNode.classList.remove('rotate-loop');
        });
    }

    if (deviceIsMobile && customCursorNode) {
        customCursorNode.style.display = 'none';
    }

    const svgBlueprints = [
        `<svg viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" rx="18" fill="currentColor"/></svg>`,
        `<svg viewBox="0 0 100 100"><path d="M50 15 L85 80 L15 80 Z" stroke="currentColor" stroke-width="12" stroke-linejoin="round" fill="currentColor"/></svg>`,
        `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="currentColor"/></svg>`,
        `<svg viewBox="0 0 100 100"><path d="M50 10 L61 38 L90 38 L66 56 L75 85 L50 68 L25 85 L34 56 L10 38 L39 38 Z" stroke="currentColor" stroke-width="8" stroke-linejoin="round" fill="currentColor"/></svg>`,
        `<svg viewBox="0 0 100 100"><path d="M50 15 L90 40 L75 85 L25 85 L10 40 Z" stroke="currentColor" stroke-width="10" stroke-linejoin="round" fill="currentColor"/></svg>`
    ];

    let activeTouchNode = null;
    let touchHoldInterval = null;
    let mobileShapeIndex = 0;

    if (deviceIsMobile) {
        window.addEventListener('touchstart', (e) => {
            if (!isVisualFeedbackEnabled) return;
            let touch = e.touches[0];

            if (activeTouchNode) activeTouchNode.remove();

            activeTouchNode = document.createElement('div');
            activeTouchNode.className = 'mobile-touch-feedback-element';

            activeTouchNode.style.transform = `translate3d(${touch.clientX}px, ${touch.clientY}px, 0) translate(-50%, -50%) scale(0.2)`;

            activeTouchNode.innerHTML = svgBlueprints[mobileShapeIndex];
            mobileFeedbackContainer.appendChild(activeTouchNode);

            touchHoldInterval = setInterval(() => {
                if (activeTouchNode) {
                    mobileShapeIndex = (mobileShapeIndex + 1) % svgBlueprints.length;
                    activeTouchNode.innerHTML = svgBlueprints[mobileShapeIndex];
                }
            }, 600);
        });

        window.addEventListener('touchmove', (e) => {
            if (!isVisualFeedbackEnabled || !activeTouchNode) return;
            let touch = e.touches[0];
            activeTouchNode.style.transform = `translate3d(${touch.clientX}px, ${touch.clientY}px, 0) translate(-50%, -50%) scale(1)`;
        });

        function cleanupTouch() {
            clearInterval(touchHoldInterval);
            if (activeTouchNode) {
                let nodeToFade = activeTouchNode;
                nodeToFade.classList.add('shrink-out');
                setTimeout(() => {
                    if(nodeToFade && nodeToFade.parentNode) nodeToFade.remove();
                }, 200);
                activeTouchNode = null;
            }
            mobileShapeIndex = (mobileShapeIndex + 1) % svgBlueprints.length;
        }

        window.addEventListener('touchend', cleanupTouch);
        window.addEventListener('touchcancel', cleanupTouch);
        document.addEventListener('visibilitychange', () => { if(document.hidden) cleanupTouch(); });
    }

    let particleArray = [];
    const maxNodes = 65;

    function resizeCanvas() {
        networkCanvas.width = window.innerWidth;
        networkCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class NetNode {
        constructor() {
            this.x = Math.random() * networkCanvas.width;
            this.y = Math.random() * networkCanvas.height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > networkCanvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > networkCanvas.height) this.vy *= -1;
        }
        draw(ctx, color) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    for (let i = 0; i < maxNodes; i++) particleArray.push(new NetNode());

    function getThemeColors() {
        const t = document.documentElement.getAttribute('data-theme');
        if (t === 'light') return { d: 'rgba(37, 99, 235, 0.25)', l: 'rgba(37, 99, 235, ' };
        if (t === 'oled') return { d: 'rgba(16, 185, 129, 0.35)', l: 'rgba(16, 185, 129, ' };
        return { d: 'rgba(139, 92, 246, 0.3)', l: 'rgba(139, 92, 246, ' };
    }

    function animateNetwork() {
        if (!isOptimizationModeActive) {
            canvasContext.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
            const colors = getThemeColors();

            particleArray.forEach(p => { p.update(); p.draw(canvasContext, colors.d); });

            for (let i = 0; i < particleArray.length; i++) {
                for (let j = i + 1; j < particleArray.length; j++) {
                    let dx = particleArray[i].x - particleArray[j].x;
                    let dy = particleArray[i].y - particleArray[j].y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 130) {
                        canvasContext.beginPath();
                        canvasContext.moveTo(particleArray[i].x, particleArray[i].y);
                        canvasContext.lineTo(particleArray[j].x, particleArray[j].y);
                        canvasContext.strokeStyle = `${colors.l}${ (1 - dist/130) * 0.15 })`;
                        canvasContext.lineWidth = 0.8;
                        canvasContext.stroke();
                    }
                }
            }
        }
        requestAnimationFrame(animateNetwork);
    }
    requestAnimationFrame(animateNetwork);

    const showcaseCards = document.querySelectorAll('[data-target-modal]');
    const sandboxModal = document.getElementById('global-sandbox-modal');
    const iframeViewport = document.getElementById('sandbox-iframe-viewport');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const runtimeTitle = document.getElementById('modal-runtime-title-tag');

    showcaseCards.forEach(card => {
        card.addEventListener('click', () => {
            let srcPath = card.getAttribute('data-iframe-src');
            runtimeTitle.textContent = `Executing: ${srcPath}`;
            iframeViewport.src = srcPath;
            sandboxModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    const closeSandbox = () => {
        sandboxModal.classList.remove('active');
        iframeViewport.src = 'about:blank';
        document.body.style.overflow = '';
    };

    modalCloseBtn.addEventListener('click', closeSandbox);
    sandboxModal.addEventListener('click', (e) => { if (e.target === sandboxModal) closeSandbox(); });

    const reveals = document.querySelectorAll('.scroll-reveal');
    function checkReveals() {
        reveals.forEach(el => {
            if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
                el.classList.add('reveal-active');
            }
        });
    }
    window.addEventListener('scroll', checkReveals);
    checkReveals();

    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    });

    document.addEventListener('copy', (e) => {
        e.preventDefault();
        return false;
    });

    document.addEventListener('cut', (e) => {
        e.preventDefault();
        return false;
    });

    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
    });

    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
        return false;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C' || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.key === 'U' || e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        if (e.ctrlKey && e.shiftKey && e.key === 'S' || e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
        if (e.key === 'PrintScreen' || e.key === 'SysRq') {
            e.preventDefault();
            return false;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
    });

    let devtoolsOpen = false;
    const threshold = 160;
    const checkDevTools = () => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
            devtoolsOpen = true;
            document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:2rem;">Developer tools detected. Please close them to continue.</div>';
        }
    };
    setInterval(checkDevTools, 1000);

    console.log('%cStop!', 'color: red; font-size: 50px;');
    console.log('%cThis is a protected area. Do not paste anything here.', 'font-size: 20px;');
    console.log('%cIf you are a developer, please close the console.', 'font-size: 16px;');

    window.addEventListener('beforeprint', (e) => {
        e.preventDefault();
        alert('Printing is disabled.');
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            return false;
        }
    });

    const disableSelectionCSS = () => {
        const style = document.createElement('style');
        style.id = 'disable-selection-style';
        style.innerHTML = `* { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }`;
        document.head.appendChild(style);
    };
    disableSelectionCSS();

    const observer = new MutationObserver(() => {
        if (!document.getElementById('disable-selection-style')) {
            disableSelectionCSS();
        }
    });
    observer.observe(document.head, { childList: true });

    window.addEventListener('load', () => {
        if (devtoolsOpen) {
            document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-size:2rem;">Developer tools detected. Please close them to continue.</div>';
        }
    });

});
