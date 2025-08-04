// Módulo del alfabeto para la plataforma Aprende LSC

const alphabetData = [
    { letter: 'A', sign: '✊', description: 'Cierra tu mano como si fueras a hacer un puño, pero deja el dedo gordo (pulgar) estirado hacia adelante.', tip: 'Asegúrate de que los otros dedos estén bien cerrados.' },
    { letter: 'E', sign: '✊', description: 'Haz el puño, pero deja los dedos un poco más relajados.', tip: 'No aprietes la mano.' },
    { letter: 'I', sign: '🤙', description: 'Mantén el puño cerrado y extiende solo el dedo meñique hacia arriba.', tip: 'Asegúrate de que solo el meñique esté extendido.' },
    { letter: 'O', sign: '👌', description: 'Forma un círculo con todos los dedos, como si el puño tomara una forma más redonda.', tip: 'Dibuja una “O” con la mano.' },
    { letter: 'U', sign: '🤘', description: 'Mantén el puño cerrado y estira el dedo índice y el meñique hacia arriba.', tip: 'Señal de rock.' }
];

const clapAudio = new Audio("../assets/audio/celebartion_mario.mp3");
clapAudio.volume = 0.8;

let currentLesson = 0;
let socket = null;

// Variables globales para cámara
let stream = null;
let captureInterval = null;
let isProcessing = false;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

document.addEventListener('DOMContentLoaded', () => {
    initSocket();
    loadLesson(currentLesson);
    updateNavigation();
});

function initSocket() {
    socket = io("https://28371462829d.ngrok-free.app");

    socket.on('connect', () => {
        console.log("Conectado con SID:", socket.id);
        window.currentSID = socket.id;
    });

    let isCelebrating = false;

    socket.on('nueva_letra', (data) => {
        const { letra } = data;
        const expectedLetter = alphabetData[currentLesson]?.letter;

        if (!isCelebrating && letra?.toUpperCase() === expectedLetter) {
            isCelebrating = true;

            confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
            clapAudio.play();

            showCelebration("¡Correcto! 🎉");

            setTimeout(() => {
                if (currentLesson < alphabetData.length - 1) {
                    currentLesson++;
                    loadLesson(currentLesson);
                    updateNavigation();
                    isCelebrating = false;
                } else {
                    showCelebration("🎓 ¡Felicidades! Has completado todas las lecciones.");
                    setTimeout(() => window.close(), 5000);
                }
            }, 2000);
        }
    });
}

function showCelebration(message) {
    const celebration = document.createElement('div');
    celebration.innerHTML = `<div class="celebration-message">${message}</div>`;
    Object.assign(celebration.style, {
        position: 'fixed',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '2rem',
        background: 'rgba(255,255,255,0.95)',
        padding: '1rem 2rem',
        borderRadius: '10px',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
        zIndex: 9999
    });
    document.body.appendChild(celebration);
    setTimeout(() => document.body.removeChild(celebration), 1500);
}

function loadLesson(lessonIndex) {
    if (lessonIndex >= alphabetData.length) {
        showCelebration("🎓 ¡Felicidades! Has terminado todas las lecciones.");
        return;
    }

    const lesson = alphabetData[lessonIndex];
    const lessonContent = document.getElementById('lessonContent');

    lessonContent.innerHTML = `
        <div class="sign-display-container">
            <div class="sign-display">${lesson.sign}</div>
            <div class="sign-letter">${lesson.letter}</div>
            <div class="sign-description">${lesson.description}</div>
        </div>

        <div class="practice-section">
            <h5><i class="fas fa-hand-paper me-2"></i>Practica la seña</h5>
            <p class="text-muted">Observa la imagen y practica el movimiento con tu mano.</p>

            <div class="video-container">
                <video id="videoStream" autoplay playsinline muted></video>
                <div class="camera-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                        <circle cx="12" cy="13" r="3"/>
                    </svg>
                </div>
            </div>

            <div class="controls">
                <button id="startCamera" class="btn primary">
                    <i class="fas fa-video me-1"></i> Iniciar Cámara
                </button>
                <button id="stopCamera" class="btn danger" disabled>
                    <i class="fas fa-video-slash me-1"></i> Detener Cámara
                </button>
            </div>

            <div class="practice-tips">
                <div class="alert alert-info border-left-primary">
                    <i class="fas fa-lightbulb me-2"></i>
                    <strong>Consejo:</strong> ${lesson.tip}
                </div>
            </div>
        </div>
    `;

    setupCameraControls();

    document.getElementById('lessonNumber').textContent = `Lección ${lessonIndex + 1} de ${alphabetData.length}`;
    document.getElementById('currentLessonInfo').textContent = `Letra ${lesson.letter}`;
    document.getElementById('lessonProgress').style.width = `${((lessonIndex + 1) / alphabetData.length) * 100}%`;

    gsap.from('.sign-display-container', { duration: 0.8, scale: 0.8, opacity: 0, ease: "back.out(1.7)" });
    gsap.from('.practice-section', { duration: 0.6, y: 30, opacity: 0, delay: 0.3, ease: "power2.out" });
}

function setupCameraControls() {
    const startButton = document.getElementById("startCamera");
    const stopButton = document.getElementById("stopCamera");
    const video = document.getElementById("videoStream");

    startButton.addEventListener("click", async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.style.display = "block";
            startButton.disabled = true;
            stopButton.disabled = false;

            captureInterval = setInterval(() => {
                if (!isProcessing) captureFrame(video);
            }, 500);
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
        }
    });

    stopButton.addEventListener("click", () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            stream = null;
        }
        clearInterval(captureInterval);
        startButton.disabled = false;
        stopButton.disabled = true;
        video.style.display = "none";
    });
}

function captureFrame(video) {
    if (!stream || !window.currentSID) return;
    isProcessing = true;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        if (!blob) {
            console.error("No se pudo convertir el canvas a blob");
            isProcessing = false;
            return;
        }

        const formData = new FormData();
        formData.append("image", blob, "captured_frame.jpg");

        try {
            const response = await fetch(`https://28371462829d.ngrok-free.app/api/translate?sid=${window.currentSID}`, {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            console.log("Respuesta del servidor:", result);
        } catch (error) {
            console.error("Error al enviar la imagen al servidor:", error);
        } finally {
            isProcessing = false;
        }
    }, "image/jpeg");
}
