import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Upload, File, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

const FileUploadSection = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [customFileName, setCustomFileName] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      const fileName = customFileName || file.name;
      const fileExt = fileName.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('ai-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl }, error: urlError } = await supabase.storage
        .from('ai-files')
        .getPublicUrl(filePath);

      if (urlError) throw urlError;

      const { error: dbError } = await supabase
        .from('ai_files')
        .insert({
          user_id: user.id,
          name: fileName,
          type: file.type,
          size: file.size,
          url: publicUrl,
        });

      if (dbError) throw dbError;

      setFiles([...files, {
        id: Date.now().toString(),
        name: fileName,
        type: file.type,
        size: file.size,
        url: publicUrl,
      }]);

      setCustomFileName('');
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('ai_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      setFiles(files.filter(f => f.id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            label="Custom File Name (optional)"
            value={customFileName}
            onChange={(e) => setCustomFileName(e.target.value)}
            placeholder="Enter custom file name"
          />

          <div className="flex items-center space-x-2">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="ai-file-upload"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            />
            <label
              htmlFor="ai-file-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <Upload size={16} className="mr-2" />
              Upload File
            </label>
            {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <File size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    leftIcon={<Trash2 size={14} />}
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploadSection;