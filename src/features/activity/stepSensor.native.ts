export async function phoneSensorState(request = false) {
  const { Pedometer } = await import('expo-sensors');
  if (!(await Pedometer.isAvailableAsync())) return { available: false, granted: false };
  const permission = request ? await Pedometer.requestPermissionsAsync() : await Pedometer.getPermissionsAsync();
  return { available: true, granted: permission.granted };
}
export async function watchPhoneSteps(callback: (steps: number) => void) {
  const { Pedometer } = await import('expo-sensors');
  return Pedometer.watchStepCount((result) => callback(result.steps));
}
