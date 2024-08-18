import React, { useEffect, useRef } from "react";

function TestOscillator() {
    
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const gainRef = useRef(null);

  // Constants
  const BASE_FREQUENCY = 16.35; // Frequency of C0
  const HALF_STEP = Math.pow(2, 1/12); // 12th root of 2 (i.e 1.05946)
  const TOTAL_KEYS = 36; // Number of keys 

  // Generate frequencies
  const frequencies = [];
  for (let i = 0; i < TOTAL_KEYS; i++) {
    // F(n) = f(0) * 2 ^ n/12
    // Where n is how far the current frequency from the original frequency
    const frequency = BASE_FREQUENCY * Math.pow(HALF_STEP, i); 
    frequencies.push(parseFloat((frequency).toFixed(2)));
  }

  console.log(frequencies, frequencies.length);




  

  useEffect(() => {
    // Create web audio API context
    const audioCtx = new window.AudioContext();
    audioCtxRef.current = audioCtx;

    // Create Oscillator node
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "sine";

    // Create Gain node
    const gain = audioCtx.createGain();
    gain.gain.value = 0;

    // 440 frequency == music note 'A4'
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    // Store references
    oscillatorRef.current = oscillator;
    gainRef.current = gain;
  }, []);



  // Function to handle starting the oscillator with an envelope
  const handleStart = async () => {
    const audioCtx = audioCtxRef.current;
    const oscillator = oscillatorRef.current;
    const gain = gainRef.current;

    // Resume the audio context
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }

    // Define ADSR parameters
    const attackTime = 0.2;
    const decayTime = 0.3;
    const sustainLevel = 0.7;

    // Get the current time
    const now = audioCtx.currentTime;

    // Apply the ADSR envelope
    // gain.gain.cancelScheduledValues(now);

    gain.gain.setValueAtTime(0, now);

    //---> Attack
    //Will increase the volume from 0 to 1 in now + attackTime seconds
    gain.gain.linearRampToValueAtTime(1, now + attackTime);

    //---> Decay to Sustain Level
    // Will decrease the volume from 1 to the sustain level over the decay time
    gain.gain.linearRampToValueAtTime(
      sustainLevel,
      now + attackTime + decayTime
    );

    /* The sustain phase is implicit
       the gain remains at sustainLevel until release is triggered*/

    // Start the oscillator if not already started
    if (oscillator.start) {
      oscillator.start = oscillator.start.bind(oscillator);
      oscillator.start();
    }
  };

  // Function to handle stopping the oscillator with an envelope
  const handleStop = () => {
    const audioCtx = audioCtxRef.current;
    const gain = gainRef.current;
    const oscillator = oscillatorRef.current;

    // Define release time
    const releaseTime = 0.5;

    // Get the current time
    const now = audioCtx.currentTime;

    // Apply the release
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + releaseTime);

    // Stop the oscillator after the release time
    setTimeout(() => {
      if (oscillator.stop) {
        oscillator.stop();
      }
    }, releaseTime * 1000);
  };

  return (
    <>
      <button onClick={handleStart}>Start Oscillator</button>
      <button onClick={handleStop}>Stop Oscillator</button>
    </>
  );
}

export default TestOscillator;
