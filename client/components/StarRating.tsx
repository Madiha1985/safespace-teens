"use client";

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
};

export default function StarRating({
  value,
  onChange,
  readOnly = false,
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`text-2xl ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          } ${readOnly ? "cursor-default" : "hover:scale-110"} transition`}
          aria-label={`Rate ${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
