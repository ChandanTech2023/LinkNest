import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import LinkCard from '../components/LinkCard';
import { motion } from 'framer-motion';

const PublicProfile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile/${username}`);
        setProfileData(res.data);
      } catch (err) {
        setError('Profile not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleLinkClick = (linkId) => {
    // Fire and forget click tracking
    api.post(`/links/${linkId}/click`).catch(err => console.error('Click tracking failed', err));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-6xl mb-4">🪹</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
        <p className="text-gray-500 mb-6">The page you are looking for doesn't exist.</p>
        <a href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium">
          Create your own LinkNest
        </a>
      </div>
    );
  }

  const { user, links } = profileData;
  const theme = user.profile.theme || 'minimal';

  return (
    <div className={`min-h-screen theme-${theme}`}>
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
        
        <motion.div 
          className="flex flex-col items-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {user.profile.photoUrl ? (
            <img 
              src={user.profile.photoUrl} 
              alt={user.profile.name} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover mb-4 border-4 border-white/20 shadow-xl" 
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl sm:text-5xl text-gray-500 mb-4 border-4 border-white/20 shadow-xl">
              {user.profile.name?.charAt(0) || user.username.charAt(0)}
            </div>
          )}
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 profile-name text-center">
            {user.profile.name || `@${user.username}`}
          </h1>
          
          {user.profile.bio && (
            <p className="text-base sm:text-lg text-center max-w-md profile-bio">
              {user.profile.bio}
            </p>
          )}
        </motion.div>

        <div className="space-y-4 w-full max-w-lg mx-auto">
          {links.length > 0 ? (
            links.map((link, index) => (
              <motion.div
                key={link._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <LinkCard
                  id={link._id}
                  title={link.title}
                  url={link.url}
                  iconType={link.iconType}
                  onClick={handleLinkClick}
                />
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 opacity-70 profile-bio">
              No links to display yet.
            </div>
          )}
        </div>

        <motion.div 
          className="mt-20 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <a href="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity flex items-center gap-2 profile-bio font-semibold">
            <div className="w-5 h-5 bg-indigo-600 rounded-md text-white flex items-center justify-center text-xs">L</div>
            Powered by LinkNest
          </a>
        </motion.div>

      </div>
    </div>
  );
};

export default PublicProfile;
