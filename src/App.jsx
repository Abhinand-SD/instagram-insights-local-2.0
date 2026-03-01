import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from './components/FileUpload';
import ProfileCard from './components/ProfileCard';
import StatsCard from './components/StatsCard';
import Footer from './components/Footer';
import HowToGuide from './components/HowToGuide';
import { HelpCircle } from 'lucide-react';

function App() {
  const [data, setData] = useState(null);
  const [dataType, setDataType] = useState(null); // 'zip_import', 'not_following_back', 'recent_requests', etc.

  // Store all data from ZIP to switch views without re-processing
  const [zipData, setZipData] = useState(null);
  const [activeTab, setActiveTab] = useState('not_following_back');
  const [showGuide, setShowGuide] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    notFollowingBack: 0,
    pendingRequests: 0
  });

  // Load from local storage on initial mount
  useEffect(() => {
    const savedZipData = localStorage.getItem('instagramInsightsData');
    if (savedZipData) {
      try {
        const parsed = JSON.parse(savedZipData);
        setZipData(parsed);
        setData(parsed.notFollowingBack || []);
        setActiveTab('not_following_back');
        setDataType('zip_import');
        setStats({
          followers: parsed.followers?.length || 0,
          following: parsed.following?.length || 0,
          notFollowingBack: parsed.notFollowingBack?.length || 0,
          pendingRequests: parsed.pendingRequests?.length || 0
        });
      } catch (e) {
        console.error("Error loading local storage data", e);
      }
    }
  }, []);

  const handleDataLoaded = (loadedData, type) => {
    if (type === 'zip_import') {
      try {
        console.log("Processing ZIP import data...");
        // Parse Followers
        const followersList = new Set();
        let followersArray = [];

        // Structure observed in followers_1.json: It is a direct array of objects.
        if (Array.isArray(loadedData.followers)) {
          followersArray = loadedData.followers;
        } else if (loadedData.followers && Array.isArray(loadedData.followers.relationships_followers)) {
          followersArray = loadedData.followers.relationships_followers;
        } else {
          console.warn("Unknown followers structure", loadedData.followers);
        }

        // Add to Set with lowercase normalization
        followersArray.forEach(item => {
          if (item.string_list_data && item.string_list_data[0] && item.string_list_data[0].value) {
            followersList.add(item.string_list_data[0].value.toLowerCase());
          }
        });

        // Parse Following
        let followingArray = [];
        // Structure observed in following.json: Object with 'relationships_following' array
        if (loadedData.following && Array.isArray(loadedData.following.relationships_following)) {
          followingArray = loadedData.following.relationships_following;
        } else if (Array.isArray(loadedData.following)) {
          followingArray = loadedData.following;
        } else {
          console.warn("Unknown following structure", loadedData.following);
        }

        // Filter Following who are NOT in Followers
        const notFollowingBack = followingArray.filter(item => {
          let username = null;

          // Try to get username from string_list_data value (common in followers)
          if (item.string_list_data && item.string_list_data[0] && item.string_list_data[0].value) {
            username = item.string_list_data[0].value;
          }
          // Fallback: Try 'title' field (common in following.json)
          else if (item.title) {
            username = item.title;
          }

          if (username) {
            // Check if this username exists in followers list (case insensitive)
            return !followersList.has(username.toLowerCase());
          }
          return false;
        });

        // Requests
        const pendingRequests = loadedData.pendingRequests || [];

        // Update Stats
        setStats({
          followers: followersList.size,
          following: followingArray.length,
          notFollowingBack: notFollowingBack.length,
          pendingRequests: pendingRequests.length
        });

        const newZipData = {
          followers: followersArray,
          following: followingArray,
          notFollowingBack: notFollowingBack,
          pendingRequests: pendingRequests
        };

        // Store full processed data
        setZipData(newZipData);
        localStorage.setItem('instagramInsightsData', JSON.stringify(newZipData));

        setData(notFollowingBack);
        setActiveTab('not_following_back');
        setDataType('zip_import');
      } catch (err) {
        console.error("Error processing ZIP data", err);
        alert(`Error processing extracted data: ${err.message}`);
      }
    } else {
      // Single file upload
      setData(loadedData);
      setDataType(type);
      setZipData(null); // Clear zip data on single file upload
      localStorage.removeItem('instagramInsightsData');

      // Update stats based on what was uploaded
      setStats({
        followers: 0,
        following: 0,
        notFollowingBack: type === 'not_following_back' ? loadedData.length : 0,
        pendingRequests: type === 'pending_requests' ? loadedData.length : 0
      });
    }
  };

  const handleReset = () => {
    setData(null);
    setDataType(null);
    setZipData(null);
    setActiveTab('not_following_back');
    setStats({ followers: 0, following: 0, notFollowingBack: 0, pendingRequests: 0 });
    localStorage.removeItem('instagramInsightsData');
  };

  const handleTabChange = (tab) => {
    if (!zipData) return;
    setActiveTab(tab);

    switch (tab) {
      case 'not_following_back':
        setData(zipData.notFollowingBack || []);
        break;

      case 'pending_requests':
        setData(zipData.pendingRequests || []);
        break;
      default:
        setData(zipData.notFollowingBack || []);
    }
  };

  const handleUnfollow = (usernameToUnfollow) => {
    if (!usernameToUnfollow) return;

    if (zipData) {
      const updatedNotFollowingBack = (zipData.notFollowingBack || []).filter(item => {
        const username = item.string_list_data?.[0]?.value || item.title;
        return username !== usernameToUnfollow;
      });
      const updatedPendingRequests = (zipData.pendingRequests || []).filter(item => {
        const username = item.string_list_data?.[0]?.value || item.title;
        return username !== usernameToUnfollow;
      });

      const updatedZipData = {
        ...zipData,
        notFollowingBack: updatedNotFollowingBack,
        pendingRequests: updatedPendingRequests
      };

      setZipData(updatedZipData);
      localStorage.setItem('instagramInsightsData', JSON.stringify(updatedZipData));

      if (activeTab === 'not_following_back') {
        setData(updatedNotFollowingBack);
      } else if (activeTab === 'pending_requests') {
        setData(updatedPendingRequests);
      }

      setStats(prev => ({
        ...prev,
        notFollowingBack: updatedNotFollowingBack.length,
        pendingRequests: updatedPendingRequests.length
      }));
    } else if (data) {
      const updatedData = data.filter(item => {
        const username = item.string_list_data?.[0]?.value || item.title;
        return username !== usernameToUnfollow;
      });
      setData(updatedData);
      setStats(prev => ({
        ...prev,
        notFollowingBack: dataType === 'not_following_back' ? updatedData.length : prev.notFollowingBack,
        pendingRequests: dataType === 'pending_requests' ? updatedData.length : prev.pendingRequests
      }));
    }
  };

  const getTitle = () => {
    if (dataType !== 'zip_import') {
      if (dataType === 'pending_requests') return "Sent Requests";
      return "Not Following Back";
    }

    switch (activeTab) {
      case 'not_following_back': return "Not Following Back";
      case 'pending_requests': return "Sent Requests";
      default: return "Not Following Back";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="grow px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!data ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-[70vh]"
            >
              <div className="text-center mb-10">
                <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-pink-500 to-red-500">
                  Instagram Insights
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto px-4">
                  Identify users who don't follow you back instantly. Secure client-side processing.
                </p>
              </div>

              <div className="w-full max-w-xl mx-auto mb-8">
                <AnimatePresence>
                  {showGuide && <HowToGuide onClose={() => setShowGuide(false)} />}
                </AnimatePresence>

                {!showGuide && (
                  <div className="flex justify-center mb-6">
                    <button
                      onClick={() => setShowGuide(true)}
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-full"
                    >
                      <HelpCircle size={16} />
                      How to get your data?
                    </button>
                  </div>
                )}
              </div>

              {!showGuide && <FileUpload onDataLoaded={handleDataLoaded} />}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6"
            >
              <h2 className="text-2xl font-bold text-white mb-2 text-center md:text-left">
                {getTitle()}
              </h2>

              {/* Stats Card */}
              <StatsCard
                followersCount={stats.followers}
                followingCount={stats.following}
                notFollowingBackCount={stats.notFollowingBack}
                pendingRequestsCount={stats.pendingRequests}
                onReset={handleReset}
                activeTab={zipData ? activeTab : null}
                onTabChange={zipData ? handleTabChange : null}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...data].reverse().map((item, index) => {
                  const username = item.string_list_data?.[0]?.value || item.title || "Unknown User";
                  const profileData = {
                    ...item,
                    string_list_data: [{
                      ...(item.string_list_data?.[0] || {}),
                      value: username,
                      timestamp: item.string_list_data?.[0]?.timestamp || Math.floor(Date.now() / 1000)
                    }]
                  };

                  return (
                    <ProfileCard
                      key={`${username}-${index}`}
                      profile={profileData}
                      index={index}
                      onUnfollow={handleUnfollow}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
