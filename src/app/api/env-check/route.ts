import { NextResponse } from "next/server";

export async function GET() {
  const missingEnvVars: string[] = [];

  // Required environment variables
  const requiredEnvVars = [
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
    "CLERK_JWT_ISSUER_DOMAIN",
    "CONVEX_DEPLOYMENT",
    "NEXT_PUBLIC_CONVEX_URL",
    "FIRECRAWL_API_KEY",
    "SENTRY_AUTH_TOKEN",
    "CONVEX_INTERNAL_KEY",
  ];

  // Check each required env var
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  }

  // Check for at least one AI API key
  const hasGoogleKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;

  if (!hasGoogleKey && !hasOpenAIKey && !hasAnthropicKey) {
    missingEnvVars.push("GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY or ANTHROPIC_API_KEY");
  }

  return NextResponse.json({
    missingEnvVars,
    hasAllRequired: missingEnvVars.length === 0,
  });
}

