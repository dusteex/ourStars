export function formatDate(dateString: string): string {
  if(!dateString) return ""
  // Разделяем строку на части
  const [day, month, year] = dateString.split('.').map(Number);

  // Массив названий месяцев
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  // Убираем ведущий ноль у дня
  const dayWithoutZero = day.toString().replace(/^0/, '');

  // Формируем строку
  return `${dayWithoutZero} ${months[month - 1]} ${year}`;
}