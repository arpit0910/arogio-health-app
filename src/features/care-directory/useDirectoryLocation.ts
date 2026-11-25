import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

type Position = { latitude: number; longitude: number };
type LocalArea = { position: Position; city: string };
export const NEARBY_RADIUS_KM = 50;

async function withDeadline<T>(work: Promise<T>, ms: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([work, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Location timed out')), ms);
    })]);
  } finally { clearTimeout(timer); }
}

let lastArea: { area: LocalArea; readAt: number } | undefined;
let lookup: Promise<LocalArea | null> | undefined;
let prompted = false;
let selectedCity = '';

async function findArea(request: boolean) {
  const permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted) lastArea = undefined;
  if (!permission.granted && (!request || !permission.canAskAgain)) return null;
  if (!permission.granted && !(await Location.requestForegroundPermissionsAsync()).granted) return null;
  if (!request && lastArea && Date.now() - lastArea.readAt < 5 * 60_000) return lastArea.area;
  const { coords: { latitude, longitude } } = await withDeadline(
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }), 12_000,
  );
  const position = { latitude, longitude };
  const [address] = Platform.OS === 'web' ? [] : await withDeadline(
    Location.reverseGeocodeAsync(position), 5_000,
  ).catch(() => []);
  const city = (address?.city || address?.subregion || '').trim().normalize('NFC').slice(0, 80);
  const area = { position, city };
  lastArea = { area, readAt: Date.now() };
  return area;
}

export async function detectDirectoryCity() {
  return selectedCity || (await (lookup ?? findArea(false)))?.city || '';
}

export function useDirectoryLocation(startNearby: boolean, enabled = true, initialCity = '') {
  const [savedCity] = useState(() => (initialCity || selectedCity).trim().normalize('NFC').slice(0, 80));
  const [city, setCity] = useState(savedCity);
  const [position, setPosition] = useState<Position | null>(null);
  const [locating, setLocating] = useState(enabled && (!savedCity || startNearby));
  const [locationError, setLocationError] = useState('');
  const revision = useRef(0);
  const mounted = useRef(false);

  const locate = useCallback(async (mode: 'city' | 'nearby', explicit: boolean, active: () => boolean = () => true) => {
    setLocating(true);
    setLocationError('');
    const request = ++revision.current;
    const current = () => mounted.current && active() && request === revision.current;
    try {
      const area = await (lookup ??= findArea(explicit || (!prompted && Platform.OS !== 'web'))
        .finally(() => { prompted = true; lookup = undefined; }));
      if (!current()) return;
      if (!area) {
        setPosition(null);
        setLocationError('Location access is unavailable. Enter a city or enable location in device settings.');
        return;
      }
      setPosition(mode === 'nearby' ? area.position : null);
      if (area.city) {
        selectedCity = '';
        setCity(area.city);
      }
      else if (mode === 'city') setLocationError('Could not detect your city. Enter it below.');
    } catch {
      if (current()) setLocationError('Could not get your location. Check location services or enter a city.');
    } finally {
      if (current()) setLocating(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (!enabled || (savedCity && !startNearby)) return;
    let active = true;
    const timer = setTimeout(() => void locate(startNearby ? 'nearby' : 'city', startNearby, () => active), 0);
    return () => { active = false; clearTimeout(timer); };
  }, [enabled, locate, savedCity, startNearby]);

  function selectCity(value: string) {
    revision.current++;
    selectedCity = value.trim().normalize('NFC').slice(0, 80);
    setCity(selectedCity);
    setPosition(null);
    setLocating(false);
    setLocationError('');
  }
  return { city, position, locating, locationError, selectCity, locate: (mode: 'city' | 'nearby') => locate(mode, true) };
}
