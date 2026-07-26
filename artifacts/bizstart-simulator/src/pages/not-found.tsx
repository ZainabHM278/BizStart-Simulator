import { useRoute } from "wouter";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex w-full items-center justify-center min-h-[50vh]">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive items-center">
            <AlertCircle className="h-8 w-8" />
            <h1 className="text-2xl font-display font-bold">404 Page Not Found</h1>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}