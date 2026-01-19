import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PendingRequestsUpload = ({ onDataLoaded }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragging(true);
        } else if (e.type === 'dragleave') {
            setIsDragging(false);
        }
    }, []);

    const processFile = async (file) => {
        setLoading(true);
        setError(null);

        try {
            if (!file.name.endsWith('.json')) {
                throw new Error('Please upload a valid JSON file.');
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target.result);

                    if (json.relationships_follow_requests_sent) {
                        onDataLoaded(json.relationships_follow_requests_sent, 'pending_requests');
                    } else {
                        throw new Error('Invalid file. Please upload "pending_follow_requests.json"');
                    }
                } catch (err) {
                    setError(err.message || 'Error processing file');
                }
                setLoading(false);
            };
            reader.onerror = () => {
                setError('Failed to read file');
                setLoading(false);
            };
            reader.readAsText(file);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error processing file');
            setLoading(false);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center overflow-hidden
          ${isDragging
                        ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
                    }
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".json"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={loading}
                />

                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        <p className="text-slate-300 animate-pulse">Processing...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 pointer-events-none">
                        <div className={`p-3 rounded-full transition-colors duration-300 ${isDragging ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                            <Upload size={40} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-slate-200">
                                Upload Pending Requests
                            </h3>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto">
                                Drop <span className="text-purple-400 font-medium">pending_follow_requests.json</span> here
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 flex items-center gap-3"
                >
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </motion.div>
            )}
        </div>
    );
};

export default PendingRequestsUpload;
