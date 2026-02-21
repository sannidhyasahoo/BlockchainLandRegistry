import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

export default function SSOCallbackPage() {
    return (
        <div className="min-h-screen bg-brand-900 flex items-center justify-center text-white">
            <AuthenticateWithRedirectCallback continueUrl="/role-selection" />
        </div>
    );
}
