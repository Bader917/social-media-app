function formatDate(dateString) {
  return new Date(dateString).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimeAgo(createdAt) {
  return <span>{formatDate(createdAt)}</span>;
}