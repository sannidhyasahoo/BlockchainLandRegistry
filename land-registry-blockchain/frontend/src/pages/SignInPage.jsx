import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-brand-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <SignIn
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "bg-brand-800 border border-brand-700 shadow-2xl",
                            headerTitle: "text-white",
                            headerSubtitle: "text-brand-200",
                            socialButtonsBlockButton: "bg-brand-700 border-brand-600 text-white hover:bg-brand-600",
                            formButtonPrimary: "bg-brand-600 hover:bg-brand-500",
                            footerActionLink: "text-brand-400 hover:text-brand-300",
                            formFieldInput: "bg-brand-900 border-brand-600 text-white",
                            formFieldLabel: "text-brand-200",
                            identityPreviewText: "text-white",
                            identityPreviewEditButton: "text-brand-400",
                        }
                    }}
                    signUpUrl="/sign-up"
                    afterSignInUrl="/dashboard"
                    routing="path"
                    path="/sign-in"
                />
            </div>
        </div>
    );
}
