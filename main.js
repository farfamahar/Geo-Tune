      // Create a new AudioContext object
      const audioContext = new AudioContext();

      // Get all drum buttons
      const drumButtons = document.querySelectorAll(".drum-button");

      // Get the coordinates element
      const coordinates = document.getElementById("coordinates");
      const note = document.getElementById("note");
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

// Convert a geolocation position into the digits + display text used for the melody
const getPositionData = (position) => {
  const { latitude, longitude } = position.coords;
  const text = `Latitude : ${latitude.toFixed(
    8
  )}, Longitude: ${longitude.toFixed(8)}`;
  const latitudeDigits = String(latitude.toFixed(8)).match(/\d/g);
  const longitudeDigits = String(longitude.toFixed(8)).match(/\d/g);
  return { digits: [...latitudeDigits, ...longitudeDigits], text };
};

// Always holds the most recently seen location
let currentLocation = null;
let watchId = null;
let timeoutId = null;

// Keep tracking location in the background so the loop can pick up
// new coordinates as they arrive (e.g. while walking)
const startLocationWatch = () => {
  if (watchId !== null || !navigator.geolocation) return;
  watchId = navigator.geolocation.watchPosition(
    (position) => {
      currentLocation = getPositionData(position);
    },
    (error) => console.error(error),
    { enableHighAccuracy: true }
  );
};

// Function to play a melody based on a location's digits, looping forever
const playMelody = (location) => {
    index = 0;
    let activeLocation = location;
    coordinates.textContent = activeLocation.text;

    const playNextNote = () => {
      const digit = activeLocation.digits[index];
      note.textContent = `${digit}`;
      playNote(digit);

      index++;

      // Loop back to the start, picking up the latest location for this pass
      if (index >= activeLocation.digits.length) {
        index = 0;
        if (currentLocation) {
          activeLocation = currentLocation;
          coordinates.textContent = activeLocation.text;
        }
      }

      timeoutId = setTimeout(playNextNote, 200);
    };

    isPlaying = true;
    playNextNote();
  };

// Stop playback and location tracking
const stopMelody = () => {
  clearTimeout(timeoutId);
  isPlaying = false;
  note.textContent = "";
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
};

// Event listener for drum buttons (play/stop toggle)
drumButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (isPlaying) {
        stopMelody();
        return;
      }

      if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition((position) => {
        currentLocation = getPositionData(position);
        startLocationWatch();
        playMelody(currentLocation);
      });
    });
  });
