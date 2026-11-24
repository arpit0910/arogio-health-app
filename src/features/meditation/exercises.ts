export type Exercise = {
  section?: string;
  publishedVersion?: number;
  id: string;
  title: string;
  description: string;
  preparation: string;
  steps: { title: string; instruction: string; seconds: number }[];
  repeat?: number;
};

export const yogaExercises = [
  {
    id: 'yoga-chair', section: 'yoga', title: 'Seated yoga reset',
    description: 'A chair-based practice with small, unhurried movements.',
    preparation: 'Sit on a sturdy chair with both feet on the floor. Keep the movements small and comfortable, and skip any step you prefer.',
    steps: [
      { title: 'Settle in', instruction: 'Rest your hands on your thighs and notice the support of the chair.', seconds: 30 },
      { title: 'Soften your shoulders', instruction: 'Gently lift your shoulders, then let them settle. Repeat at your own pace or stay still.', seconds: 45 },
      { title: 'Reach and return', instruction: 'Reach one hand forward within a comfortable range, then bring it back. Try the other side if you like.', seconds: 45 },
      { title: 'Rest here', instruction: 'Bring both hands back to your thighs and let your breathing settle naturally.', seconds: 30 },
    ],
  },
  {
    id: 'yoga-evening', section: 'yoga', title: 'Gentle evening yoga',
    description: 'Seated stretches followed by a quiet pause.',
    preparation: 'Sit comfortably with both feet supported. Move only as far as feels easy, and breathe naturally throughout.',
    steps: [
      { title: 'Find your seat', instruction: 'Sit upright without stiffening. Rest your hands loosely on your thighs.', seconds: 30 },
      { title: 'Open and close your hands', instruction: 'Slowly spread your fingers and relax them. Let your shoulders stay easy.', seconds: 45 },
      { title: 'Lengthen gently', instruction: 'Imagine the crown of your head lifting slightly. Relax and return to your usual posture.', seconds: 45 },
      { title: 'Finish with stillness', instruction: 'Stay seated and notice your natural breathing for a moment.', seconds: 60 },
    ],
  },
] satisfies Exercise[];

