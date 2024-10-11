const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas width and height to match the window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load the background and floor images
const backgroundImage = new Image();
backgroundImage.src = 'background.png'; // Background image path

const floorImage = new Image();
floorImage.src = 'floor.png'; // Floor image path

// Load pipe images
const topPipeImage = new Image();
topPipeImage.src = 'toppipe.png'; // Top pipe image path

const bottomPipeImage = new Image();
bottomPipeImage.src = 'bottompipe.png'; // Bottom pipe image path

// Load the title image
const titleImage = new Image();
titleImage.src = 'title.png'; // Title image path

// Bird images for selection
const birdImages = ['1.png', '2.png', '3.png'].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

// Unlock status of birds
const unlockedBirds = [true, true, false]; // Only the first two birds are unlocked
let selectedBirdIndex = 0; // Default bird is the first one (1.png)
let isGameOver = false;
let isPreGame = true; // Pre-game state flag

let bird = {
    x: canvas.width / 2 - 20, // Center the bird horizontally
    y: canvas.height / 2, // Center the bird vertically
    width: 37,
    height: 27,
    gravity: 0.6, // Adjusted gravity for smoother fall
    lift: -8, // Increased lift for better jump
    velocity: 0,
    show() {
        ctx.drawImage(birdImages[selectedBirdIndex], this.x, this.y, this.width, this.height); // Draw the selected bird

        // Display locked indicator for locked birds
        if (!unlockedBirds[selectedBirdIndex]) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Red semi-transparent color
            ctx.fillRect(this.x, this.y, this.width, this.height); // Draw rectangle over bird
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Locked', this.x + this.width / 2, this.y + this.height + 20); // Draw "Locked" text
        }
    },
    update() {
        if (!isPreGame) {
            this.velocity += this.gravity; // Apply gravity
            this.y += this.velocity; // Move the bird by its velocity

            // Prevent bird from going off the bottom of the canvas
            if (this.y + this.height >= canvas.height - floorImage.height) {
                this.y = canvas.height - floorImage.height - this.height; // Reset position on floor
                this.velocity = 0; // Stop downward motion
                isGameOver = true; // Trigger game over if hits the floor
            }
        } else {
            // Bird floats up and down in pre-game state
            this.y = (canvas.height / 2) + Math.sin(frame / 10) * 10; // Simple floating effect
        }

        // Ensure bird does not go off the top of the canvas
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    flap() {
        this.velocity = this.lift; // Set velocity to lift value
    }
};

let pipes = [];
let frame = 0;
const pipeWidth = 70;
const pipeGap = 150; // Increased pipe gap
let floorX = 0; // Floor x position for moving effect
let backgroundX = 0; // Background x position for moving effect

function addPipe() {
    const topHeight = Math.random() * (canvas.height - pipeGap - 80) + 20; // Random height for top pipe
    const bottomHeight = canvas.height - topHeight - pipeGap;

    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: bottomHeight,
    });
}

function drawPipes() {
    for (let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        // Draw top pipe
        ctx.drawImage(topPipeImage, pipe.x, 0, pipeWidth, pipe.top);
        // Draw bottom pipe
        ctx.drawImage(bottomPipeImage, pipe.x, canvas.height - pipe.bottom, pipeWidth, pipe.bottom);
    }
}

function updatePipes() {
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= 3; // Increase speed of pipes

        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1); // Remove pipe if it's off screen
        }
    }
}

function resetGame() {
    pipes = [];
    bird.y = canvas.height / 2; // Reset bird position to center
    bird.velocity = 0; // Reset velocity
    isGameOver = false;
    isPreGame = true; // Reset to pre-game state
    floorX = 0; // Reset floor position
    backgroundX = 0; // Reset background position
}

function displayGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '20px Arial';
    ctx.fillText('Double-tap to restart', canvas.width / 2, canvas.height / 2 + 20);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the moving background
    ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    // Move the background to the left
    backgroundX -= 0.5;
    if (backgroundX <= -canvas.width) {
        backgroundX = 0; // Reset background position when it goes off screen
    }

    if (!isGameOver) {
        bird.update();
        bird.show();

        if (!isPreGame) {
            if (frame % 90 === 0) { // Adjusted pipe generation timing for better pacing
                addPipe();
            }
            drawPipes();
            updatePipes();
        }

        // Draw the moving floor at the bottom
        ctx.drawImage(floorImage, floorX, canvas.height - floorImage.height, canvas.width, floorImage.height);
        ctx.drawImage(floorImage, floorX + canvas.width, canvas.height - floorImage.height, canvas.width, floorImage.height);

        // Move the floor to the left
        floorX -= 0.6;
        if (floorX <= -canvas.width) {
            floorX = 0; // Reset floor position when it goes off screen
        }

        if (isPreGame) {
            // Draw the title image at the top center
            const titleWidth = 300; // Adjust the width as needed
            const titleHeight = 100; // Adjust the height as needed
            ctx.drawImage(titleImage, canvas.width / 2 - titleWidth / 2, 50, titleWidth, titleHeight); // Center the title at the top

            // Display bird selection instructions
            ctx.fillStyle = 'white';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Swipe to select your bird', canvas.width / 2, canvas.height / 2 - 100);
        }
    } else {
        displayGameOver(); // Show game over screen
    }

    frame++;
    requestAnimationFrame(gameLoop);
}

// Swipe detection for bird selection
let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
    if (isPreGame) {
        touchStartX = e.touches[0].clientX;
    } else {
        bird.flap();
    }
});

// Track touch movements for bird selection
canvas.addEventListener('touchmove', (e) => {
    if (isPreGame) {
        const touchEndX = e.touches[0].clientX;
        if (touchEndX < touchStartX - 50) {
            // Swipe left
            if (selectedBirdIndex > 0) {
                selectedBirdIndex--; // Move to the previous bird
            }
            touchStartX = touchEndX; // Update touch start position
        } else if (touchEndX > touchStartX + 50) {
            // Swipe right
            if (selectedBirdIndex < birdImages.length - 1) {
                selectedBirdIndex++; // Move to the next bird
            }
            touchStartX = touchEndX; // Update touch start position
        }
    }
});

// Double-tap to start the game
let lastTapTime = 0;
canvas.addEventListener('touchend', (e) => {
    if (isPreGame) {
        const currentTime = new Date().getTime();
        if (currentTime - lastTapTime < 300) {
            isPreGame = false; // Start the game
        }
        lastTapTime = currentTime;
    } else if (isGameOver) {
        resetGame(); // Reset game
    } else {
        bird.flap(); // Flap when the game is ongoing
    }
});

// Handle keydown event for starting the game
document.addEventListener('keydown', () => {
    if (isPreGame) {
        isPreGame = false; // Start the game
    } else if (isGameOver) {
        resetGame(); // Reset game
    } else {
        bird.flap(); // Flap when the game is ongoing
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start the game loop once the images have loaded
let imagesLoaded = 0;
const totalImages = birdImages.length + 5; // Updated total images count

backgroundImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};

floorImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};

topPipeImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};

bottomPipeImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};

titleImage.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop();
    }
};

birdImages.forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            gameLoop();
        }
    };
});

// Start the game loop
requestAnimationFrame(gameLoop); // Start the game loop