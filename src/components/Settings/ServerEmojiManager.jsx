import { useState, useEffect } from 'react';
import { EmojisService } from '../../services/emojis.service';
import { useEmojisStore } from '../../store/emojis.store';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { Upload, Trash2, Plus } from 'lucide-react';

const ServerEmojiManager = ({ guild }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [emojiName, setEmojiName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const guildEmojis = useEmojisStore((state) => state.guildEmojis[guild.id] || []);

  useEffect(() => {
    if (guild?.id) {
      EmojisService.loadGuildEmojis(guild.id);
    }
  }, [guild?.id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name if empty
      if (!emojiName) {
        const name = file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
        setEmojiName(name);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !emojiName) {
      toast.error('Please select an image and enter a shortcode.');
      return;
    }

    setUploading(true);
    try {
      await EmojisService.uploadEmoji(guild.id, emojiName, selectedFile);
      toast.success('Emoji uploaded successfully!');
      setEmojiName('');
      setSelectedFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload emoji.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (emojiId) => {
    try {
      await EmojisService.deleteEmoji(guild.id, emojiId);
      toast.success('Emoji deleted.');
    } catch (error) {
      toast.error('Failed to delete emoji.');
    }
  };

  return (
    <div className="max-w-[740px] space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Emoji</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload custom emojis and use them in your server. You can upload up to 50 custom emojis.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="mb-4 text-xs font-bold uppercase text-muted-foreground">Upload Emoji</h3>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">File</Label>
            <div className="flex items-center gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-border bg-background hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                {selectedFile ? (
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    className="h-full w-full object-contain" 
                    alt="Preview"
                  />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex-1 text-xs text-muted-foreground">
                <p>Maximum file size: 256KB</p>
                <p>Recommended dimensions: 128x128</p>
                <p>Allowed types: PNG, JPEG, GIF</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground">Emoji Name</Label>
            <Input 
              placeholder="emoji_name"
              value={emojiName}
              onChange={(e) => setEmojiName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="bg-background h-10"
            />
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={uploading || !selectedFile || !emojiName}
            className="shrink-0"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase text-muted-foreground">
            {guildEmojis.length} Emojis
          </h3>
          <p className="text-xs text-muted-foreground">
            Slots remaining: {50 - guildEmojis.length}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
          {guildEmojis.map((emoji) => (
            <div 
              key={emoji.id} 
              className="group relative flex flex-col items-center gap-2 rounded-md border border-border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="h-8 w-8">
                <img 
                  src={`${import.meta.env.VITE_CDN_BASE_URL}/emojis/${emoji.id}`} 
                  alt={emoji.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xs font-medium text-foreground truncate w-full text-center">
                :{emoji.name}:
              </span>
              <button 
                onClick={() => handleDelete(emoji.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}

          {guildEmojis.length === 0 && (
            <div className="col-span-full py-10 text-center">
              <p className="text-sm text-muted-foreground italic">No custom emojis yet. Upload one above!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerEmojiManager;
