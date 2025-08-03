// Alphabet module for LSC Learning Platform

const alphabetData = [
  { letter: 'A', sign: '✊', description: 'Cierra tu mano como si fueras a hacer un puño, pero deja el dedo gordo (pulgar) estirado hacia adelante.', tip: 'Asegúrate de que los otros dedos estén bien cerrados.' },
  { letter: 'B', sign: '🖐️', description: 'Extiende todos los dedos juntos y rectos, con la palma hacia adelante,pulgar sobresalido.', tip: 'Mantén los dedos unidos. vez una b' },
  { letter: 'C', sign: '🤏', description: 'Forma una “C” con la mano.', tip: 'La curva debe ser clara y grande.' },
  { letter: 'D', sign: '☝️', description: 'Levanta solo el dedo índice, medio y pulgar forman un circulo.', tip: 'en la camara debe verse el circulo.' },
  { letter: 'E', sign: '✊', description: 'mano en forma de garra .', tip: 'No aprietes la mano.' },
  { letter: 'F', sign: '👌', description: ' pulgar y el índice  extendidos hacia ariba.', tip: '' },
 // { letter: 'G', sign: '👉', description: 'Extiende el dedo índice hacia un lado, como si señalaras.', tip: 'Mantén los otros dedos cerrados.' },
  { letter: 'H', sign: '✌️', description: 'Extiende el índice y el medio juntos, los demás dedos cerrados.', tip: 'apunta a la derecha o izquierda.' },
  { letter: 'I', sign: '🤙', description: 'Mantén el puño cerrado y extiende solo el dedo meñique hacia arriba.', tip: 'Asegúrate de que solo el meñique esté extendido.' },
 // { letter: 'J', sign: '🤙➡️', description: 'Extiende el meñique y dibuja una “J” en el aire.', tip: 'El movimiento es clave.' },
  { letter: 'K', sign: '✌️+👍', description: 'Extiende el índice y medio en forma de “V”, con el pulgar entre ellos. gira un poco la mano', tip: 'El pulgar debe estar entre los dos dedos.' },
  { letter: 'L', sign: '🫱', description: 'Extiende el índice y el pulgar formando una “L”.', tip: 'Los otros dedos deben estar cerrados.' },
  { letter: 'M', sign: '🤟', description: 'apunta haci abjo con los dedos indice ,medio y anular.', tip: 'pulgar y meñique bien cerrados.' },
  { letter: 'N', sign: '🤘', description: 'apunta haci abjo con los dedos indice y medio.', tip: 'pulgar, meñique y anular bien cerrados.' },
  { letter: 'O', sign: '👌', description: 'Forma un círculo con todos los dedos, como si el puño tomara una forma más redonda.', tip: 'Dibuja una “O” con la mano.' },
  { letter: 'P', sign: '🤞', description: 'indice apunta hacia abajo,dedo medio en forma de circulo,otros dedos cerrados.', tip: 'se puede observar la letra "P"' },
  { letter: 'Q', sign: '👈', description: 'junta todas las llemas de los dedos.', tip: 'todos apuntan hacia arriba.' },
  { letter: 'R', sign: '✌️🔁', description: 'Cruza el índice y el medio formando una “X”.', tip: 'Los dedos deben estar bien cruzados.' },
  { letter: 'S', sign: '✊', description: 'Haz un puño cerrado, sin pulgar visible,levanta el indice', tip: '' },
  { letter: 'T', sign: '☝️+👈', description: 'haz una T con el indice y el pulgar.', tip: 'todos los dedos levantados..' },
  { letter: 'U', sign: '🤘', description: 'Mantén el puño cerrado y estira el dedo índice y el meñique hacia arriba.', tip: 'Señal de rock.' },
  { letter: 'V', sign: '✌️', description: 'Extiende el índice y el medio formando una “V”.', tip: 'seña amor y paz .' },
  { letter: 'W', sign: '🖖', description: 'Extiende los dedos indice,medio y anular separados, formando una “W”.', tip: '' },
  { letter: 'X', sign: '☝️➰', description: 'Mano cerrado, dedo indice  mas arriba ', tip: 'forma de gancho' },
  { letter: 'Y', sign: '🤙', description: 'Extiende el pulgar y el meñique, los demás dedos cerrados.', tip: ' gesto de “llámame”.' },
  { letter: 'Z', sign: '☝️➡️↘️', description: 'Extiende el índice y el medio .', tip: 'apunta hacia arriba.' }


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
    if (lessonIndex >= alphabetData.length) {
        showCompletionScreen();
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
                const response = await fetch("http://localhost:5009/api/translate", {
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

    const socket = io("http://localhost:5009");

    let isCelebrating = false;

    socket.on('nueva_letra', (data) => {
        const { letra, frase } = data;
        const expectedLetter = alphabetData[currentLesson]?.letter;

        if (!isCelebrating && letra?.toUpperCase() === expectedLetter) {
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
                if (currentLesson < alphabetData.length - 1) {
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
                    }, 5009);
                }
            }, 2000);
        }

       
    });

    document.getElementById('lessonNumber').textContent = `Lección ${lessonIndex + 1} de ${alphabetData.length}`;
    document.getElementById('currentLessonInfo').textContent = `Letra ${lesson.letter}`;
    document.getElementById('lessonProgress').style.width = `${((lessonIndex + 1) / alphabetData.length) * 100}%`;

    gsap.from('.sign-display-container', { duration: 0.8, scale: 0.8, opacity: 0, ease: "back.out(1.7)" });
    gsap.from('.practice-section', { duration: 0.6, y: 30, opacity: 0, delay: 0.3, ease: "power2.out" });
}
