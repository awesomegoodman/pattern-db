import { Suspense } from "react";
import { getImplementationPatterns, getProblems, getCapabilities } from "@/lib/queries";
import CompanyForm from "./CompanyForm";

export default async function NewCompanyPage() {
  const [implementationPatterns, problems, capabilities] = await Promise.all([
    getImplementationPatterns(),
    getProblems(),
    getCapabilities(),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Company</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Follows the MVR entry protocol. All fields marked * are required.
          Saves to <code className="text-xs bg-gray-100 px-1 rounded">data/companies/&lt;domain&gt;/&lt;slug&gt;.yaml</code> then runs the loader.
        </p>
      </div>
      <Suspense fallback={<div>Loading vocab...</div>}>
        <CompanyForm
          implementationPatterns={implementationPatterns as any}
          problems={problems as any}
          capabilities={capabilities as any}
        />
      </Suspense>
    </div>
  );
}
