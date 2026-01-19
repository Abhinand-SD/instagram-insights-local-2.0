import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserMinus, UserCheck, RefreshCw } from 'lucide-react';

const StatItem = ({ icon: Icon, label, value, color, onClick, isActive, disabled = false }) => (
    <div
        onClick={!disabled ? onClick : undefined}
        className={`flex flex-col items-center p-3 rounded-xl border transition-all ${disabled
            ? 'bg-slate-800/50 border-white/5 cursor-default'
            : isActive
                ? 'bg-slate-700/80 border-purple-500/50 shadow-lg scale-105 cursor-pointer'
                : 'bg-slate-800/50 border-white/5 hover:bg-slate-800/80 hover:border-white/10 cursor-pointer'
            } w-full`}
    >
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 mb-2`}>
            <Icon size={20} className={color.replace('bg-', 'text-')} />
        </div>
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium text-center">{label}</span>
    </div>
);

const StatsCard = ({
    followersCount,
    followingCount,
    notFollowingBackCount,
    pendingRequestsCount = 0,
    activeTab,
    onTabChange,
    onReset
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-8 p-6 w-full max-w-5xl mx-auto"
        >
            <div className="flex flex-col xl:flex-row items-center justify-between gap-6">

                <div className="grid grid-cols-3 md:grid-cols-3 gap-4 w-full xl:w-auto flex-1">
                    <StatItem
                        icon={Users}
                        label="Followers"
                        value={followersCount}
                        color="bg-blue-500"
                        disabled={true}
                    />
                    <StatItem
                        icon={UserCheck}
                        label="Following"
                        value={followingCount}
                        color="bg-green-500"
                        disabled={true}
                    />
                    <StatItem
                        icon={UserMinus}
                        label="Not Back"
                        value={notFollowingBackCount}
                        color="bg-red-500"
                        onClick={() => onTabChange && onTabChange('not_following_back')}
                        isActive={activeTab === 'not_following_back'}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                    <button
                        onClick={() => onTabChange && onTabChange('pending_requests')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all font-medium whitespace-nowrap shadow-lg hover:shadow-xl active:scale-95 w-full sm:w-auto justify-center ${activeTab === 'pending_requests'
                            ? 'bg-purple-600 hover:bg-purple-700'
                            : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                        disabled={!onTabChange}
                    >
                        <Users size={18} />
                        <span>Pending ({pendingRequestsCount})</span>
                    </button>

                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-white transition-all font-medium whitespace-nowrap shadow-lg hover:shadow-xl active:scale-95 w-full sm:w-auto justify-center"
                    >
                        <RefreshCw size={18} />
                        <span>Upload New File</span>
                    </button>
                </div>

            </div>
        </motion.div>
    );
};

export default StatsCard;
