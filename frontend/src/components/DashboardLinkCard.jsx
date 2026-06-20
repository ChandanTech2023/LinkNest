import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Edit2, Trash2, Globe, Github, Twitter, Instagram, Linkedin, Youtube, Facebook, Music, Link2 } from 'lucide-react';

const getIcon = (type) => {
  switch (type) {
    case 'github': return <Github className="w-4 h-4" />;
    case 'twitter': return <Twitter className="w-4 h-4" />;
    case 'instagram': return <Instagram className="w-4 h-4" />;
    case 'linkedin': return <Linkedin className="w-4 h-4" />;
    case 'youtube': return <Youtube className="w-4 h-4" />;
    case 'facebook': return <Facebook className="w-4 h-4" />;
    case 'tiktok': return <Music className="w-4 h-4" />; 
    case 'globe': return <Globe className="w-4 h-4" />;
    default: return <Link2 className="w-4 h-4" />;
  }
};

const DashboardLinkCard = ({ link, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: link.title,
    url: link.url,
    iconType: link.iconType,
  });

  const handleSave = () => {
    onUpdate(link._id, editForm);
    setIsEditing(false);
  };

  const handleToggle = () => {
    onUpdate(link._id, { isActive: !link.isActive });
  };

  return (
    <Draggable draggableId={link._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-white border rounded-lg p-4 mb-3 flex flex-col transition-shadow ${
            snapshot.isDragging ? 'shadow-lg border-indigo-500 z-50' : 'border-gray-200 shadow-sm'
          }`}
        >
          <div className="flex items-center">
            <div
              {...provided.dragHandleProps}
              className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing p-1"
            >
              <GripVertical size={20} />
            </div>
            
            <div className="ml-3 flex-grow">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    placeholder="Title"
                  />
                  <input
                    type="text"
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                    placeholder="URL"
                  />
                  <select
                    value={editForm.iconType}
                    onChange={(e) => setEditForm({ ...editForm, iconType: e.target.value })}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border bg-white"
                  >
                    <option value="globe">Globe (Default)</option>
                    <option value="github">GitHub</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={handleSave}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({ title: link.title, url: link.url, iconType: link.iconType });
                      }}
                      className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {getIcon(link.iconType)}
                      {link.title}
                    </h3>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 block truncate max-w-xs">
                      {link.url}
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-3 sm:mt-0">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-indigo-600 p-1"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    
                    <div className="flex items-center">
                      <button
                        onClick={handleToggle}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          link.isActive ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            link.isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <button
                      onClick={() => onDelete(link._id)}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default DashboardLinkCard;
