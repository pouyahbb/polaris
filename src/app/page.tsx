import { Metadata } from "next";
import { ProjectsView } from "@/features/projects/components/projects-view";

export const metadata: Metadata = {
  title: "Projects Dashboard",
  description: "Manage your projects, create new ones with AI, or import from GitHub. Polaris provides a powerful cloud IDE experience with real-time collaboration and AI assistance.",
  openGraph: {
    title: "Projects Dashboard | Polaris",
    description: "Manage your projects, create new ones with AI, or import from GitHub. Start coding in your browser with Polaris.",
  },
  twitter: {
    title: "Projects Dashboard | Polaris",
    description: "Manage your projects, create new ones with AI, or import from GitHub. Start coding in your browser with Polaris.",
  },
};

const Home = () => {
  return <ProjectsView />
};

export default Home;