export const exercises: Exercise[] = [
  {
    id: 'breathing', title: 'Gentle breathing',
    description: '2 minutes · Follow an easy breathing rhythm',
    preparation: 'Sit with your back supported. Use the count only if it feels comfortable; keep your breath gentle and do not hold it.',
    repeat: 15,
    steps: [
      { title: 'Breathe in', instruction: 'Breathe in gently through your nose. Let your belly move naturally.', seconds: 4 },
      { title: 'Breathe out', instruction: 'Let your breath flow out gently through your mouth. Do not force it.', seconds: 4 },
    ],
  },
  {
    id: 'awareness', title: 'Breath awareness',
    description: '3 minutes · Notice your natural breath',
    preparation: 'Sit comfortably with your eyes open or softly closed. There is no need to change your breathing.',
    steps: [
      { title: 'Settle in', instruction: 'Feel the support of the chair and the contact of your feet with the floor.', seconds: 30 },
      { title: 'Notice your breath', instruction: 'Notice where you feel each natural breath: your nose, chest or belly.', seconds: 60 },
      { title: 'Return gently', instruction: 'When your mind wanders, notice it without judging and return to the next breath.', seconds: 60 },
      { title: 'Take your time', instruction: 'Notice the room around you. Move your hands and feet when you are ready.', seconds: 30 },
    ],
  },
  {
    id: 'body', title: 'Body scan',
    description: '5 minutes · Explore how your body feels',
    preparation: 'Sit or lie somewhere supported. Notice sensations without trying to change them. Skip any area you prefer.',
    steps: [
      { title: 'Arrive', instruction: 'Feel the surface beneath you. Let your breathing find its own rhythm.', seconds: 30 },
      { title: 'Feet and legs', instruction: 'Notice your toes, feet and legs. You may feel warmth, pressure or very little at all.', seconds: 60 },
      { title: 'Belly and back', instruction: 'Bring attention to your belly and back. Notice contact and the movement of breathing.', seconds: 60 },
      { title: 'Hands and shoulders', instruction: 'Notice your fingers, arms and shoulders. Let them rest in a comfortable position.', seconds: 60 },
      { title: 'Face and jaw', instruction: 'Notice your forehead, eyes and jaw. Allow space for whatever you feel.', seconds: 60 },
      { title: 'Return to the room', instruction: 'Feel your whole body supported. Look around and move gently when ready.', seconds: 30 },
    ],
  },
  {
    id: 'grounding', title: 'Sense your surroundings',
    description: '2 minutes · Bring attention to the present',
    preparation: 'Keep your eyes open in a comfortable, safe place. Use whichever senses are available to you.',
    steps: [
      { title: 'Look around', instruction: 'Notice a few things you can see. Explore their colours, shapes and textures.', seconds: 30 },
      { title: 'Feel support', instruction: 'Notice your feet on the floor or your hands resting on a surface.', seconds: 30 },
      { title: 'Listen', instruction: 'Notice nearby or distant sounds. If listening is not comfortable, look at an object instead.', seconds: 30 },
      { title: 'Come back', instruction: 'Notice one detail around you, take a natural breath and choose what to do next.', seconds: 30 },
    ],
  },
  {
    id: 'wind-down', section: 'meditation', title: 'Evening wind-down',
    description: '5 minutes · Ease into a quieter evening',
    preparation: 'Sit or lie somewhere comfortable. Let your eyes stay open or softly closed. There is no need to fall asleep.',
    steps: [
      { title: 'Settle into support', instruction: 'Notice where your body meets the bed or chair. Adjust anything that feels uncomfortable.', seconds: 60 },
      { title: 'Let the day rest', instruction: 'Notice a thought about today. You do not need to solve it now. Let your attention return to the support beneath you.', seconds: 60 },
      { title: 'Soften your hands', instruction: 'Let your fingers rest. Notice your jaw and shoulders, and allow them to find a comfortable position.', seconds: 60 },
      { title: 'Follow a natural breath', instruction: 'Notice your breathing as it is. Let each breath arrive and leave without a count.', seconds: 90 },
      { title: 'Stay or return', instruction: 'Take a moment to notice how you feel. Rest here or move gently when you are ready.', seconds: 30 },
    ],
  },
  {
    id: 'one-minute-pause', title: 'One-minute pause',
    description: 'Notice one breath and come back to the room.',
    preparation: 'Sit or stand somewhere you can pause safely. Let your breathing stay natural.',
    steps: [
      { title: 'Feel your feet', instruction: 'Notice where your feet meet the floor. Let your hands rest.', seconds: 20 },
      { title: 'Follow one breath', instruction: 'Notice one breath coming in and going out without changing it.', seconds: 20 },
      { title: 'Look around', instruction: 'Let your attention return to the room and choose what to do next.', seconds: 20 },
    ],
  },
  {
    id: 'sound-focus', title: 'Focus with sound',
    description: 'Bring your attention back to the sounds around you.',
    preparation: 'Sit somewhere comfortable. If sound is distracting or hard to hear, use a visual detail instead.',
    steps: [
      { title: 'Settle in', instruction: 'Notice how the chair or floor supports you.', seconds: 30 },
      { title: 'Notice a sound', instruction: 'Pick one sound nearby. Notice it without needing to name it.', seconds: 45 },
      { title: 'Return gently', instruction: 'When your attention wanders, return to the sound or visual detail you chose.', seconds: 45 },
    ],
  },
  {
    id: 'kindness-pause', title: 'Pause with kindness',
    description: 'Take a few minutes to speak to yourself with care.',
    preparation: 'Choose a comfortable seat. Use your own words if the suggested phrase does not fit.',
    steps: [
      { title: 'Settle in', instruction: 'Let your hands rest and notice one natural breath.', seconds: 30 },
      { title: 'Offer a kind phrase', instruction: 'Try saying quietly to yourself: I can take this one moment at a time.', seconds: 60 },
      { title: 'Make room for a pause', instruction: 'Let the phrase go. Notice how you are sitting before you return to your day.', seconds: 60 },
    ],
  },
  {
    id: 'release-the-day', title: 'Release the day',
    description: 'Close the evening with a quiet, seated reflection.',
    preparation: 'Sit somewhere comfortable. Let your eyes stay open or softly closed.',
    steps: [
      { title: 'Notice your surroundings', instruction: 'Pick one detail in the room and let your attention settle there.', seconds: 30 },
      { title: 'Recall one moment', instruction: 'Think of one ordinary moment from today. You can also stay with your breath.', seconds: 60 },
      { title: 'Let the moment pass', instruction: 'Let the memory go and notice where your body is supported.', seconds: 60 },
      { title: 'Rest here', instruction: 'Take your time. When you are ready, move gently and continue your evening.', seconds: 30 },
    ],
  },
];

export function exerciseDuration(exercise: Exercise) {
  return exercise.steps.reduce((total, step) => total + step.seconds, 0) * (exercise.repeat ?? 1);
}

export function exercisePosition(exercise: Exercise, elapsed: number) {
  const duration = exerciseDuration(exercise);
  const time = Math.max(0, Math.min(elapsed, duration));
  if (time >= duration) return null;
  const cycle = exercise.steps.reduce((total, step) => total + step.seconds, 0);
  let offset = time % cycle;
  for (const step of exercise.steps) {
    if (offset < step.seconds) return { step, remaining: Math.ceil(step.seconds - offset) };
    offset -= step.seconds;
  }
  return null;
}

export function clockTime(seconds: number) {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}
