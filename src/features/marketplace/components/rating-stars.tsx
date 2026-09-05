export function RatingStars({ rating }: { rating: number }) {
  const filledStars = Math.round(rating);

  return (
    <span aria-hidden="true" className="inline-flex gap-0.5 text-amber-500">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index}>{index < filledStars ? "★" : "☆"}</span>
      ))}
    </span>
  );
}
