
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    const currentUrl = window.location.origin;
    setApiUrl(`${currentUrl}/api/github/{username}`);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-2xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">GitHub User Info API</h1>
        <div className="space-y-2">
          <p className="text-gray-600">API Endpoint:</p>
          <code className="block bg-gray-100 p-3 rounded">
            GET {apiUrl}
          </code>
        </div>
        <div className="space-y-2">
          <p className="text-gray-600">Example Usage:</p>
          <code className="block bg-gray-100 p-3 rounded">
            curl -X GET {apiUrl.replace("{username}", "octocat")}
          </code>
        </div>
      </Card>
    </div>
  );
};

export default Index;
