
export const human_time = (totalSeconds) => {
    if (totalSeconds < 1) return "0 seconds";

    // const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];
    // if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} soat`);
    if (minutes > 0) parts.push(`${minutes} minut`);
    if (seconds > 0) parts.push(`${seconds} sekund`);

    return parts.join(' ');
}