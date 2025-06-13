export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}