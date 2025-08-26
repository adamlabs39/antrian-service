export function getDay(dateString) {
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const dayIndex = new Date(dateString).getDay();
  return dayNames[dayIndex];
}
