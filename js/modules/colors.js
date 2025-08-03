// Alphabet module for LSC Learning Platform

const colorData = [
    { color: 'amarillo', image: '../assets/images/colres lsc/amarillo.jpg', description: 'Mano en forma de “A” que se mueve de frente y de costado.', tip: ' movimiento corto.' },
    //{ color: 'azul',  image: '../assets/images/colres lsc/azul.jpg', description: 'Mano en forma de letra “y” que se mueve hacia un lado', tip: 'Haz el giro visible pero controlado, sin exagerar.' },
    { color: 'blanco',  image: '/assets/images/colres lsc/blanco.jpg', description: 'Mano en froma de la letra "L"que se mueve desde el pecho hacia afuera.', tip: 'Haz el gesto amplio y suave, como si limpiaras algo.' },
    { color: 'negro',  image: '../assets/images/colres lsc/negro.jpg', description: 'Mano  que se desliza horizontalmente sobre parte de  la frente.', tip: 'deslisa el indice en la seja  sin cubrir los ojos.' },
    { color: 'rojo', image: '../assets/images/colres lsc/rojo.jpg', description: 'Mano  tocando el menton.', tip: 'mueve el indice de izquierda a derecha.' },
    { color: 'verde', image: '../assets/images/colres lsc/verde.jpg', description: 'Mano en forma de “V” que se mueve hacia ariva desde el hombro.', tip: 'Dirige el movimiento hacia el frente con fluidez.' },
];


const clapAudio = new Audio("../assets/audio/celebartion_mario.mp3");
clapAudio.volume = 0.8;

let currentLesson = 0;

// Variables globales para cámara
let stream = null;
let captureInterval = null;
let isProcessing = false;
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Esperar que el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    loadLesson(currentLesson);
    updateNavigation();
});

function loadLesson(lessonIndex) {
    if (lessonIndex >= colorData.length) {
        showCompletionScreen();
        return;
    }

    const lesson = colorData[lessonIndex];
    const lessonContent = document.getElementById('lessonContent');

    lessonContent.innerHTML = `
        <div class="sign-display-container">
            <div class="sign-display">
            <img src="${lesson.image}" alt="${lesson.name}" />
            </div>
            <div class="sign-color">${lesson.color}</div>
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

    const startCameraButton = document.getElementById("startCamera");
    const stopCameraButton = document.getElementById("stopCamera");
    const videoStream = document.getElementById("videoStream");

    startCameraButton.addEventListener("click", async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoStream.srcObject = stream;
            videoStream.style.display = "block";
            startCameraButton.disabled = true;
            stopCameraButton.disabled = false;

            captureInterval = setInterval(() => {
                if (!isProcessing) captureFrame();
            }, 500);
        } catch (error) {
            console.error("Error al acceder a la cámara:", error);
        }
    });

    stopCameraButton.addEventListener("click", () => stopCamera());

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            videoStream.srcObject = null;
            stream = null;
        }
        clearInterval(captureInterval);
        startCameraButton.disabled = false;
        stopCameraButton.disabled = true;
        videoStream.style.display = "none";
    }

    function captureFrame() {
        if (!stream) return;
        isProcessing = true;

        const video = videoStream;
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
                const response = await fetch("http://localhost:5002/api/translate", {
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

    const socket = io("http://localhost:5002");

    let isCelebrating = false;

    socket.on('nueva_letra', (data) => {
        const { letra, frase } = data;
        const expectedcolor = colorData[currentLesson]?.color;
        


        if (!isCelebrating && letra?.toLowerCase() === expectedcolor?.toLowerCase()) {
            isCelebrating = true;

            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 }
            });

            clapAudio.play();

            const celebration = document.createElement('div');
            celebration.innerHTML = `<div class="celebration-message">¡Correcto! 🎉</div>`;
            celebration.style.position = 'fixed';
            celebration.style.top = '40%';
            celebration.style.left = '50%';
            celebration.style.transform = 'translate(-50%, -50%)';
            celebration.style.fontSize = '2rem';
            celebration.style.background = 'rgba(255,255,255,0.9)';
            celebration.style.padding = '1rem 2rem';
            celebration.style.borderRadius = '10px';
            celebration.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
            document.body.appendChild(celebration);

            setTimeout(() => {
                document.body.removeChild(celebration);
            }, 1500);

            setTimeout(() => {
                if (currentLesson < colorData.length - 1) {
                    currentLesson++;
                    loadLesson(currentLesson);
                    updateNavigation();
                    isCelebrating = false;
                } else {
                    const finalMessage = document.createElement('div');
                    finalMessage.innerHTML = `<div class="celebration-message">🎓 ¡Felicidades! Has terminado la lección. Avanzas a la siguiente. 🎉</div>`;
                    finalMessage.style.position = 'fixed';
                    finalMessage.style.top = '40%';
                    finalMessage.style.left = '50%';
                    finalMessage.style.transform = 'translate(-50%, -50%)';
                    finalMessage.style.fontSize = '2rem';
                    finalMessage.style.background = 'rgba(255,255,255,0.95)';
                    finalMessage.style.padding = '1rem 2rem';
                    finalMessage.style.borderRadius = '10px';
                    finalMessage.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
                    document.body.appendChild(finalMessage);

                    setTimeout(() => {
                        document.body.removeChild(finalMessage);
                        window.close();
                    }, 5002);
                }
            }, 2000);
        }

    });

    document.getElementById('lessonNumber').textContent = `Lección ${lessonIndex + 1} de ${colorData.length}`;
    document.getElementById('currentLessonInfo').textContent = `Letra ${lesson.color}`;
    document.getElementById('lessonProgress').style.width = `${((lessonIndex + 1) / colorData.length) * 100}%`;

    gsap.from('.sign-display-container', { duration: 0.8, scale: 0.8, opacity: 0, ease: "back.out(1.7)" });
    gsap.from('.practice-section', { duration: 0.6, y: 30, opacity: 0, delay: 0.3, ease: "power2.out" });
}
