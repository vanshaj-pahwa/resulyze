'use client';

import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { useState } from "react";

export default function ApiLoaderTest() {
  const [result, setResult] = useState<string>("");
  
  const testApiCall = async () => {
    try {
      // Call a health check endpoint with loader enabled
      const response = await fetchWithAuth('/api/health', {
        method: 'GET',
      });
      
      // Add a delay to make the loader visible
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Test API call failed:', error);
      setResult(`Error: ${error}`);
    }
  };
  
  const testApiCallNoLoader = async () => {
    try {
      // Call a health check endpoint with loader disabled
      const response = await fetchWithAuth('/api/health', {
        method: 'GET',
      }, false); // Pass false to disable the loader
      
      // Add a delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Test API call (no loader) failed:', error);
      setResult(`Error: ${error}`);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">API Loader Test</h1>
      
      <div className="flex gap-4 mb-6">
        <Button onClick={testApiCall}>
          Test API Call (with loader)
        </Button>
        
        <Button onClick={testApiCallNoLoader} variant="outline">
          Test API Call (no loader)
        </Button>
      </div>
      
      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <h2 className="text-lg font-semibold mb-2">Response:</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}