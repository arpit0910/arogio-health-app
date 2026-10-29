"""Generate Arogio's original, short water-drop notification cue (no sampled audio)."""
import math
import random
import struct
import wave
from pathlib import Path

rate = 44100
samples = [0.0] * int(rate * 0.85)
rng = random.Random(42)
for start, pitch, volume in [(0.035, 780, 0.9), (0.23, 1120, 0.48)]:
    phase = 0.0
    noise = 0.0
    for i in range(int(rate * 0.36)):
        t = i / rate
        # A shrinking resonant bubble: rising pitch, quick wet attack, soft tail.
        frequency = pitch * (1 + 0.65 * (1 - math.exp(-t / 0.022)))
        phase += 2 * math.pi * frequency / rate
        envelope = (1 - math.exp(-t / 0.0018)) * math.exp(-t / 0.048)
        noise = 0.58 * noise + 0.42 * rng.uniform(-1, 1)
        value = volume * envelope * (math.sin(phase) + 0.19 * math.sin(2.7 * phase) * math.exp(-t / 0.016))
        value += volume * noise * 0.16 * math.exp(-t / 0.009)
        index = int(start * rate) + i
        if index < len(samples):
            samples[index] += value
peak = max(abs(value) for value in samples)
pcm = b''.join(struct.pack('<h', round(value / peak * 0.78 * 32767)) for value in samples)
output = Path(__file__).resolve().parents[1] / 'assets/sounds/water_drop.wav'
output.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(output), 'wb') as sound:
    sound.setnchannels(1)
    sound.setsampwidth(2)
    sound.setframerate(rate)
    sound.writeframes(pcm)
print(f'Created {output.name}: {len(samples)/rate:.2f}s, mono PCM16, {rate} Hz')
