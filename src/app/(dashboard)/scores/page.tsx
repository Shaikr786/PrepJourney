import { redirect } from "next/navigation";

/** Score points metric now opens the weekly ranking list */
export default function ScoresPage() {
  redirect("/leaderboard");
}
