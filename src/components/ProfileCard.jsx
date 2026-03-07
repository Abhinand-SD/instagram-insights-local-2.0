import React, { useState } from 'react';
import { ExternalLink, UserMinus } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileCard = ({ profile, index, onUnfollow, actionLabel = "Unfollow" }) => {
    // Safe access to nested data
    const data = profile.string_list_data?.[0] || {};
    const username = data.value;
    const href = data.href;
    const timestamp = data.timestamp;

    const formatDate = (ts) => {
        if (!ts) return 'Unknown date';
        return new Date(ts * 1000).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="glass-card p-3 md:p-4 lg:p-5 flex flex-row items-center gap-4 group"
        >
            {/* Left side: Icon + Username */}
            <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-linear-to-tr from-yellow-400 via-red-500 to-purple-600">
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-slate-900 flex items-center justify-center">
                        <span className="text-slate-300 text-xl font-bold uppercase tracking-wider">
                            {username?.slice(0, 2) || "??"}
                        </span>
                    </div>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white text-center max-w-[80px] truncate" title={username}>
                    @{username}
                </h3>
            </div>

            {/* Right side: Date + Unfollow button */}
            <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
                <p className="text-xs text-slate-400">
                    Followed: {formatDate(timestamp)}
                </p>

                {actionLabel && (
                    <a
                        href={href || `https://www.instagram.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            if (onUnfollow) onUnfollow(username);
                        }}
                        className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-red-500/80 text-white py-2 px-4 rounded-lg transition-all duration-300 font-medium text-sm group-hover:shadow-lg hover:shadow-red-500/20"
                    >
                        <UserMinus size={16} />
                        <span>{actionLabel}</span>
                    </a>
                )}
            </div>
        </motion.div>
    );
};

export default ProfileCard;
