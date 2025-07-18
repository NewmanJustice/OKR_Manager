import UserObjectivesClientWrapper from "./user/UserObjectivesClientWrapper";

export default function Home() {
  // Render the objectives dashboard for the logged-in user at root
  return <UserObjectivesClientWrapper />;
}
