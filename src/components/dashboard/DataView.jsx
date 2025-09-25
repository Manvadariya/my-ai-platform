import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Upload, FileTxt, FileDoc, FilePdf, Link, Trash, Download, Eye,
  CloudArrowUp, CheckCircle, Clock, X, FileText
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { apiService } from '../../lib/apiService';

export function DataView() {
  const { dataSources, setDataSources, user } = useAppContext();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const processingFiles = dataSources.some(ds => ds.status === 'processing');
    if (!processingFiles) return;

    const intervalId = setInterval(async () => {
      try {
        const updatedSources = await apiService.getDataSources();
        setDataSources(updatedSources);
        const stillProcessing = updatedSources.some(ds => ds.status === 'processing');
        if (!stillProcessing) {
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error("Polling failed:", error);
        clearInterval(intervalId);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [dataSources, setDataSources]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFiles(e.dataTransfer.files);
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(async (file) => {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type not supported: ${file.name}`);
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      // --- REMOVED LINE ---
      // We no longer need this line: formData.append('userId', user.id);

      const tempId = `uploading_${Date.now()}_${file.name}`;
      const optimisticSource = {
        id: tempId,
        name: file.name,
        status: 'processing',
        size: file.size,
        format: file.type,
        uploadedAt: new Date().toISOString()
      };
      setDataSources(current => [optimisticSource, ...current]);
      setIsUploadDialogOpen(false);

      try {
        const response = await apiService.uploadFile(formData);
        setDataSources(current => current.map(ds => (ds.id === tempId ? response.document : ds)));
        toast.info(`${file.name} uploaded and is now being processed...`);
      } catch (error) {
        toast.error(`Upload failed for ${file.name}: ${error.message}`);
        setDataSources(current => current.filter(ds => ds.id !== tempId));
      }
    });
  };

  const handleDeleteDataSource = async (id) => {
    const originalSources = [...dataSources];
    setDataSources(current => current.filter(ds => ds.id !== id));
    try {
      await apiService.deleteDataSource(id);
      toast.success('Data source deleted.');
    } catch (error) {
      setDataSources(originalSources);
      toast.error(`Failed to delete data source: ${error.message}`);
    }
  };

  const getFileIcon = (format) => {
    if (format?.includes('pdf')) return <FilePdf size={20} className="text-red-500" />;
    if (format?.includes('word')) return <FileDoc size={20} className="text-blue-500" />;
    if (format?.includes('plain')) return <FileTxt size={20} className="text-gray-500" />;
    return <FileText size={20} className="text-gray-500" />;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'processing': return { label: 'Processing', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
      case 'ready': return { label: 'Ready', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
      case 'error': return { label: 'Error', color: 'bg-red-100 text-red-800 border-red-200', icon: X };
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: FileText };
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground">Upload and manage data sources for your AI models</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Upload size={16} />Upload Files</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>Upload documents in PDF, DOCX, or TXT format</DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                  <CloudArrowUp size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground mb-4">Supports PDF, DOCX, and TXT files</p>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Choose Files</Button>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt" onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Sources</p><p className="text-2xl font-bold">{dataSources.length}</p></div><FileText size={24} className="text-primary" weight="duotone" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Ready</p><p className="text-2xl font-bold text-green-600">{dataSources.filter(ds => ds.status === 'ready').length}</p></div><CheckCircle size={24} className="text-green-600" weight="duotone" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Processing</p><p className="text-2xl font-bold text-yellow-600">{dataSources.filter(ds => ds.status === 'processing').length}</p></div><Clock size={24} className="text-yellow-600" weight="duotone" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Size</p><p className="text-2xl font-bold">{formatFileSize(dataSources.reduce((acc, ds) => acc + (ds.size || 0), 0))}</p></div><Upload size={24} className="text-primary" weight="duotone" /></div></CardContent></Card>
      </div>
      {dataSources.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center"><Upload size={32} className="text-muted-foreground" /></div>
            <div><h3 className="font-semibold text-lg">No data sources yet</h3><p className="text-muted-foreground">Upload files to build your Knowledge Base</p></div>
            <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2"><Upload size={16} />Upload Your First File</Button>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle>Data Sources</CardTitle><CardDescription>Manage your uploaded content</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Size</TableHead><TableHead>Uploaded</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                <AnimatePresence>
                  {dataSources.map((dataSource) => {
                    const statusConfig = getStatusConfig(dataSource.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <motion.tr key={dataSource.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
                        <TableCell><div className="flex items-center gap-3">{getFileIcon(dataSource.format)}<div><p className="font-medium">{dataSource.name}</p></div></div></TableCell>
                        <TableCell><Badge variant="outline">{(dataSource.format || 'file').split('/').pop().toUpperCase()}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`${statusConfig.color} border`}><StatusIcon size={12} className="mr-1" />{statusConfig.label}</Badge></TableCell>
                        <TableCell>{formatFileSize(dataSource.size || 0)}</TableCell>
                        <TableCell>{new Date(dataSource.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteDataSource(dataSource.id)} className="text-destructive hover:text-destructive"><Trash size={14} /></Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}