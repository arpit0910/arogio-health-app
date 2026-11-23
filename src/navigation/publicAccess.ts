/** Route groups retain existing URLs; only these read-only destinations are public. */
export function isPublicAccountPath(path: string) {
  return ['/hospitals', '/doctors', '/medicine-library'].some(prefix => path === prefix || path.startsWith(prefix + '/')) || path === '/emergency' || path === '/blood-banks' || path === '/meditation-video' || path === '/articles' || path.startsWith('/articles/') || path.startsWith('/care/');
}
