import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-2">One platform. One price.</h1>
      <p className="text-xl text-center text-muted-foreground mb-8">Empower yourself and your AI.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>Public repositories only.</p>
            <ul className="list-disc list-inside">
              <li>Web Dashboard</li>
              <li>Basic MCP Server Features</li>
            </ul>
            <Button>Get Started for Free</Button>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>$15/mo for private repositories.</p>
            <ul className="list-disc list-inside">
              <li>Unlimited Private Repo Analysis</li>
              <li>Unlimited AI Context</li>
              <li>Team Management</li>
            </ul>
            <Button>Start Pro Trial</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>Custom pricing for organizations.</p>
            <ul className="list-disc list-inside">
              <li>Organization-wide Access</li>
              <li>SSO</li>
              <li>Advanced Analytics</li>
              <li>Dedicated Support</li>
            </ul>
            <Button variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}