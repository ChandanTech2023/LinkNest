import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import ThemeSelector from '../components/ThemeSelector';
import DashboardLinkCard from '../components/DashboardLinkCard';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus, User, Save, ExternalLink, Link as LinkIcon } from 'lucide-react';

const Dashboard = () => {
  const { user, updateProfileState } = useContext(AuthContext);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.profile?.name || '',
    bio: user?.profile?.bio || '',
    photoUrl: user?.profile?.photoUrl || '',
    theme: user?.profile?.theme || 'minimal'
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // New link form state
  const [newLink, setNewLink] = useState({ title: '', url: '', iconType: 'globe' });
  const [addingLink, setAddingLink] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await api.get('/links');
      setLinks(res.data);
    } catch (err) {
      console.error('Failed to fetch links');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    if (e) e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      const res = await api.put('/profile', profileForm);
      updateProfileState(res.data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setProfileMsg({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleThemeSelect = async (themeId) => {
    const updatedForm = { ...profileForm, theme: themeId };
    setProfileForm(updatedForm);
    
    // Auto-save theme
    try {
      const res = await api.put('/profile', updatedForm);
      updateProfileState(res.data);
    } catch (err) {
      console.error('Failed to update theme');
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;
    
    setAddingLink(true);
    try {
      const res = await api.post('/links', newLink);
      setLinks([...links, res.data]);
      setNewLink({ title: '', url: '', iconType: 'globe' });
    } catch (err) {
      console.error('Failed to add link');
    } finally {
      setAddingLink(false);
    }
  };

  const handleUpdateLink = async (id, data) => {
    try {
      const res = await api.put(`/links/${id}`, data);
      setLinks(links.map(l => l._id === id ? res.data : l));
    } catch (err) {
      console.error('Failed to update link');
    }
  };

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      await api.delete(`/links/${id}`);
      setLinks(links.filter(l => l._id !== id));
    } catch (err) {
      console.error('Failed to delete link');
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newLinks = Array.from(links);
    const [reorderedItem] = newLinks.splice(sourceIndex, 1);
    newLinks.splice(destinationIndex, 0, reorderedItem);

    // Update local order values
    const updatedLinks = newLinks.map((link, index) => ({
      ...link,
      order: index
    }));

    setLinks(updatedLinks);

    // Sync with backend
    try {
      const payload = updatedLinks.map(l => ({ id: l._id, order: l.order }));
      await api.put('/links', { links: payload });
    } catch (err) {
      console.error('Failed to reorder links');
      fetchLinks(); // Revert on failure
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <a
            href={`/${user?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <ExternalLink size={16} />
            View Public Profile
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Links & Profile Management */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Profile Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <User size={20} className="text-indigo-600" />
                  Profile Details
                </h2>
              </div>
              <div className="p-6">
                {profileMsg.text && (
                  <div className={`mb-4 p-3 rounded-md text-sm ${profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {profileMsg.text}
                  </div>
                )}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Display Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Photo URL</label>
                      <input
                        type="text"
                        value={profileForm.photoUrl}
                        onChange={(e) => setProfileForm({...profileForm, photoUrl: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      rows={2}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Profile Theme</label>
                    <ThemeSelector currentTheme={profileForm.theme} onSelectTheme={handleThemeSelect} />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Save size={16} />
                      {profileSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Links Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <LinkIcon size={20} className="text-indigo-600" />
                  Manage Links
                </h2>
              </div>
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <form onSubmit={handleAddLink} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Title"
                    value={newLink.title}
                    onChange={(e) => setNewLink({...newLink, title: e.target.value})}
                    className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    type="url"
                    required
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                    className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button
                    type="submit"
                    disabled={addingLink}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  >
                    <Plus size={16} />
                    Add
                  </button>
                </form>
              </div>
              
              <div className="p-6">
                {links.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    You don't have any links yet. Add one above!
                  </div>
                ) : (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="links-list">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {links.map((link, index) => (
                            <DashboardLinkCard
                              key={link._id}
                              link={link}
                              index={index}
                              onUpdate={handleUpdateLink}
                              onDelete={handleDeleteLink}
                            />
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Live Preview Panel */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24 bg-white rounded-[2.5rem] shadow-xl border-[8px] border-gray-900 overflow-hidden h-[700px] w-full max-w-[320px] mx-auto relative flex flex-col items-center">
              {/* Phone notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl w-40 mx-auto z-20"></div>
              
              <div className={`w-full h-full overflow-y-auto theme-${profileForm.theme} [&::-webkit-scrollbar]:hidden`}>
                <div className="px-6 py-12 flex flex-col items-center">
                  {profileForm.photoUrl ? (
                    <img src={profileForm.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-white/20 shadow-lg" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 mb-4 border-4 border-white/20 shadow-lg">
                      {profileForm.name?.charAt(0) || user?.username?.charAt(0)}
                    </div>
                  )}
                  
                  <h1 className="text-xl font-bold mb-2 profile-name text-center">
                    {profileForm.name || `@${user?.username}`}
                  </h1>
                  
                  {profileForm.bio && (
                    <p className="text-sm text-center mb-8 profile-bio">
                      {profileForm.bio}
                    </p>
                  )}

                  <div className="w-full space-y-4">
                    {links.filter(l => l.isActive).map(link => (
                      <div
                        key={link._id}
                        className="link-card p-4 rounded-xl text-center font-medium shadow-sm flex items-center justify-center"
                      >
                        {link.title}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-12 text-xs opacity-50 flex items-center justify-center gap-1 profile-bio font-semibold pb-8 w-full">
                    <div className="w-4 h-4 bg-indigo-600 rounded-md text-white flex items-center justify-center text-[10px]">L</div>
                    LinkNest
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
