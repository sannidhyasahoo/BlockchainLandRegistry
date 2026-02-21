import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';

export default function SignInPage() {
    const { isLoaded, signIn } = useSignIn();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        if (!isLoaded || !signIn) return;

        setLoading(true);
        setError(null);

        try {
            const origin = window.location.origin;
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: `${origin}/sso-callback`,
                redirectUrlComplete: `${origin}/role-selection`
            });
        } catch (err) {
            console.error("Clerk OAuth Error:", err);
            setError(err.message || "Failed to initialize Gmail authentication");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(rgba(16, 0, 43, 0.8), rgba(16, 0, 43, 0.9))" }}>
            <div className="bg-brand-800/80 backdrop-blur-lg p-10 rounded-[2rem] shadow-2xl border border-brand-700/50 max-w-lg w-full text-center hover:shadow-brand-500/20 transition-all">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg">
                    {/* Gmail/Google Icon */}
                    <svg viewBox="0 0 24 24" y="0" x="0" height="32" width="32" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.236c0-.82-.07-1.605-.205-2.366H12v4.474h6.72c-.29 1.442-1.083 2.665-2.288 3.47v2.883h3.704c2.166-1.996 3.414-4.935 3.414-8.461z" fill="#FFFFFF" />
                        <path d="M12 24c3.376 0 6.208-1.118 8.277-3.023l-3.705-2.883c-1.12.75-2.553 1.192-4.572 1.192-3.515 0-6.494-2.375-7.556-5.567H.608v2.968C2.678 20.79 6.992 24 12 24z" fill="#E2E8F0" />
                        <path d="M4.444 13.719c-.27-.8-.426-1.656-.426-2.54 0-.883.156-1.74.426-2.539V5.672H.608C-.15 7.185-.5 8.922-.5 10.744c0 1.82.35 3.56.918 5.074l3.836-2.973z" fill="#94A3B8" />
                        <path d="M12 4.714c1.838 0 3.487.632 4.782 1.868l3.586-3.586C18.2 1.117 15.373 0 12 0 6.992 0 2.678 3.208.608 7.31L4.444 10.28c1.062-3.192 4.04-5.566 7.556-5.566z" fill="#CBD5E1" />
                    </svg>
                </div>

                <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Sign In</h2>
                <p className="text-brand-200 mb-10 text-lg">Use your Gmail account to access your LandChain dashboard securely.</p>

                {error && (
                    <div className="bg-red-900/50 p-4 rounded-xl border border-red-500 max-w-md mx-auto mb-6">
                        <p className="text-red-100 text-sm">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading || !isLoaded}
                    className="group relative flex items-center justify-center w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl transition duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                            Redirecting...
                        </span>
                    ) : (
                        <span className="text-lg flex items-center gap-3">
                            Continue with Gmail
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}
