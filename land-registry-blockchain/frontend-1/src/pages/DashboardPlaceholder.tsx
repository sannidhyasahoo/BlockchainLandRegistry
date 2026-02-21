import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPlaceholder() {
    return (
        <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-8 text-white">
            <div className="bg-brand-800 border border-brand-700 p-10 rounded-xl shadow-2xl w-full max-w-2xl text-center">
                <h1 className="text-3xl font-semibold mb-2">Welcome to your Dashboard</h1>
                <p className="text-brand-300 mb-8">
                    Logged in as Institutional User
                </p>
                <div className="p-4 bg-brand-900/50 rounded-lg text-sm text-brand-200 text-left border border-brand-700/50 mb-8">
                    <p className="font-mono text-xs">
            // This is a placeholder for the Intelligstry application dashboard. <br />
            // Real functionality would be implemented here, strictly adhering <br />
            // to the core enterprise requirements and institutional workflows.
                    </p>
                </div>
                <div className="flex justify-center">
                    <Link to="/">
                        <button className="text-sm font-medium text-white bg-brand-700 hover:bg-brand-600 px-6 py-2 rounded-md transition-opacity duration-200">
                            Return to Landing
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
