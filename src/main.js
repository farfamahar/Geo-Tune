      // Create a new AudioContext object
      const audioContext = new AudioContext();

      // Get all drum buttons
      const drumButtons = document.querySelectorAll(".drum-button");

      // Get the coordinates element
      const coordinates = document.getElementById("coordinates");
      const note = document.getElementById("note");
      // Initialize loop state
      let loop = false;
      let isPlaying = false;
      let index = 0;

      // Function to play a single note
      const playNote = (digit) => {
        // Create a new OscillatorNode object
        const oscillator = audioContext.createOscillator();

        // Generate a frequency based on the digit value
        const frequency = 200 + digit * 100;

        // Set the oscillator frequency to the calculated frequency
        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime
        );

        // Set the oscillator type to a random waveform (sine, square, sawtooth, or triangle)
        const waveform = ["sine"][Math.floor(Math.random() * 1)];
        oscillator.type = waveform;

        // Add an envelope to the sound to shape its amplitude over time
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.8,
          audioContext.currentTime + 0.05
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.1,
          audioContext.currentTime + 0.2
        );
        gainNode.connect(audioContext.destination);
        oscillator.connect(gainNode);

        // Start the oscillator
        oscillator.start();

        // Stop the oscillator and disconnect nodes after 1 second
        setTimeout(() => {
          oscillator.stop();
          oscillator.disconnect();
          gainNode.disconnect();
        }, 500);
      };

// Function to play a melody based on an array of digits
const playMelody = (digits) => {
    index = 0;
  
    // Loop through each digit and play a note based on its value
    const playNextNote = () => {
      const digit = digits[index];
      note.textContent = `${digit}`;
      playNote(digit);
  
      index++;
  
      // If looping, reset the index to 0 when it reaches the end
      if (loop && index >= digits.length) {
        index = 0;
      }
  
      // If not at the end of the melody, schedule the next note to play
      if (index < digits.length || loop) {
        setTimeout(playNextNote, 200);
      } else {
        // Reset playing state when melody is finished
        isPlaying = false;
      }
    };
  
    // Start playing the melody
    isPlaying = true;
    playNextNote();
  };

// Event listener for drum buttons
drumButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Get user's current position and display coordinates
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          coordinates.textContent = `Latitude : ${latitude.toFixed(
            8
          )}, Longitude: ${longitude.toFixed(8)}`;
          // Play a melody based on the latitude and longitude digits
          const latitudeDigits = String(latitude.toFixed(8)).match(/\d/g);
          const longitudeDigits = String(longitude.toFixed(8)).match(/\d/g);
          const digits = [...latitudeDigits, ...longitudeDigits];
          playMelody(digits);
        });
      } else {
        // Geolocation is not supported
        alert("Geolocation is not supported by this browser.");
      }
    });
  });

// Event listener for loop button
const loopToggle = document.getElementById("loop-toggle");
loopToggle.addEventListener("click", () => {
  // Toggle loop state
  loop = !loop;
  loopToggle.textContent = loop ? "Looping On" : "Looping Off";

  // If melody is already playing, reset it to play from the beginning
  if (isPlaying) {
    index = 0;
  }
});
