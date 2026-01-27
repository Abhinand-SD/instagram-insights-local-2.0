import React from 'react';
import { motion } from 'framer-motion';
import { X, Instagram, Download, Upload, CheckCircle, Smartphone, Settings, HardDrive } from 'lucide-react';

const Step = ({ number, title, children, icon: Icon }) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold border border-slate-600">
                {number}
            </div>
            <div className="w-0.5 h-full bg-slate-800 my-2" />
        </div>
        <div className="pb-8">
            <h3 className="text-lg font-bebas flex items-center gap-2 text-slate-100 mb-2">
                {Icon && <Icon size={18} className="text-purple-400" />}
                {title}
            </h3>
            <div className="text-slate-400 text-sm space-y-2 leading-relaxed">
                {children}
            </div>
        </div>
    </div>
);

const HowToGuide = ({ onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 z-10">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-400 to-pink-500">
                    How to Download Instagram Data
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 text-left">
                <Step number="1" title="Open Instagram" icon={Instagram}>
                    <p>Open the Instagram app on your mobile or go to instagram.com on a browser.</p>
                    <p className="text-xs bg-slate-800/50 p-2 rounded border border-slate-700/50">
                        Make sure you’re logged into the correct account.
                    </p>
                </Step>

                <Step number="2" title="Go to Settings" icon={Settings}>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Tap your <strong>Profile icon</strong> (bottom-right).</li>
                        <li>Tap the <strong>☰ menu</strong> (top-right).</li>
                        <li>Select <strong>Settings and privacy</strong>.</li>
                    </ul>
                </Step>

                <Step number="3" title="Request Information" icon={Download}>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Scroll down to <strong>Accounts Center</strong>.</li>
                        <li>Tap <strong>Your information and permissions</strong>.</li>
                        <li>Select <strong>Download your information</strong>.</li>
                        <li>Tap <strong>Request a download</strong>.</li>
                    </ul>
                </Step>

                <Step number="4" title="Choose Data Format" icon={HardDrive}>
                    <ul className="list-disc pl-4 space-y-1">
                        <li>Select <strong>JSON format</strong> (Recommended).</li>
                        <li>Choose <strong>All available information</strong>.</li>
                        <li>Select Date range → <strong>All time</strong>.</li>
                        <li>Tap <strong>Submit request</strong>.</li>
                    </ul>
                    <div className="mt-2 text-yellow-500/80 text-xs flex gap-2 items-start bg-yellow-500/10 p-2 rounded">
                        <span>📌</span>
                        <span>Preparation may take from a few minutes to several hours.</span>
                    </div>
                </Step>

                <Step number="5" title="Download ZIP" icon={Download}>
                    <p>Once ready, Instagram will notify you.</p>
                    <ul className="list-disc pl-4 space-y-1 mt-1">
                        <li>Go back to <strong>Download your information</strong>.</li>
                        <li>Tap <strong>Download</strong>.</li>
                    </ul>
                </Step>

                <Step number="6" title="Upload to Website" icon={Upload}>
                    <p>Come back here and upload the downloaded ZIP file.</p>
                    <div className="mt-2 text-red-400/80 text-xs flex gap-2 items-start bg-red-500/10 p-2 rounded">
                        <span>⚠️</span>
                        <span><strong>Do not unzip the file.</strong> Upload the ZIP file directly.</span>
                    </div>
                </Step>
            </div>
        </motion.div>
    );
};

export default HowToGuide;
