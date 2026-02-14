const canvas = document.getElementById("smokeCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let particles = [];
let startTime = Date.now();
let heartFormed = false;
let showHeartAgain = false;
let isTransitioning = false;
let animationPhase = "smoke"; // "smoke", "forming", "visible", "fading"
let targetHeartPositions = [];

function heartShape(t) {
    const baseScale = Math.min(canvas.width, canvas.height) * 0.012;

    const x = baseScale * 16 * Math.pow(Math.sin(t), 3);
    const y = -baseScale * (
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t)
    );

    return {
        x: canvas.width / 2 + x,
        y: canvas.height / 2 + y - 40
    };
}

// Pre-calculate heart positions for smooth formation
for (let t = 0; t < Math.PI * 2; t += 0.1) {
    let pos = heartShape(t);
    targetHeartPositions.push(pos);
}

class Particle {
    constructor(x, y, isSmoke = false, targetX = null, targetY = null) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.size = Math.random() * 5 + (isSmoke ? 4 : 2);
        this.alpha = isSmoke ? 0.7 : 1;
        this.speedX = (Math.random() - 0.5) * (isSmoke ? 0.6 : 1.2);
        this.speedY = (isSmoke ? Math.random() * -0.8 - 0.4 : Math.random() * -1.2 - 0.3);
        this.isSmoke = isSmoke;
        this.drift = (Math.random() - 0.5) * 0.15;
        this.formationProgress = 0;
        this.formationSpeed = 0.005 + Math.random() * 0.01;
        this.delay = Math.random() * 50;
        this.swingOffset = Math.random() * Math.PI * 2;
        this.swingAmount = (Math.random() * 0.5 + 0.5) * 2;
    }

    update() {
        if (this.isSmoke) {
            if (this.targetX !== null && animationPhase === "forming" && this.delay <= 0) {
                this.formationProgress += this.formationSpeed;
                
                let ease = 1 - Math.pow(1 - this.formationProgress, 3);
                
                let targetX = this.targetX + Math.sin(Date.now() * 0.002 + this.swingOffset) * this.swingAmount;
                let targetY = this.targetY + Math.cos(Date.now() * 0.0015 + this.swingOffset) * this.swingAmount;
                
                this.x = this.originalX * (1 - ease) + targetX * ease;
                this.y = this.originalY * (1 - ease) + targetY * ease;
                
                this.size *= (1 + this.formationProgress * 0.01);
                this.alpha = Math.min(0.9, this.alpha + 0.002);
                
                if (this.formationProgress >= 1) {
                    this.isSmoke = false;
                    this.targetX = null;
                    this.targetY = null;
                }
            } else {
                this.delay--;
                this.x += this.speedX + this.drift + Math.sin(Date.now() * 0.003 + this.y * 0.01) * 0.1;
                this.y += this.speedY;
                
                let centerX = canvas.width / 2;
                
                if (this.y < canvas.height * 0.7 && animationPhase === "smoke") {
                    let pull = (canvas.height * 0.7 - this.y) / (canvas.height * 0.7) * 0.02;
                    if (this.x < centerX) {
                        this.x += pull * 2;
                    } else {
                        this.x -= pull * 2;
                    }
                }
            }
            
            this.size *= 1.002;
            this.alpha -= 0.001;
        } else {
            this.x += this.speedX * 0.1;
            this.y += this.speedY * 0.1;
            this.alpha -= 0.003;
            this.size *= 1.001;
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255,105,180,${this.alpha})`;
        ctx.shadowBlur = this.isSmoke ? 25 : 18;
        ctx.shadowColor = "hotpink";
        
        if (this.isSmoke) {
            ctx.shadowBlur = 30;
            ctx.globalAlpha = this.alpha * 0.8;
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

function createConnectedSmoke() {
    let centerX = canvas.width / 2;
    
    // Left stream
    for (let i = 0; i < 4; i++) {
        let x = centerX - 80 - Math.random() * 40;
        let y = canvas.height - 50 + Math.random() * 100;
        let particle = new Particle(x, y, true);
        particle.speedX = Math.random() * 0.3 + 0.1;
        particle.speedY = Math.random() * -0.7 - 0.5;
        particles.push(particle);
    }
    
    // Right stream
    for (let i = 0; i < 4; i++) {
        let x = centerX + 80 + Math.random() * 40;
        let y = canvas.height - 50 + Math.random() * 100;
        let particle = new Particle(x, y, true);
        particle.speedX = Math.random() * -0.3 - 0.1;
        particle.speedY = Math.random() * -0.7 - 0.5;
        particles.push(particle);
    }
    
    // Connecting particles
    for (let i = 0; i < 2; i++) {
        let x = centerX - 20 + Math.random() * 40;
        let y = canvas.height - 30 + Math.random() * 80;
        let particle = new Particle(x, y, true);
        particle.speedY = Math.random() * -0.8 - 0.4;
        particles.push(particle);
    }
}

function formHeartFromSmoke() {
    let smokeParticles = particles.filter(p => p.isSmoke && p.y < canvas.height * 0.6);
    
    for (let i = 0; i < smokeParticles.length; i++) {
        if (i < targetHeartPositions.length) {
            let target = targetHeartPositions[i % targetHeartPositions.length];
            smokeParticles[i].targetX = target.x;
            smokeParticles[i].targetY = target.y;
            smokeParticles[i].originalX = smokeParticles[i].x;
            smokeParticles[i].originalY = smokeParticles[i].y;
        }
    }
    
    if (smokeParticles.length < targetHeartPositions.length) {
        let needed = targetHeartPositions.length - smokeParticles.length;
        for (let i = 0; i < needed; i++) {
            let target = targetHeartPositions[i % targetHeartPositions.length];
            
            let x = canvas.width / 2 - 40 + Math.random() * 80;
            let y = canvas.height * 0.5 + Math.random() * 100;
            let particle = new Particle(x, y, true, target.x, target.y);
            particle.formationProgress = 0.3;
            particles.push(particle);
        }
    }
}

function fadeOutParticles() {
    particles.forEach(p => {
        if (p.isSmoke) {
            p.alpha -= 0.002;
            p.size *= 1.003;
        } else {
            p.alpha -= 0.004;
            p.size *= 1.002;
        }
    });
}

function resetAnimation() {
    particles.forEach(p => {
        if (!p.isSmoke) {
            p.isSmoke = true;
            p.targetX = null;
            p.targetY = null;
            p.speedX = (Math.random() - 0.5) * 0.8;
            p.speedY = Math.random() * -0.8 - 0.4;
            p.alpha *= 0.8;
        }
    });
    
    animationPhase = "smoke";
    heartFormed = false;
    startTime = Date.now();
}

function showMessageBox() {
    const contentBox = document.getElementById("contentBox");
    contentBox.classList.add("visible");
}

function hideMessageBox() {
    const contentBox = document.getElementById("contentBox");
    contentBox.classList.remove("visible");
}

function animate() {
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let elapsed = (Date.now() - startTime) / 1000;

    if (!showHeartAgain) {
        switch(animationPhase) {
            case "smoke":
                createConnectedSmoke();
                
                if (elapsed > 5) {
                    animationPhase = "forming";
                    formHeartFromSmoke();
                }
                break;
                
            case "forming":
                if (elapsed > 8) {
                    animationPhase = "visible";
                }
                break;
                
            case "visible":
                if (particles.length < 500) {
                    for (let i = 0; i < 2; i++) {
                        let t = Math.random() * Math.PI * 2;
                        let pos = heartShape(t);
                        let particle = new Particle(
                            pos.x + (Math.random() - 0.5) * 15,
                            pos.y + (Math.random() - 0.5) * 15,
                            true
                        );
                        particle.alpha = 0.3;
                        particles.push(particle);
                    }
                }
                
                if (elapsed > 10) {
                    animationPhase = "fading";
                }
                break;
                
            case "fading":
                fadeOutParticles();
                
                if (elapsed > 12 && !isTransitioning) {
                    isTransitioning = true;
                    setTimeout(() => {
                        showMessageBox();
                    }, 300);
                }
                break;
        }
    } else {
        resetAnimation();
        hideMessageBox();
        showHeartAgain = false;
        startTime = Date.now();
        isTransitioning = false;
    }

    particles.forEach((p, index) => {
        p.update();
        p.draw();
        if (p.alpha <= 0.01) {
            particles.splice(index, 1);
        }
    });

    requestAnimationFrame(animate);
}

animate();

setTimeout(() => {
    if (!showHeartAgain && animationPhase === "fading") {
        showMessageBox();
    }
}, 12300);

document.getElementById("proceedBtn").addEventListener("click", () => {
    const proceedBtn = document.getElementById("proceedBtn");
    proceedBtn.classList.add("hide");
    
    setTimeout(() => {
        document.getElementById("messageBox").classList.add("showMessage");
        
        if (!document.getElementById("closeHeartBtn")) {
            const closeBtn = document.createElement("button");
            closeBtn.id = "closeHeartBtn";
            closeBtn.innerHTML = "Close 💕";
            
            closeBtn.addEventListener("click", () => {
                closeBtn.classList.add("fade-out");
                
                setTimeout(() => {
                    document.getElementById("messageBox").classList.remove("showMessage");
                    
                    setTimeout(() => {
                        hideMessageBox();
                        proceedBtn.classList.remove("hide");
                        closeBtn.remove();
                        
                        showHeartAgain = true;
                        isTransitioning = false;

                        startSlideshow();

                        
                    }, 300);
                }, 400);
            });
            
            document.getElementById("messageBox").appendChild(closeBtn);
        }
    }, 400);
});

// ===== SLIDESHOW LOGIC =====
const slideshow = document.getElementById("slideshow");
const slides = document.querySelectorAll(".slide");
const nextBtn = document.getElementById("nextSlide");
const prevBtn = document.getElementById("prevSlide");
const exitBtn = document.getElementById("exitSlideshow");

let currentSlide = 0;
let slideInterval;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    slides[index].classList.add("active");
}

function nextSlide() {
    currentSlide++;

    if (currentSlide >= slides.length) {
        endSlideshow();
        return;
    }

    showSlide(currentSlide);
}

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove("active"));
    slides[index].classList.add("active");
}

function nextSlide() {
    currentSlide++;

    if (currentSlide >= slides.length) {
        endSlideshow();
        return;
    }

    showSlide(currentSlide);
}

/* ADD IT HERE */
function endSlideshow() {
    clearInterval(slideInterval);

    setTimeout(() => {
        slideshow.classList.remove("show");

        currentSlide = 0;
        showSlide(currentSlide);

        setTimeout(() => {
            showHeartAgain = true;
        }, 800);

    }, 2000); // holds last image
}

function startSlideshow() {
    slideshow.classList.add("show");
    slideInterval = setInterval(nextSlide, 4000);
}


function endSlideshow() {
    clearInterval(slideInterval);

    // Fade slideshow out
    slideshow.classList.remove("show");

    // Reset slides
    currentSlide = 0;
    showSlide(currentSlide);

    // Trigger your heart animation reset
    setTimeout(() => {
        showHeartAgain = true;
    }, 800); // matches fade duration
}


function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

function startSlideshow() {
    slideshow.classList.add("show");
    slideInterval = setInterval(nextSlide, 4000);
}

function stopSlideshow() {
    clearInterval(slideInterval);

    // Hide slideshow
    slideshow.classList.remove("show");

    // Reset slideshow to first image
    currentSlide = 0;
    showSlide(currentSlide);

    // Tell your animation engine to restart properly
    showHeartAgain = true;
}
