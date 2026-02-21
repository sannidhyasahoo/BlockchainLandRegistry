import React, { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function RoleSelection() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && !user) {
            navigate('/');
        } else if (isLoaded && user) {
            checkUserRole();
        }
    }, [isLoaded, user]);

    const checkUserRole = async () => {
        setLoading(true);
        try {
            // Check supabase for existing user record
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('clerk_id', user.id)
                .single();

            if (data && data.role) {
                // User exists and has a role, skip selection entirely!
                if (data.role === 'registrar') {
                    navigate('/registrar-dashboard', { replace: true });
                } else {
                    navigate('/user-dashboard', { replace: true });
                }
            } else {
                checkLocalFallback();
            }
        } catch (err) {
            console.warn("Supabase check failed (missing URL or unreachable). Falling back to local storage.", err);
            checkLocalFallback();
        }
    };

    const checkLocalFallback = () => {
        const localRole = localStorage.getItem(`role_${user.id}`);
        if (localRole) {
            if (localRole === 'registrar') {
                navigate('/registrar-dashboard', { replace: true });
            } else {
                navigate('/user-dashboard', { replace: true });
            }
        } else {
            // No role assigned yet, STOP loading and let them choose ONCE.
            setLoading(false);
        }
    };

    const handleRoleSelect = async (selectedRole) => {
        const toastId = toast.loading('Saving your role...');
        try {
            const { error } = await supabase
                .from('users')
                .upsert({
                    clerk_id: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    role: selectedRole
                });

            if (error) throw error;

            toast.success('Role saved successfully!', { id: toastId });
        } catch (err) {
            console.warn("Supabase upsert failed, saving to localStorage instead.");
            localStorage.setItem(`role_${user.id}`, selectedRole);
            toast.success('Role saved locally for demo!', { id: toastId });
        }

        // Navigate
        if (selectedRole === 'registrar') {
            navigate('/registrar-dashboard', { replace: true });
        } else {
            navigate('/user-dashboard', { replace: true });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(rgba(16, 0, 43, 0.8), rgba(16, 0, 43, 0.9))" }}>
                <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-6 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "linear-gradient(rgba(16, 0, 43, 0.8), rgba(16, 0, 43, 0.9))" }}>
            <div className="bg-brand-800/80 backdrop-blur-lg p-10 rounded-[2rem] shadow-2xl border border-brand-700/50 max-w-md w-full text-center hover:shadow-brand-500/20 transition-all">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome to LandChain!</h2>
                <p className="text-brand-200 mb-8 font-medium">Please verify your role to access your personalized dashoard.</p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => handleRoleSelect('user')}
                        className="group relative flex items-center justify-center bg-brand-600 hover:bg-brand-500 text-white font-semibold py-4 px-6 rounded-xl transition duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <span className="text-lg">I am a User</span>
                    </button>
                    <button
                        onClick={() => handleRoleSelect('registrar')}
                        className="group relative flex items-center justify-center bg-brand-800 hover:bg-brand-700 text-brand-100 border border-brand-500 hover:border-brand-400 font-semibold py-4 px-6 rounded-xl transition duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <span className="text-lg">I am a Registrar</span>
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-brand-700/50">
                    <button
                        onClick={() => signOut()}
                        className="text-sm font-medium text-brand-300 hover:text-white transition-colors"
                    >
                        Cancel & Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
