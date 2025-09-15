import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  FileTxt, 
  FileDoc, 
  FileCsv, 
  FilePdf,
  Link,
  Trash,
  Download,
  Eye,
  CloudArrowUp,
  CheckCircle,
  Clock,
  X,
  FileText
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

export function DataView({ user }) {
  const { dataSources, setDataSources } = useAppContext();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [isUrlDialogOpen, setIsUrlDialogOpen] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [highlightedFileId, setHighlightedFileId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const highlightId = sessionStorage.getItem('highlightFileId');
    if (highlightId) {
      setHighlightedFileId(highlightId);
      sessionStorage.removeItem('highlightFileId');
      
      setTimeout(() => {
        const element = document.getElementById(`file-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      setTimeout(() => setHighlightedFileId(null), 3000);
    }
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type not supported: ${file.name}`);
        return;
      }

      const newDataSource = {
        id: `file_${Date.now()}_${Math.random()}`,
        name: file.name,
        type: 'file',
        format: getFileFormat(file.type),
        size: file.size,
        status: 'processing',
        uploadedAt: new Date().toISOString(),
        metadata: {}
      };

      setDataSources(current => [...current, newDataSource]);

      setTimeout(() => {
        setDataSources(current => 
          current.map(ds => 
            ds.id === newDataSource.id 
              ? {
                  ...ds,
                  status: 'ready',
                  metadata: {
                    pages: Math.floor(Math.random() * 50) + 1,
                    words: Math.floor(Math.random() * 10000) + 500,
                    characters: Math.floor(Math.random() * 50000) + 2500
                  }
                }
              : ds
          )
        );
        toast.success(`${file.name} processed successfully!`);
      }, 2000 + Math.random() * 3000);
    });
    setIsUploadDialogOpen(false);
  };

  const getFileFormat = (mimeType) => {
    switch (mimeType) {
      case 'application/pdf': return 'pdf';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return 'docx';
      case 'text/plain': return 'txt';
      case 'text/csv': return 'csv';
      default: return 'txt';
    }
  };

  const handleAddTextContent = () => {
    if (!textContent.trim()) return;
    const newDataSource = {
      id: `text_${Date.now()}`,
      name: `Text Content ${new Date().toLocaleDateString()}`,
      type: 'text',
      format: 'text',
      size: textContent.length,
      status: 'ready',
      uploadedAt: new Date().toISOString(),
      content: textContent,
      metadata: {
        words: textContent.split(/\s+/).length,
        characters: textContent.length
      }
    };
    setDataSources(current => [...current, newDataSource]);
    setTextContent('');
    setIsTextDialogOpen(false);
    toast.success('Text content added successfully!');
  };

  const handleAddUrlContent = async () => {
    if (!urlContent.trim()) return;
    const newDataSource = {
      id: `url_${Date.now()}`,
      name: `Web Content: ${urlContent}`,
      type: 'url',
      format: 'webpage',
      size: 0,
      status: 'processing',
      uploadedAt: new Date().toISOString(),
      url: urlContent,
      metadata: {}
    };
    setDataSources(current => [...current, newDataSource]);
    setUrlContent('');
    setIsUrlDialogOpen(false);

    setTimeout(() => {
      setDataSources(current => 
        current.map(ds => 
          ds.id === newDataSource.id 
            ? {
                ...ds,
                status: 'ready',
                size: Math.floor(Math.random() * 100000) + 10000,
                metadata: {
                  words: Math.floor(Math.random() * 5000) + 1000,
                  characters: Math.floor(Math.random() * 25000) + 5000
                }
              }
            : ds
        )
      );
      toast.success('URL content scraped successfully!');
    }, 3000 + Math.random() * 2000);
  };

  const handleDeleteDataSource = (id) => {
    setDataSources(current => current.filter(ds => ds.id !== id));
    toast.success('Data source deleted');
  };

  const getFileIcon = (format) => {
    switch (format) {
      case 'pdf': return <FilePdf size={20} className="text-red-500" />;
      case 'docx': return <FileDoc size={20} className="text-blue-500" />;
      case 'txt': case 'text': return <FileTxt size={20} className="text-gray-500" />;
      case 'csv': return <FileCsv size={20} className="text-green-500" />;
      case 'webpage': return <Link size={20} className="text-purple-500" />;
      default: return <FileText size={20} className="text-gray-500" />;
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'processing': return { label: 'Processing', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
      case 'ready': return { label: 'Ready', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
      case 'error': return { label: 'Error', color: 'bg-red-100 text-red-800 border-red-200', icon: X };
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
          <p className="text-muted-foreground">Upload and manage data sources for your AI models</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
            <DialogTrigger asChild><Button variant="outline" className="gap-2"><FileTxt size={16} />Add Text</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Text Content</DialogTitle>
                <DialogDescription>Paste or type text content directly</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="text-content">Content</Label>
                  <Textarea id="text-content" placeholder="Paste your content here..." value={textContent} onChange={(e) => setTextContent(e.target.value)} className="min-h-[200px] resize-none" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTextDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTextContent} disabled={!textContent.trim()}>Add Content</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isUrlDialogOpen} onOpenChange={setIsUrlDialogOpen}>
            <DialogTrigger asChild><Button variant="outline" className="gap-2"><Link size={16} />Scrape URL</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Scrape Website Content</DialogTitle>
                <DialogDescription>Enter a URL to scrape content from a webpage</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="url-content">Website URL</Label>
                  <Input id="url-content" placeholder="https://example.com" value={urlContent} onChange={(e) => setUrlContent(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUrlDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddUrlContent} disabled={!urlContent.trim()}>Scrape Content</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Upload size={16} />Upload Files</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>Upload documents in PDF, DOCX, TXT, or CSV format</DialogDescription>
              </DialogHeader>
              <div className="py-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                  <CloudArrowUp size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground mb-4">Supports PDF, DOCX, TXT, and CSV files up to 50MB</p>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Choose Files</Button>
                  <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.txt,.csv" onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-bold">{dataSources.length}</p>
              </div>
              <FileText size={24} className="text-primary" weight="duotone" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ready</p>
                <p className="text-2xl font-bold text-green-600">{dataSources.filter(ds => ds.status === 'ready').length}</p>
              </div>
              <CheckCircle size={24} className="text-green-600" weight="duotone" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">{dataSources.filter(ds => ds.status === 'processing').length}</p>
              </div>
              <Clock size={24} className="text-yellow-600" weight="duotone" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                <p className="text-2xl font-bold">{formatFileSize(dataSources.reduce((acc, ds) => acc + ds.size, 0))}</p>
              </div>
              <Upload size={24} className="text-primary" weight="duotone" />
            </div>
          </CardContent>
        </Card>
      </div>
      {dataSources.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center"><Upload size={32} className="text-muted-foreground" /></div>
            <div>
              <h3 className="font-semibold text-lg">No data sources yet</h3>
              <p className="text-muted-foreground">Upload files or add content to get started</p>
            </div>
            <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2"><Upload size={16} />Upload Your First File</Button>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
            <CardDescription>Manage your uploaded files and content</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {dataSources.map((dataSource) => {
                    const statusConfig = getStatusConfig(dataSource.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <motion.tr
                        key={dataSource.id}
                        id={`file-${dataSource.id}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`${highlightedFileId === dataSource.id ? 'bg-primary/10 animate-pulse border-l-4 border-l-primary' : ''}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getFileIcon(dataSource.format)}
                            <div>
                              <p className="font-medium">{dataSource.name}</p>
                              {dataSource.metadata.words && <p className="text-xs text-muted-foreground">{dataSource.metadata.words.toLocaleString()} words</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{dataSource.format.toUpperCase()}</Badge></TableCell>
                        <TableCell><Badge variant="outline" className={`${statusConfig.color} border`}><StatusIcon size={12} className="mr-1" />{statusConfig.label}</Badge></TableCell>
                        <TableCell>{formatFileSize(dataSource.size)}</TableCell>
                        <TableCell>{new Date(dataSource.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm"><Eye size={14} /></Button>
                            <Button variant="ghost" size="sm"><Download size={14} /></Button>
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