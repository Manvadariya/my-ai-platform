import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  PaperPlaneTilt,
  Stop,
  Robot,
  User,
  Trash,
  Copy,
  Download,
  Gear,
  Lightning,
  ChatCircle,
  Timer,
  Sparkle,
  ArrowLeft
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ConversationTemplates } from './playground/ConversationTemplates';
import { useAppContext } from '../../context/AppContext';

export function PlaygroundView() {
  // Extract and normalize messages as an array
  const { messages: rawMessages, setMessages } = useAppContext();
  const messages = Array.isArray(rawMessages) ? rawMessages : [];
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [abortController, setAbortController] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [modelConfig, setModelConfig] = useState({
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2048,
    systemPrompt: 'You are a helpful AI assistant.'
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sampleConversations = Array.isArray(activeTemplate?.sampleConversations)
    ? activeTemplate.sampleConversations
    : [];
  const tags = Array.isArray(activeTemplate?.tags)
    ? activeTemplate.tags
    : [];
  const defaultStarters = [
    "Hello! How can you help me today?",
    "What are your capabilities?",
    "Can you help me with code review?",
    "Explain quantum computing in simple terms"
  ];

  const conversationStarters = useMemo(() => {
    const validStarters = sampleConversations
      .filter(conv => conv && typeof conv.user === 'string' && conv.user.trim())
      .map(conv => conv.user);
    return validStarters.length > 0 ? validStarters : defaultStarters;
  }, [sampleConversations]);

  const hasSampleConversations =
    sampleConversations.length > 0 &&
    sampleConversations.some(conv => conv && typeof conv.user === 'string' && conv.user.trim());

  const sendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return;
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);
    const controller = new AbortController();
    setAbortController(controller);
    const startTime = Date.now();
    setTimeout(() => {
      if (controller.signal.aborted) {
        setIsTyping(false);
        setAbortController(null);
        return;
      }
      const duration = Date.now() - startTime;
      const mockResponse = `This is a simulated AI response based on your system prompt: "${modelConfig.systemPrompt}". You asked: "${userMessage.content}".`;
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: mockResponse,
        timestamp: new Date(),
        tokens: Math.ceil(mockResponse.length / 4),
        duration
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      setAbortController(null);
    }, 1500);
  };

  const stopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsTyping(false);
      setAbortController(null);
      toast.info('Generation stopped.');
    }
  };

  const clearConversation = () => {
    setMessages([]);
    toast.success('Conversation cleared');
  };

  const exportConversation = () => {
    const exportData = { messages, config: modelConfig, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playground-conversation-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Conversation exported');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDuration = (ms) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`);

  const handleTemplateSelect = (template) => {
    setActiveTemplate(template);
    setModelConfig(prev => ({ ...prev, systemPrompt: template.systemPrompt }));
    setShowTemplates(false);
    toast.success(`Applied "${template.name}" template`);
  };

  const startConversation = (message) => {
    setCurrentMessage(message);
    inputRef.current?.focus();
  };

  const resetTemplate = () => {
    setActiveTemplate(null);
    setModelConfig(prev => ({ ...prev, systemPrompt: 'You are a helpful AI assistant.' }));
    setMessages([]);
    toast.success('Reset to default assistant');
  };

  const startWithSampleConversation = () => {
    if (hasSampleConversations) {
      const sample = sampleConversations.find(
        conv => conv && typeof conv.user === 'string' && conv.user.trim()
      );
      if (sample) {
        setCurrentMessage(sample.user);
        inputRef.current?.focus();
      }
    }
  };

  if (showTemplates) {
    return (
      <div className="flex-1 max-w-7xl mx-auto p-6">
        <ConversationTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">AI Playground</h1>
            {activeTemplate && (
              <div className="flex items-center gap-2">
                <Separator orientation="vertical" className="h-6" />
                <Badge variant="secondary" className="flex items-center gap-1">
                  {activeTemplate.icon}
                  {activeTemplate.name}
                </Badge>
              </div>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {activeTemplate ? `Testing ${activeTemplate.name} - ${activeTemplate.description}` : "Test and experiment with your AI models in real-time"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)} className="flex items-center gap-2">
            <Sparkle size={16} /> Templates
          </Button>
          {activeTemplate && (
            <Button variant="outline" size="sm" onClick={resetTemplate}>
              <ArrowLeft size={16} className="mr-2" /> Reset
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={exportConversation}>
            <Download size={16} className="mr-2" />Export
          </Button>
          <Button variant="outline" size="sm" onClick={clearConversation}>
            <Trash size={16} className="mr-2" />Clear
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gear size={20} />Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={modelConfig.model} onValueChange={(value) => setModelConfig(prev => ({ ...prev, model: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature: {modelConfig.temperature}</Label>
              <Slider value={[modelConfig.temperature]} onValueChange={([value]) => setModelConfig(prev => ({ ...prev, temperature: value }))} max={2} min={0} step={0.1} />
              <div className="flex justify-between text-xs text-muted-foreground"><span>Conservative</span><span>Creative</span></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxTokens">Max Tokens: {modelConfig.maxTokens}</Label>
              <Slider value={[modelConfig.maxTokens]} onValueChange={([value]) => setModelConfig(prev => ({ ...prev, maxTokens: value }))} max={4096} min={1} step={1} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                {activeTemplate && <Badge variant="outline" className="text-xs">Template Active</Badge>}
              </div>
              <Textarea
                placeholder="Enter system prompt..."
                value={modelConfig.systemPrompt}
                onChange={(e) => setModelConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
                className="min-h-[100px] resize-none"
                disabled={!!activeTemplate}
              />
              {activeTemplate && <p className="text-xs text-muted-foreground">System prompt is managed by the active template.</p>}
            </div>
            {activeTemplate && (
              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center gap-2">{activeTemplate.icon}<Label className="text-sm font-medium">{activeTemplate.name}</Label></div>
                <p className="text-xs text-muted-foreground">{activeTemplate.description}</p>
                <div className="flex flex-wrap gap-1">{tags.slice(0, 3).map(tag => (<Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>))}</div>
                {hasSampleConversations && (
                  <Button variant="outline" size="sm" onClick={startWithSampleConversation} className="w-full text-xs">
                    Try Sample Conversation
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ChatCircle size={20} />Conversation
              </CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="gap-1"><Lightning size={12} />{messages.length} messages</Badge>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Ready</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div className="space-y-6 max-w-md">
                      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        {activeTemplate ? activeTemplate.icon : <Robot size={24} className="text-primary" />}
                      </div>
                      <div>
                        <p className="text-lg font-medium">{activeTemplate ? `Start chatting with ${activeTemplate.name}` : 'Start a conversation'}</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {activeTemplate ? `Try one of these starters for ${activeTemplate.name}` : "Type a message or try a starter below"}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {conversationStarters.map((starter, index) => (
                          <Button key={index} variant="outline" className="text-left justify-start h-auto p-3 whitespace-normal" onClick={() => startConversation(starter)}>
                            {starter}
                          </Button>
                        ))}
                      </div>
                      {!activeTemplate && (
                        <div className="pt-4 border-t">
                          <Button onClick={() => setShowTemplates(true)} className="flex items-center gap-2">
                            <Sparkle size={16} />Browse AI Assistant Templates
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.type === 'assistant' && (
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            {activeTemplate
                              ? (<div className="text-primary [&>svg]:w-4 [&>svg]:h-4">{activeTemplate.icon}</div>)
                              : (<Robot size={16} className="text-primary" />)
                            }
                          </div>
                        )}
                        <div className={`max-w-[70%] ${message.type === 'user' ? 'order-1' : ''}`}>
                          <div className={`rounded-2xl px-4 py-3 ${message.type === 'user' ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'}`}>
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                            {message.tokens && (<><span>•</span><span>{message.tokens} tokens</span></>)}
                            {message.duration && (<><span>•</span><span className="flex items-center gap-1"><Timer size={10} />{formatDuration(message.duration)}</span></>)}
                            <Button variant="ghost" size="sm" className="h-auto p-1" onClick={() => { navigator.clipboard.writeText(message.content); toast.success('Message copied'); }}>
                              <Copy size={10} />
                            </Button>
                          </div>
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <User size={16} className="text-secondary-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {activeTemplate
                          ? (<div className="text-primary [&>svg]:w-4 [&>svg]:h-4">{activeTemplate.icon}</div>)
                          : (<Robot size={16} className="text-primary" />)
                        }
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="border-t p-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Textarea
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-[60px] max-h-32 resize-none"
                    disabled={isTyping}
                  />
                </div>
                <Button onClick={isTyping ? stopGeneration : sendMessage}
                  disabled={!isTyping && !currentMessage.trim()}
                  size="lg"
                  className="self-end"
                  variant={isTyping ? "destructive" : "default"}
                >
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
