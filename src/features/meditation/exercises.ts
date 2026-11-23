export type Exercise = {
  section?: string;
  id: string;
  title: string;
  description: string;
  preparation: string;
  steps: { title: string; instruction: string; seconds: number }[];
  repeat?: number;
};

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
