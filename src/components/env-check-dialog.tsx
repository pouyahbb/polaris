"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertCircle, Shield, XCircle } from "lucide-react";

const GITHUB_REPO_URL = "https://github.com/pouyahbb/polaris";

export function EnvCheckDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([]);

  useEffect(() => {
    const checkEnvVars = async () => {
      try {
        // Check server-side env vars via API (includes all required env vars)
        const response = await fetch("/api/env-check");
        const data = await response.json();

        if (data.missingEnvVars && data.missingEnvVars.length > 0) {
          setMissingEnvVars(data.missingEnvVars);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error checking environment variables:", error);
      }
    };

    checkEnvVars();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="size-5 text-destructive" />
            Missing Environment Variables
          </DialogTitle>
          <DialogDescription>
            Some important environment variables need to be configured for the application to work properly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          {/* Security Notice */}
          <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg">
            <Shield className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                Security Notice
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                For security reasons, the creator's personal environment variables are not included in this repository. 
                You need to set up your own API keys and credentials to run the application.
              </p>
            </div>
          </div>

          {/* Missing Variables List */}
          <div>
            <p className="text-sm font-medium mb-3">
              Please add the following environment variables to your{" "}
              <code className="px-2 py-1 bg-muted rounded text-xs font-mono">.env.local</code> file:
            </p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {missingEnvVars.map((envVar, index) => (
                <div
                  key={envVar}
                  className="flex items-center gap-3 p-3 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 dark:border-destructive/30 rounded-lg hover:bg-destructive/10 dark:hover:bg-destructive/20 transition-colors"
                >
                  <div className="flex items-center justify-center size-6 rounded-full bg-destructive/10 dark:bg-destructive/20 shrink-0">
                    <XCircle className="size-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <code className="text-sm font-mono text-destructive break-all">
                      {envVar}
                    </code>
                  </div>
                  <div className="shrink-0">
                    <span className="text-xs font-medium text-destructive/70">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GitHub Instructions */}
          <div className="p-4 bg-muted/50 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-3">
              You can clone the project from GitHub and run it on your local system. 
              The complete setup and running instructions are available in the README section on GitHub.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open(GITHUB_REPO_URL, "_blank")}
              className="w-full"
            >
              <ExternalLink className="size-4" />
              View Setup Instructions on GitHub
            </Button>
          </div>
        </div>

        <DialogFooter>
          <p className="text-xs text-muted-foreground">
            Configure the required environment variables to continue using the application.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

