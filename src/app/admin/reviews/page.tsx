import { getAllReviews } from "@/lib/actions/reviews";
import { ReviewsClient } from "./reviews-client";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();
  return <ReviewsClient reviews={reviews} />;
}
