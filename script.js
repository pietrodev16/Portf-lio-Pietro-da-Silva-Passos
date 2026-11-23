const desktopPointer = window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)');
const sphere = document.querySelector('.sphere-3d');

if (sphere && desktopPointer.matches) {
    document.addEventListener('mousemove', (event) => {
        const x = (window.innerWidth / 2 - event.pageX) / 40;
        const y = (window.innerHeight / 2 - event.pageY) / 40;

        sphere.style.marginLeft = `${x}px`;
        sphere.style.marginTop = `${y}px`;
    });
}

const constellationCanvas = document.querySelector('.constellation-background');
const constellationContext = constellationCanvas?.getContext('2d');

if (constellationCanvas && constellationContext) {
    const constellations = [
        {
            name: 'Ursa Maior',
            width: 130,
            height: 90,
            stars: [
                { name: 'Dubhe', x: 0.78, y: 0.16 },
                { name: 'Merak', x: 0.72, y: 0.73 },
                { name: 'Phecda', x: 0.28, y: 0.68 },
                { name: 'Megrez', x: 0.34, y: 0.18 },
                { name: 'Alioth', x: 0.08, y: 0.14 },
                { name: 'Mizar', x: 0.04, y: 0.53 },
                { name: 'Alkaid', x: 0.02, y: 0.94 }
            ],
            lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]]
        },
        {
            name: 'Órion',
            width: 105,
            height: 135,
            stars: [
                { name: 'Betelgeuse', x: 0.12, y: 0.1 },
                { name: 'Bellatrix', x: 0.84, y: 0.18 },
                { name: 'Alnitak', x: 0.32, y: 0.48 },
                { name: 'Alnilam', x: 0.49, y: 0.51 },
                { name: 'Mintaka', x: 0.66, y: 0.54 },
                { name: 'Saiph', x: 0.22, y: 0.92 },
                { name: 'Rigel', x: 0.88, y: 0.88 },
                { name: 'Meissa', x: 0.48, y: 0.02 },
                { name: 'Theta Orionis', x: 0.54, y: 0.68 },
                { name: 'Iota Orionis', x: 0.57, y: 0.8 }
            ],
            lines: [[7, 0], [7, 1], [0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [3, 8], [8, 9]]
        },
        {
            name: 'Cassiopeia',
            width: 115,
            height: 75,
            stars: [
                { name: 'Caph', x: 0.08, y: 0.18 },
                { name: 'Schedar', x: 0.28, y: 0.82 },
                { name: 'Gamma Cassiopeiae', x: 0.5, y: 0.28 },
                { name: 'Ruchbah', x: 0.72, y: 0.83 },
                { name: 'Segin', x: 0.94, y: 0.16 }
            ],
            lines: [[0, 1], [1, 2], [2, 3], [3, 4]]
        }
    ];

    let width = 0;
    let height = 0;
    let lastFrame = 0;
    let stars = [];
    let formations = [];

    const resizeConstellationCanvas = () => {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        constellationCanvas.width = Math.round(width * pixelRatio);
        constellationCanvas.height = Math.round(height * pixelRatio);
        constellationContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const formationCount = Math.max(5, Math.ceil((width * height) / 80000));
        formations = Array.from({ length: formationCount }, (_, index) => {
            const constellation = constellations[index % constellations.length];
            return {
                constellation,
                x: Math.random() * width,
                y: Math.random() * height,
                scale: 0.7 + Math.random() * 0.6,
                speed: 2 + Math.random() * 3,
                opacity: 0.13 + Math.random() * 0.15
            };
        });
        stars = Array.from({ length: Math.ceil((width * height) / 7000) }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 0.4 + Math.random() * 0.8,
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + Math.random() * 1.4
        }));
    };

    const drawConstellations = (timestamp) => {
        const elapsed = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0;
        lastFrame = timestamp;
        constellationContext.clearRect(0, 0, width, height);

        for (const star of stars) {
            star.phase += elapsed * star.speed;
            const glow = 0.35 + (Math.sin(star.phase) + 1) * 0.25;
            constellationContext.beginPath();
            constellationContext.fillStyle = `rgba(245, 248, 255, ${glow})`;
            constellationContext.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            constellationContext.fill();
        }

        for (const formation of formations) {
            const { constellation } = formation;
            formation.x += formation.speed * elapsed;

            if (formation.x - constellation.width * formation.scale > width + 20) {
                formation.x = -constellation.width * formation.scale - 20;
                formation.y = Math.random() * height;
            }

            constellationContext.strokeStyle = `rgba(218, 228, 245, ${formation.opacity})`;
            constellationContext.lineWidth = 0.8;
            constellationContext.beginPath();
            for (const [from, to] of constellation.lines) {
                const start = constellation.stars[from];
                const end = constellation.stars[to];
                constellationContext.moveTo(
                    formation.x + start.x * constellation.width * formation.scale,
                    formation.y + start.y * constellation.height * formation.scale
                );
                constellationContext.lineTo(
                    formation.x + end.x * constellation.width * formation.scale,
                    formation.y + end.y * constellation.height * formation.scale
                );
            }
            constellationContext.stroke();

            for (const star of constellation.stars) {
                const x = formation.x + star.x * constellation.width * formation.scale;
                const y = formation.y + star.y * constellation.height * formation.scale;
                constellationContext.beginPath();
                constellationContext.fillStyle = 'rgba(255, 255, 255, 0.9)';
                constellationContext.arc(x, y, 1.4, 0, Math.PI * 2);
                constellationContext.fill();
                constellationContext.beginPath();
                constellationContext.fillStyle = 'rgba(255, 255, 255, 0.12)';
                constellationContext.arc(x, y, 4, 0, Math.PI * 2);
                constellationContext.fill();
            }
        }

        window.requestAnimationFrame(drawConstellations);
    };

    resizeConstellationCanvas();
    window.addEventListener('resize', resizeConstellationCanvas);
    window.requestAnimationFrame(drawConstellations);
}
