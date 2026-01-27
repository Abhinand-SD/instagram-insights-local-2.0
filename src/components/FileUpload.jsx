import React, { useCallback, useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import JSZip from 'jszip';

const FileUpload = ({ onDataLoaded }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');

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
        setLoadingText('Processing file...');

        try {
            if (file.name.endsWith('.json')) {
                await processJsonFile(file);
            } else if (file.name.endsWith('.zip')) {
                await processZipFile(file);
            } else {
                throw new Error('Please upload a valid JSON or ZIP file.');
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error processing file');
        } finally {
            setLoading(false);
            setLoadingText('');
        }
    };

    const processJsonFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target.result);
                    let type = null;
                    let data = [];

                    if (json.relationships_follow_requests_sent) {
                        type = 'pending_requests';
                        data = json.relationships_follow_requests_sent;
                    } else if (json.relationships_unfollowed_users) {
                        type = 'unfollowed';
                        data = json.relationships_unfollowed_users;
                    } else {
                        throw new Error('Unrecognized JSON structure. Supported files: "pending_follow_requests.json", "recently_unfollowed_profiles.json"');
                    }

                    onDataLoaded(data, type);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    const processZipFile = async (file) => {
        setLoadingText('Unzipping archive...');
        const zip = await JSZip.loadAsync(file);

        let followersFile = null;
        let followingFile = null;
        let pendingRequestsFile = null;

        // Search for specific files recursively
        zip.forEach((relativePath, zipEntry) => {
            if (zipEntry.name.endsWith('followers_1.json')) {
                followersFile = zipEntry;
            }
            if (zipEntry.name.endsWith('following.json')) {
                followingFile = zipEntry;
            }

            if (zipEntry.name.endsWith('pending_follow_requests.json') || zipEntry.name.endsWith('follow_requests_sent.json')) {
                pendingRequestsFile = zipEntry;
            }
        });

        if (!followersFile || !followingFile) {
            throw new Error('Could not find "followers_1.json" and "following.json" in the ZIP. Make sure you downloaded the correct data export.');
        }

        setLoadingText('Parsing data...');
        const followersText = await followersFile.async('text');
        const followingText = await followingFile.async('text');


        let pendingRequestsJson = null;
        if (pendingRequestsFile) {
            const text = await pendingRequestsFile.async('text');
            const json = JSON.parse(text);
            pendingRequestsJson = json.relationships_follow_requests_sent || [];
        }

        const followersJson = JSON.parse(followersText);
        const followingJson = JSON.parse(followingText);

        onDataLoaded({
            followers: followersJson,
            following: followingJson,
            pendingRequests: pendingRequestsJson
        }, 'zip_import');
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
        <div className="w-full max-w-sm md:max-w-md lg:max-w-2xl mx-auto p-4 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative group rounded-2xl border-2 border-dashed transition-all duration-300 p-8 md:p-10 lg:p-12 text-center overflow-hidden w-full
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
                    accept=".json,.zip"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={loading}
                />

                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                        <p className="text-slate-300 animate-pulse">{loadingText}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 pointer-events-none">
                        <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                            <UploadCloud size={48} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-slate-200">
                                Drop JSON or ZIP file
                            </h3>
                            <p className="text-sm text-slate-400 max-w-xs mx-auto">
                                <span className="block mb-2">Upload individual JSON files</span>
                                <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">OR</span>
                                <span className="block mt-2">Upload full Instagram Data ZIP to find who doesn't follow you back</span>
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

export default FileUpload;
