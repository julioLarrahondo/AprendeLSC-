// Main JavaScript for LSC Learning Platform

// Global variables
let userProgress = {
    points: 0,
    level: 1,
    completedLessons: 0,
    streak: 0,
    modules: {
        alphabet: { progress: 0, completed: [], currentLesson: 0 },
        animals:{ progress: 0, completed: [], currentLesson: 0 },
        colors: { progress: 0, completed: [], currentLesson: 0 },
        numbers: { progress: 0, completed: [], currentLesson: 0 },
        vowels: { progress: 0, completed: [], currentLesson: 0 },
        phrases: { progress: 0, completed: [], currentLesson: 0 },
        words: { progress: 0, completed: [], currentLesson: 0 },
        
        
    }
};

// Module configurations
const moduleConfigs = {
    
     vowels: {
        name: 'Vocales',
        icon: 'fas fa-font',
        color: 'primary',
        description: 'Aprende las vocales',
        totalLessons: 5
    },

    alphabet: {
        name: 'Alfabeto LSC',
        icon: 'fas fa-font',
        color: 'primary',
        description: 'Aprende las 27 letras del alfabeto en LSC',
        totalLessons: 26
    },
    

    animals: {
        name: 'Animales',
        icon: 'fas fa-dog', 
        color: 'success',
        description: 'Aprende los nombres de animales en LSC',
        totalLessons: 4
    },
    

    colors: {
        name: 'Colores',
        icon: 'fas fa-palette', 
        color: 'info',
        description: 'Aprende los colores básicos',
        totalLessons: 5
    },


    phrases: {
        name: 'Frases Comunes',
        icon: 'fas fa-comments',
        color: 'info',
        description: 'Expresiones útiles para conversaciones',
        totalLessons: 5
    },


   
          
    words: {
        name: 'Palabras Básicas',
        icon: 'fas fa-comment',
        color: 'warning',
        description: 'Vocabulario esencial para comunicarte',
        totalLessons: 10
    },

         

};


// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('LSC Learning Platform initialized');
    initializeApp();
});

function initializeApp() {
    loadUserProgress();
    renderModules();
    updateUI();
    initializeAnimations();
    initializeSmoothScrolling();
    
    // Initialize gamification system
    if (window.GamificationSystem) {
        window.GamificationSystem.loadGamificationData();
    }
}

function loadUserProgress() {
    const savedProgress = localStorage.getItem('lscProgress');
    if (savedProgress) {
        userProgress = { ...userProgress, ...JSON.parse(savedProgress) };
    }
}

function saveUserProgress() {
    localStorage.setItem('lscProgress', JSON.stringify(userProgress));
}

function renderModules() {
    
    const modulesContainer = document.getElementById('modulesContainer');
    if (!modulesContainer) return;
    
    modulesContainer.innerHTML = '';
    
    Object.keys(moduleConfigs).forEach((moduleKey, index) => {
        const config = moduleConfigs[moduleKey];
        const progress = userProgress.modules[moduleKey].progress;
        
        
        const moduleCard = createModuleCard(moduleKey, config, progress);
        modulesContainer.appendChild(moduleCard);
        
        // Animate card entrance
        gsap.set(moduleCard, { y: 50, opacity: 0 });
        gsap.to(moduleCard, {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: "back.out(1.7)"
        });
    });
}

