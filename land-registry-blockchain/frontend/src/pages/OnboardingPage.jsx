import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRoleSelection = async (role) => {
        setSelectedRole(role);
        setLoading(true);

        try {
            // Update user metadata with the selected role
            await user.update({
                unsafeMetadata: {
                    role: role,
                },
            });

            toast.success(`Welcome! You're registered as a ${role}`);

            // Redirect to dashboard after role selection
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Failed to set role. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-900 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Welcome to LandChain! 👋
                    </h1>
                    <p className="text-brand-200 text-lg">
                        Please select your role to continue
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* User Role Card */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRoleSelection('user')}
                        disabled={loading}
                        className={`p-8 rounded-2xl border-2 transition-all duration-300 text-left ${selectedRole === 'user'
                                ? 'border-brand-500 bg-brand-800/50'
                                : 'border-brand-700 bg-brand-800 hover:border-brand-600'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className="text-5xl mb-4">👤</div>
                        <h3 className="text-2xl font-bold text-white mb-3">User</h3>
                        <p className="text-brand-200 mb-4">
                            Browse properties, view land records, and verify ownership information
                        </p>
                        <ul className="space-y-2 text-sm text-brand-300">
                            <li>✓ View all properties</li>
                            <li>✓ Verify ownership</li>
                            <li>✓ Access public records</li>
                            <li>✓ Track transactions</li>
                        </ul>
                    </motion.button>

                    {/* Registrar Role Card */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleRoleSelection('registrar')}
                        disabled={loading}
                        className={`p-8 rounded-2xl border-2 transition-all duration-300 text-left ${selectedRole === 'registrar'
                                ? 'border-brand-500 bg-brand-800/50'
                                : 'border-brand-700 bg-brand-800 hover:border-brand-600'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className="text-5xl mb-4">🏛️</div>
                        <h3 className="text-2xl font-bold text-white mb-3">Registrar</h3>
                        <p className="text-brand-200 mb-4">
                            Manage land registry, mint new properties, and approve transfers
                        </p>
                        <ul className="space-y-2 text-sm text-brand-300">
                            <li>✓ Mint new properties</li>
                            <li>✓ Approve transfers</li>
                            <li>✓ Manage registry</li>
                            <li>✓ Full admin access</li>
                        </ul>
                    </motion.button>
                </div>

                {loading && (
                    <div className="text-center mt-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                        <p className="text-brand-200 mt-4">Setting up your account...</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
