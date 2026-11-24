/** Route groups retain existing URLs; only these read-only destinations are public. */
export function isPublicAccountPath(path: string) {
  return ['/hospitals', '/doctors', '/medicine-library'].some(prefix => path === prefix || path.startsWith(prefix + '/')) || path === '/emergency' || path === '/blood-banks' || path === '/meditation-video' || path === '/wellness-collections' || path === '/yoga-meditation' || path === '/yoga' || path === '/guided-meditation' || path === '/articles' || path.startsWith('/articles/') || path.startsWith('/care/');
}
