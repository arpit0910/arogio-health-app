import { env } from '../../config/env';
import { tokenStore } from '../auth/tokenStore';
import { HttpClient } from './httpClient';

export const apiClient = new HttpClient(
  env.apiUrl,
  async () => (await tokenStore.get())?.accessToken ?? null,
);
