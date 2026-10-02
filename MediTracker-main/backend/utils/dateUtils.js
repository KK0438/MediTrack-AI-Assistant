export function isWithinNextMinutes(targetTime, minutesAhead = 5) {
    const now = new Date();
    const future = new Date(now.getTime() + minutesAhead * 60000);
    return targetTime >= now && targetTime <= future;
}

export function formatTime(dateObj) {
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function toDate(input) {
    if (input instanceof Date) return input;
    return new Date(input);
}