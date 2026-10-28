import { goals } from "./model";
export const accountGoals = [
  {
    value: "lose_weight",
    title: "Lose weight",
    subtitle: "Get fitter and healthier",
    icon: "fitness",
  },
  {
    value: "gain_weight",
    title: "Gain weight",
    subtitle: "Build muscle and strength",
    icon: "height",
  },
  {
    value: "stay_fit",
    title: "Stay fit",
    subtitle: "Maintain overall health",
    icon: "activity",
  },
  {
    value: "manage_condition",
    title: "Manage a health condition",
    subtitle: "Support my existing condition",
    icon: "shield",
  },
  ...goals,
];

// Use the same choices in setup and editing; preserve older saved goal values.
export const primaryGoals = accountGoals.filter(goal =>
  goal.value === 'manage_condition' || goals.some(option => option.value === goal.value),
);
