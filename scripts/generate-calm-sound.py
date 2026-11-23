"""Original, deterministic soft filtered-noise loop. No external recordings."""
from pathlib import Path
import math
import random
import struct
import wave

rate = 22050
rng = random.Random(20261110)
values = []
smooth = 0.0
for i in range(rate * 12):
    smooth = 0.985 * smooth + 0.015 * rng.uniform(-1, 1)
    values.append(smooth)
# Crossfade one second of the tail into the head for a continuous loop.
overlap = rate
for i in range(overlap):
    mix = i / overlap
    values[i] = values[-overlap + i] * (1 - mix) + values[i] * mix
values = values[:-overlap]
peak = max(abs(value) for value in values)
output = Path(__file__).resolve().parents[1] / 'assets/sounds/soft_noise.wav'
with wave.open(str(output), 'wb') as audio:
    audio.setnchannels(1)
    audio.setsampwidth(2)
    audio.setframerate(rate)
    audio.writeframes(b''.join(struct.pack('<h', round(value / peak * 8000)) for value in values))
print(output)
