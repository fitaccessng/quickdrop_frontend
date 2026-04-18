export const ReviewList = ({ reviews }) => (
  <div className="grid gap-4">
    {reviews.length ? (
      reviews.map((review) => (
        <div key={review.id} className="rounded-2xl bg-white/[0.05] p-5">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-white">{review.author_name}</p>
            <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-base-200">{review.rating}/5</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-base-300">{review.comment}</p>
        </div>
      ))
    ) : (
      <div className="rounded-2xl bg-white/[0.05] p-5 text-base-300">No reviews yet for this vendor.</div>
    )}
  </div>
);
