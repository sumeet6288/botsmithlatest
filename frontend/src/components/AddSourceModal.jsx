import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Upload, Link2, FileText, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { sourceAPI, plansAPI } from '../utils/api';

const AddSourceModal = ({ isOpen, onClose, chatbotId, onSuccess, onUpgradeRequired }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [fileData, setFileData] = useState(null);
  const [urlData, setUrlData] = useState('');
  const [textData, setTextData] = useState({ name: '', content: '' });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast({ 
          title: 'Error', 
          description: 'File size must be less than 100MB', 
          variant: 'destructive' 
        });
        return;
      }
      setFileData(file);
    }
  };

  const handleAddFile = async () => {
    if (!fileData) {
      toast({ title: 'Error', description: 'Please select a file', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    setProcessingProgress(0);
    
    try {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      await sourceAPI.uploadFile(chatbotId, fileData);
      
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      // Simulate processing progress
      toast({ title: 'Success', description: 'File uploaded successfully. Processing...' });
      
      const processingInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(processingInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Wait a bit for processing simulation
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(processingInterval);
      setProcessingProgress(100);
      
      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setFileData(null);
      setUploadProgress(0);
      setProcessingProgress(0);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadProgress(0);
      setProcessingProgress(0);
      
      // Check if it's a limit error
      if (error.response?.status === 403 && error.response?.data?.detail?.upgrade_required) {
        const detail = error.response.data.detail;
        if (onUpgradeRequired) {
          onUpgradeRequired('file_uploads', detail.current, detail.max);
        }
        onClose();
        return;
      }
      
      let errorMessage = 'Failed to upload file';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg).join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.detail.message) {
          errorMessage = error.response.data.detail.message;
        }
      }
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrl = async () => {
    if (!urlData) {
      toast({ title: 'Error', description: 'Please enter a URL', variant: 'destructive' });
      return;
    }
    
    // Basic URL validation
    try {
      new URL(urlData);
    } catch {
      toast({ title: 'Error', description: 'Please enter a valid URL', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    setProcessingProgress(0);
    
    try {
      // Simulate scraping progress
      const scrapingInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(scrapingInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 400);
      
      await sourceAPI.addWebsite(chatbotId, urlData);
      
      clearInterval(scrapingInterval);
      setProcessingProgress(100);
      
      toast({ title: 'Success', description: 'Website URL added successfully. Scraping completed!' });
      
      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUrlData('');
      setProcessingProgress(0);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding URL:', error);
      setProcessingProgress(0);
      let errorMessage = 'Failed to add website';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg).join(', ');
        } else if (typeof error.response.data.detail === 'object') {
          // Handle object with message field (e.g., plan limit errors)
          errorMessage = error.response.data.detail.message || JSON.stringify(error.response.data.detail);
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddText = async () => {
    if (!textData.name || !textData.content) {
      toast({ title: 'Error', description: 'Please provide both name and content', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      await sourceAPI.addText(chatbotId, textData.name, textData.content);
      toast({ title: 'Success', description: 'Text content added successfully' });
      setTextData({ name: '', content: '' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding text:', error);
      let errorMessage = 'Failed to add text';
      if (error.response?.data?.detail) {
        // Handle both string and array formats from FastAPI
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => err.msg).join(', ');
        } else if (typeof error.response.data.detail === 'object') {
          // Handle object with message field (e.g., plan limit errors)
          errorMessage = error.response.data.detail.message || JSON.stringify(error.response.data.detail);
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Training Source</DialogTitle>
          <DialogDescription>Add data to train your AI chatbot</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="url">Website URL</TabsTrigger>
            <TabsTrigger value="text">Text Content</TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-sm text-gray-600">Click to upload or drag and drop</span>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.csv"
                />
              </Label>
              <p className="text-xs text-gray-500 mt-2">Supported: PDF, DOCX, TXT, XLSX, CSV (Max 100MB)</p>
              {fileData && (
                <p className="text-sm text-gray-700 mt-4 font-medium">Selected: {fileData.name}</p>
              )}
            </div>
            
            {/* Upload Progress */}
            {loading && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading file...</span>
                  <span className="font-semibold text-purple-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3 bg-purple-100" />
              </div>
            )}
            
            {/* Processing Progress */}
            {loading && uploadProgress === 100 && processingProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Processing file...</span>
                  <span className="font-semibold text-purple-600">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-3 bg-green-100" />
              </div>
            )}
            
            <Button onClick={handleAddFile} className="w-full" disabled={!fileData || loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {uploadProgress < 100 ? 'Uploading...' : 'Processing...'}</> : 'Upload File'}
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label>Website URL</Label>
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-gray-400" />
                <Input
                  placeholder="https://example.com"
                  value={urlData}
                  onChange={(e) => setUrlData(e.target.value)}
                />
              </div>
              <p className="text-xs text-gray-500">We'll scrape and extract text content from this page</p>
            </div>
            
            {/* Scraping Progress */}
            {loading && processingProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Scraping website...</span>
                  <span className="font-semibold text-blue-600">{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-3 bg-blue-100" />
              </div>
            )}
            
            <Button onClick={handleAddUrl} className="w-full" disabled={!urlData || loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scraping...</> : 'Add Website'}
            </Button>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Content Name</Label>
                <Input
                  placeholder="e.g., Product Information"
                  value={textData.name}
                  onChange={(e) => setTextData({ ...textData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Paste your text content here..."
                  value={textData.content}
                  onChange={(e) => setTextData({ ...textData, content: e.target.value })}
                  rows={8}
                />
              </div>
            </div>
            <Button onClick={handleAddText} className="w-full" disabled={!textData.name || !textData.content || loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</> : 'Add Text Content'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddSourceModal;