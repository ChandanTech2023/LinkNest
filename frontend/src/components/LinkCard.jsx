import React from 'react';
import { Globe, Github, Twitter, Instagram, Linkedin, Youtube, Facebook, Music, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';

const getIcon = (type) => {
  switch (type) {
    case 'github': return <Github className="w-5 h-5" />;
    case 'twitter': return <Twitter className="w-5 h-5" />;
    case 'instagram': return <Instagram className="w-5 h-5" />;
    case 'linkedin': return <Linkedin className="w-5 h-5" />;
    case 'youtube': return <Youtube className="w-5 h-5" />;
    case 'facebook': return <Facebook className="w-5 h-5" />;
    case 'tiktok': return <Music className="w-5 h-5" />; 
    case 'globe': return <Globe className="w-5 h-5" />;
    default: return <Link2 className="w-5 h-5" />;
  }
};

const LinkCard = ({ id, title, url, iconType, onClick }) => {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onClick(id)}
      className="link-card flex items-center p-4 mb-4 rounded-xl w-full relative overflow-hidden group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 mr-4 z-10">
        {getIcon(iconType)}
      </div>
      <div className="flex-grow text-center z-10 font-medium tracking-wide">
        {title}
      </div>
      <div className="w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {/* Empty space to balance flex centering */}
      </div>
    </motion.a>
  );
};

export default LinkCard;
