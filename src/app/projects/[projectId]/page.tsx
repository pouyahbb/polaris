import { Metadata } from "next";
import { ProjectIdView } from "@/features/projects/components/project-id-view";
import { Id } from "../../../../convex/_generated/dataModel";

type Props = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  
  return {
    title: "Project Editor",
    description: `Edit and manage your project in Polaris cloud IDE. Use AI-powered code suggestions, real-time collaboration, in-browser execution with WebContainer, and GitHub integration. Code directly in your browser with syntax highlighting for JavaScript, TypeScript, Python, HTML, CSS, and more.`,
    openGraph: {
      title: "Project Editor | Polaris",
      description: "Edit and manage your project in Polaris cloud IDE with AI-powered features, real-time collaboration, and in-browser execution.",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Project Editor | Polaris",
      description: "Edit and manage your project in Polaris cloud IDE with AI-powered features, real-time collaboration, and in-browser execution.",
    },
  };
}

const ProjectIdPage = async ({ params }: Props) => {
  const { projectId } = await params;

  return <ProjectIdView projectId={projectId as Id<"projects">} />;
};
 
export default ProjectIdPage;