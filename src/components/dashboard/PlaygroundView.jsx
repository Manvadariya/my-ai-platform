import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select'; // <-- IMPORT THE NEW COMPONENT
import { PaperPlaneTilt, Stop, Robot, User, Trash, Gear } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAppContext } from '../../context/AppContext';
import { apiService } from '../../lib/apiService';

export function PlaygroundView() {
  const { playgroundMessages, setPlaygroundMessages, dataSources } = useAppContext();
  const messages = Array.isArray(playgroundMessages) ? playgroundMessages : [];
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // This state now holds an ARRAY of selected ragDocumentIds
  const [selectedRagDocumentIds, setSelectedRagDocumentIds] = useState([]); 
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const readyDataSources = useMemo(() => 
    dataSources.filter(ds => ds.status === 'ready'), 
    [dataSources]
  );
  
  // Format the sources for the MultiSelect component
  const multiSelectOptions = useMemo(() => 
    readyDataSources.map(ds => ({
      value: ds.ragDocumentId,
      label: ds.name,
    })),
    [readyDataSources]
  );
  
  // If any selected documents are deleted, remove them from the selection
  useEffect(() => {
    const availableIds = new Set(readyDataSources.map(ds => ds.ragDocumentId));
    const newSelectedIds = selectedRagDocumentIds.filter(id => availableIds.has(id));
    if (newSelectedIds.length < selectedRagDocumentIds.length) {
        setSelectedRagDocumentIds(newSelectedIds);
    }
  }, [readyDataSources, selectedRagDocumentIds]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;
    
    // Check if at least one document is selected
    if (selectedRagDocumentIds.length === 0) {
      toast.error("Please select at least one Knowledge Base source to chat with.");
      return;
    }

    const userMessage = { id: `msg_${Date.now()}`, type: 'user', content: currentMessage.trim(), timestamp: new Date().toISOString() };
    
    const newMessages = [...messages, userMessage];
    setPlaygroundMessages(newMessages);
    const question = currentMessage.trim();
    setCurrentMessage('');
    setIsTyping(true);

    try {
      const chatData = {
        question: question,
        documentIds: selectedRagDocumentIds, // Pass the array of selected IDs
      };

      const response = await apiService.sendMessageToRAG(chatData);
      
      const assistantMessage = {
          id: `msg_${Date.now() + 1}`,
          type: 'assistant',
          content: response.answer,
          timestamp: new Date().toISOString(),
      };
      setPlaygroundMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      toast.error(`Error from AI: ${error.message}`);
      const errorMessage = { id: `err_${Date.now()}`, type: 'assistant', content: 'Sorry, I ran into an error. Please try again.', timestamp: new Date().toISOString() };
      setPlaygroundMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearConversation = () => { setPlaygroundMessages([]); toast.success('Conversation cleared'); };
  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="flex-1 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl font-bold tracking-tight">AI Playground</h1><p className="text-muted-foreground mt-1">Test your AI against your Knowledge Base</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearConversation}><Trash size={16} className="mr-2" />Clear</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-4"><CardTitle className="text-lg flex items-center gap-2"><Gear size={20} />Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dataSource">Knowledge Base</Label>
              {/* --- REPLACE <Select> WITH <MultiSelect> --- */}
              <MultiSelect
                options={multiSelectOptions}
                selected={selectedRagDocumentIds}
                onChange={setSelectedRagDocumentIds}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground pt-1">
                Select one or more documents to provide context for your chat.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6"><div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="space-y-6 max-w-md">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"><Robot size={24} className="text-primary" /></div>
                    <div><p className="text-lg font-medium">Start a conversation</p><p className="text-sm text-muted-foreground mb-4">Select one or more documents and ask a question to begin.</p></div>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.type === 'assistant' && (<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><Robot size={16} className="text-primary" /></div>)}
                      <div className={`max-w-[70%]`}>
                        <div className={`rounded-2xl px-4 py-3 ${message.type === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'}`}><p className="whitespace-pre-wrap">{message.content}</p></div>
                      </div>
                      {message.type === 'user' && (<div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1"><User size={16} className="text-secondary-foreground" /></div>)}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <AnimatePresence>
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"><Robot size={16} className="text-primary" /></div>
                    <div className="bg-muted rounded-2xl px-4 py-3"><div className="flex space-x-1"><div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div><div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div></div></div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div></ScrollArea>
            <div className="border-t p-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Textarea ref={inputRef} placeholder="Ask a question about your selected document(s)..." value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyDown={handleKeyPress} className="min-h-[60px] max-h-32 resize-none" disabled={isTyping} />
                </div>
                <Button onClick={sendMessage} disabled={!currentMessage.trim() || isTyping} size="lg" className="self-end" variant={isTyping ? "secondary" : "default"}>
                  {isTyping ? <Stop size={18} /> : <PaperPlaneTilt size={18} />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}