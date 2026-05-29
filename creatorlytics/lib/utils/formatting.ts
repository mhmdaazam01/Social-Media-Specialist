export function formatDate(date: string): string {
  if (!date) return '';
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatMonth(month: string): string {
  if (!month) return '';
  const [y, m] = month.split('-');
  const d = new Date(parseInt(y), parseInt(m) - 1);
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

export function formatShortMonth(month: string): string {
  if (!month) return '';
  const [y, m] = month.split('-');
  const d = new Date(parseInt(y), parseInt(m) - 1);
  return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

export function getMonthName(m: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return months[m - 1] || '';
}

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function currentMonth(): number {
  return new Date().getMonth() + 1;
}

export function currentYear(): number {
  return new Date().getFullYear();
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}
