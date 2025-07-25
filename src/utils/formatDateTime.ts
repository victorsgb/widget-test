export const formatDateTime = (input: number) => {
  const date = new Date(input);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const timeString = date.toLocaleTimeString(['en-US'], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (messageDate.getTime() === today.getTime()) {
    return { date: 'Today', time: timeString };
  } else if (messageDate.getTime() === today.getTime() - 86400000) {
    return { date: 'Yesterday', time: timeString };
  } else {
    return {
      date: date.toLocaleDateString(['en-US'], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      }),
      time: timeString,
    };
  }
};
