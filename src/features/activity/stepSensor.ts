export async function phoneSensorState(_request = false) { return { available: false, granted: false }; }
export async function watchPhoneSteps(_callback: (steps: number) => void): Promise<{ remove: () => void }> { return { remove() {} }; }