function createModuleCard(moduleKey, config, progress) {
    const card = document.createElement('div');
    card.className = 'col-lg-3 col-md-6';
    
    card.innerHTML = `
        <div class="module-card card h-100 shadow-sm" data-module="${moduleKey}">
            <div class="card-body text-center">
                <div class="module-icon mb-3">
                    <i class="${config.icon} fa-3x text-${config.color}"></i>
                </div>
                <h5 class="card-title">${config.name}</h5>
                <p class="card-text">${config.description}</p>
                <div class="progress mb-3">
                    <div class="progress-bar bg-${config.color}" 
                         role="progressbar" 
                         style="width: ${progress}%" 
                         id="progress-${moduleKey}">
                    </div>
                </div>
                <div class="mb-3">
                    <small class="text-muted">
                        ${userProgress.modules[moduleKey].completed.length}/${config.totalLessons} lecciones
                    </small>
                </div>
                <button class="btn btn-${config.color}" onclick="openModule('${moduleKey}')">
                    <i class="fas fa-play me-2"></i>
                    ${progress > 0 ? 'Continuar' : 'Comenzar'}
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// ... Todo tu código original arriba ...

function openModule(moduleName) {
    const modal = new bootstrap.Modal(document.getElementById('moduleModal'));
    const modalTitle = document.getElementById('moduleModalTitle');
    const moduleFrame = document.getElementById('moduleFrame');
    
    modalTitle.textContent = moduleConfigs[moduleName].name;
    moduleFrame.src = `modules/${moduleName}.html`;
    
    modal.show();
    
    // Animación
    gsap.from('.modal-content', {
        duration: 0.5,
        scale: 0.8,
        opacity: 0,
        ease: "back.out(1.7)"
    });
}

// Evento para detener cámara al cerrar el modal
document.getElementById('moduleModal').addEventListener('hidden.bs.modal', function () {
    const moduleFrame = document.getElementById('moduleFrame');

    // Avisar al iframe que debe detener la cámara
    if (moduleFrame.contentWindow) {
        moduleFrame.contentWindow.postMessage({ type: 'stopCamera' }, '*');
    }

    // Limpia el src para liberar recursos
    moduleFrame.src = '';
});

// ... El resto de tu código original abajo ...


function updateUI() {
    // Update navbar
    const userPointsElement = document.getElementById('userPoints');
    const userLevelElement = document.getElementById('userLevel');
    
    if (userPointsElement) userPointsElement.textContent = userProgress.points;
    if (userLevelElement) userLevelElement.textContent = userProgress.level;
    
    // Update progress section
    updateProgressSection();
    
    // Update module progress bars
    Object.keys(userProgress.modules).forEach(module => {
        const progressBar = document.getElementById(`progress-${module}`);
        if (progressBar) {
            const progress = userProgress.modules[module].progress;
            gsap.to(progressBar, {
                width: `${progress}%`,
                duration: 0.8,
                ease: "power2.out"
            });
        }
    });
    
    // Update achievements
    updateAchievements();
}

function updateProgressSection() {
    const elements = {
        totalPoints: document.getElementById('totalPoints'),
        currentLevel: document.getElementById('currentLevel'),
        completedLessons: document.getElementById('completedLessons'),
        streak: document.getElementById('streak')
    };
    
    if (elements.totalPoints) {
        gsap.to(elements.totalPoints, {
            duration: 1,
            textContent: userProgress.points,
            roundProps: "textContent",
            ease: "power2.out"
        });
    }
    
    if (elements.currentLevel) {
        elements.currentLevel.textContent = userProgress.level;
    }
    
    if (elements.completedLessons) {
        gsap.to(elements.completedLessons, {
            duration: 1,
            textContent: userProgress.completedLessons,
            roundProps: "textContent",
            ease: "power2.out"
        });
    }
    
    if (elements.streak) {
        elements.streak.textContent = userProgress.streak;
    }
}

function updateAchievements() {
    const achievementsList = document.getElementById('achievementsList');
    if (!achievementsList) return;
    
    const unlockedAchievements = JSON.parse(localStorage.getItem('lscAchievements') || '[]');
    const achievements = [];
    
    // Define achievements based on progress
    if (userProgress.points >= 50) achievements.push('🌟 Primeros Pasos');
    if (userProgress.points >= 100) achievements.push('🎯 Centena');
    if (userProgress.level >= 3) achievements.push('🚀 Ascendente');
    if (userProgress.completedLessons >= 10) achievements.push('📚 Estudioso');
    if (userProgress.streak >= 7) achievements.push('🔥 Semana Perfecta');
    
    // Check module completions
    Object.keys(userProgress.modules).forEach(module => {
        if (userProgress.modules[module].progress === 100) {
            const moduleNames = {
                vowels: '✋ Buen comienzo ¡A por todo!',
                animals:'perfecto',
                alphabet: '✋ Maestro del Alfabeto',
                numbers: '🔢 Contador Experto',
                words: '💬 Vocabulario Rico',
                phrases: '🗣️ Conversador',
                colors: '🗣️ Conversador',

            };
            if (moduleNames[module]) {
                achievements.push(moduleNames[module]);
            }
        }
    });
    
    // Render achievements
    achievementsList.innerHTML = achievements.map(achievement => 
        `<span class="achievement-badge">${achievement}</span>`
    ).join('');
    
    // Animate new achievements
    gsap.from('.achievement-badge', {
        duration: 0.6,
        scale: 0,
        opacity: 0,
        stagger: 0.1,
        ease: "back.out(1.7)"
    });
}

function initializeAnimations() {
    // Hero section animations
    const heroTimeline = gsap.timeline();
    
    heroTimeline
        .from('.hero-content h1', { 
            duration: 1, 
            y: 50, 
            opacity: 0, 
            ease: "power2.out" 
        })
        .from('.hero-content p', { 
            duration: 0.8, 
            y: 30, 
            opacity: 0, 
            ease: "power2.out" 
        }, "-=0.5")
        .from('.hero-content .btn', { 
            duration: 0.6, 
            y: 20, 
            opacity: 0, 
            stagger: 0.2, 
            ease: "power2.out" 
        }, "-=0.3");
    
    // Floating hands animation
    gsap.to('.hand-icon', {
        y: -20,
        duration: 2,
        ease: "power2.inOut",
        stagger: 0.5,
        repeat: -1,
        yoyo: true
    });
    
    // Scroll-triggered animations
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.from('#modules .display-5', {
        scrollTrigger: '#modules',
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power2.out"
    });
    
    gsap.from('#progress .display-5', {
        scrollTrigger: '#progress',
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power2.out"
    });
}

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: target,
                    ease: "power2.inOut"
                });
            }
        });
    });
}

function startLearning() {
    gsap.to(window, {
        duration: 1,
        scrollTo: "#modules",
        ease: "power2.inOut"
    });
    
    // Animate module cards
    gsap.from('.module-card', {
        duration: 0.8,
        scale: 0.8,
        opacity: 0,
        stagger: 0.2,
        ease: "back.out(1.7)"
    });
}

function showProgress() {
    gsap.to(window, {
        duration: 1,
        scrollTo: "#progress",
        ease: "power2.inOut"
    });
    
    // Animate stats
    setTimeout(() => {
        updateProgressSection();
    }, 500);
}

// Award points function
function awardPoints(points, reason = '') {
    const oldLevel = userProgress.level;
    userProgress.points += points;
    
    // Check for level up
    const newLevel = Math.floor(userProgress.points / 100) + 1;
    if (newLevel > userProgress.level) {
        userProgress.level = newLevel;
        if (window.GamificationSystem) {
            window.GamificationSystem.triggerLevelUp({ level: newLevel });
        }
    }
    
    // Animate points update
    const pointsElement = document.getElementById('userPoints');
    if (pointsElement) {
        gsap.to(pointsElement, {
            duration: 0.5,
            textContent: userProgress.points,
            roundProps: "textContent",
            ease: "power2.out"
        });
    }
    
    // Show floating points
    showFloatingPoints(points);
    
    // Save progress
    saveUserProgress();
    updateUI();
    
    // Check achievements
    if (window.GamificationSystem) {
        window.GamificationSystem.checkAchievements();
    }
}

function showFloatingPoints(points) {
    const pointsElement = document.getElementById('userPoints');
    if (!pointsElement) return;
    
    const rect = pointsElement.getBoundingClientRect();
    const floatingPoints = document.createElement('div');
    floatingPoints.className = 'floating-points';
    floatingPoints.textContent = `+${points}`;
    floatingPoints.style.cssText = `
        position: fixed;
        top: ${rect.top}px;
        left: ${rect.right + 10}px;
        color: #28a745;
        font-weight: bold;
        font-size: 1.2rem;
        z-index: 9999;
        pointer-events: none;
    `;
    
    document.body.appendChild(floatingPoints);
    
    gsap.timeline()
        .from(floatingPoints, { 
            duration: 0.3, 
            scale: 0, 
            ease: "back.out(1.7)" 
        })
        .to(floatingPoints, { 
            duration: 1, 
            y: -50, 
            opacity: 0, 
            ease: "power2.out" 
        })
        .call(() => floatingPoints.remove());
}

// Complete lesson function
function completeLesson(moduleName, lessonIndex) {
    if (!userProgress.modules[moduleName].completed.includes(lessonIndex)) {
        userProgress.modules[moduleName].completed.push(lessonIndex);
        userProgress.completedLessons++;
        
        // Update module progress
        const totalLessons = moduleConfigs[moduleName].totalLessons;
        const completedLessons = userProgress.modules[moduleName].completed.length;
        userProgress.modules[moduleName].progress = Math.round((completedLessons / totalLessons) * 100);
        
        // Award points
        awardPoints(10, 'completar lección');
        
        // Check for module completion
        if (userProgress.modules[moduleName].progress === 100) {
            awardPoints(50, 'completar módulo');
            showModuleCompletion(moduleName);
        }
        
        saveUserProgress();
        updateUI();
    }
}

function showModuleCompletion(moduleName) {
    const moduleNames = {
        vowels: 'vocales',
        alphabet: 'Alfabeto',
        numbers: 'Números',
        animals:'Animales',
        words: 'Palabras Básicas',
        phrases: 'Frases Comunes',
        colors: 'Colores'
    };
    
    if (window.GamificationSystem) {
        window.GamificationSystem.showNotification(
            `¡Felicitaciones! Has completado el módulo de ${moduleNames[moduleName]}`,
            'success'
        );
    }
}

// Export functions for global access
window.LSCApp = {
    openModule,
    awardPoints,
    completeLesson,
    updateUI,
    saveUserProgress,
    userProgress,
    moduleConfigs,
};

// Handle module iframe communication
window.addEventListener('message', function(event) {
    if (event.data.type === 'lessonCompleted') {
        completeLesson(event.data.module, event.data.lesson);
    } else if (event.data.type === 'awardPoints') {
        awardPoints(event.data.points, event.data.reason);
    }
});