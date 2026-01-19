import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from './components/FileUpload';
import ProfileCard from './components/ProfileCard';
import StatsCard from './components/StatsCard';
import Footer from './components/Footer';

function App() {
  const [data, setData] = useState(null);
  const [dataType, setDataType] = useState(null); // 'zip_import', 'not_following_back', 'recent_requests', etc.

  // Store all data from ZIP to switch views without re-processing
  const [zipData, setZipData] = useState(null);
  const [activeTab, setActiveTab] = useState('not_following_back');

  // Stats state
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    notFollowingBack: 0,
    pendingRequests: 0
  });

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

        // Store full processed data
        setZipData({
          followers: followersArray,
          following: followingArray,
          notFollowingBack: notFollowingBack,
          pendingRequests: pendingRequests
        });

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
      <main className="grow px-4 py-8 max-w-6xl mx-auto w-full">
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
              <FileUpload onDataLoaded={handleDataLoaded} />
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
