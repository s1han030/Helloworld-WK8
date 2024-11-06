const video = document.getElementById('video'); // Get the video element
const canvas = document.getElementById('canvas'); // Get the canvas element
const ctx = canvas.getContext('2d'); // Get the 2D context of the canvas
let countdown = 0; // Countdown variable

// Set the parameters for the mosaic effect
const tileSize = 25; // Size of each mosaic tile

// Initialize the webcam
async function initCamera() {
    // Request access to the webcam
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream; // Set the webcam stream as the video source

    // When the video data is loaded, set the canvas size and start rendering frames
    video.addEventListener('loadeddata', () => {
        canvas.width = video.videoWidth; // Set canvas width to video width
        canvas.height = video.videoHeight; // Set canvas height to video height
        requestAnimationFrame(renderFrame); // Start the rendering loop
    });
}

// Render the colorful mosaic effect
function renderFrame() {
    // Draw the current video frame onto the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = frame.data;

    // Process each tile in the image
    for (let y = 0; y < canvas.height; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
            // Calculate the average RGB values for each tile
            let sumR = 0, sumG = 0, sumB = 0;
            let count = 0;

            // Loop through each pixel in the tile
            for (let dy = 0; dy < tileSize; dy++) {
                for (let dx = 0; dx < tileSize; dx++) {
                    const i = ((y + dy) * canvas.width + (x + dx)) * 4;
                    sumR += data[i]; // Sum up red values
                    sumG += data[i + 1]; // Sum up green values
                    sumB += data[i + 2]; // Sum up blue values
                    count++;
                }
            }

            // Calculate the average RGB values
            const avgR = sumR / count;
            const avgG = sumG / count;
            const avgB = sumB / count;

            // Draw the colorful tile on the canvas
            ctx.fillStyle = `rgb(${avgR}, ${avgG}, ${avgB})`;
            ctx.fillRect(x, y, tileSize, tileSize);
        }
    }

    // Display the countdown if it is greater than 0
    if (countdown > 0) {
        ctx.font = "48px Arial Black"; // Set font style and size
        ctx.fillStyle = "white"; // Set text color
        ctx.textAlign = "center"; // Center the text
        ctx.fillText(countdown, canvas.width / 2, canvas.height / 2); // Draw the countdown number
    }

    // Request the next frame to keep the loop going
    requestAnimationFrame(renderFrame);
}

// Take a screenshot and download it
function takeScreenshot() {
    const link = document.createElement('a'); // Create a new link element
    link.href = canvas.toDataURL('image/png'); // Convert the canvas to a data URL
    link.download = `screenshot_${Date.now()}.png`; // Set the file name for download
    link.click(); // Simulate a click to download the image
}

// Listen for keydown events
document.addEventListener('keydown', (event) => {
    if (event.key === '1') { // If the "1" key is pressed, start the countdown
        countdown = 3; // Set countdown to 3 seconds
        const countdownInterval = setInterval(() => {
            countdown--; // Decrease the countdown value
            if (countdown === 0) {
                // When countdown reaches 0, clear the countdown and take a screenshot
                renderFrame(); // Clear the countdown number from the screen
                clearInterval(countdownInterval); // Stop the interval
                takeScreenshot(); // Capture the screenshot
            }
        }, 1000); // Decrease countdown every second
    }
});

initCamera(); // Initialize the camera
