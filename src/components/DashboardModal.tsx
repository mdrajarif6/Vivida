import React, { useEffect, useState } from 'react';
import { X, Image as ImageIcon, Loader2, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SavedImage {
  id: number;
  image_url: string;
  created_at: string;
}

interface DashboardModalProps {
  onClose: () => void;
  onLoadImage: (url: string) => void;
}

export default function DashboardModal({ onClose, onLoadImage }: DashboardModalProps) {
  const { user, logout } = useAuth();
  const [images, setImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetch('/resizzy/backend/api/my_images.php')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setImages(data.images);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `lumina_export_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-4xl bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden transform animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-800/80 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserAvatar username={user?.username} />
              {user?.username}'s Studio
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Member since {new Date(user?.created_at || '').toLocaleDateString()}
              {user?.is_pro ? <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 py-0.5 px-2 rounded-full border border-amber-500/30">PRO USER</span> : ''}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { logout(); onClose(); }}
              className="text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
            >
              Sign Out
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-violet-400" />
            My Saved Creations
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-violet-500" />
              <p>Loading your gallery...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-800/20 rounded-2xl border border-slate-800 border-dashed">
              <ImageIcon className="h-12 w-12 mb-3 opacity-50" />
              <p>You haven't saved any images to the cloud yet.</p>
              <p className="text-sm mt-1">Export an image and check "Save to Cloud" to see it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map(img => (
                <div key={img.id} className="group relative aspect-square bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 hover:border-violet-500/50 transition-all">
                  <img src={img.image_url} alt="Saved edit" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <button 
                      onClick={() => handleDownload(img.image_url)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => {
                        onLoadImage(img.image_url);
                        onClose();
                      }}
                      className="py-1.5 px-3 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Edit Again
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-950/90 to-transparent">
                    <p className="text-[10px] text-slate-300 font-medium">
                      {new Date(img.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserAvatar({ username }: { username?: string }) {
  if (!username) return null;
  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
      {username.charAt(0).toUpperCase()}
    </div>
  );
}
