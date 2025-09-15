// src/components/dashboard/playground/ConversationTemplates.jsx

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Headphones,
  Code,
  GraduationCap,
  Briefcase,
  Lightbulb,
  Heart,
  MagnifyingGlass,
  Star,
  X,
  ArrowRight,
  ChatCircle,
  Users
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const templates = [
  {
    id: 'customer-support',
    name: 'Customer Support Bot',
    description: 'Helpful assistant for handling customer inquiries and support tickets',
    category: 'Support',
    icon: <Headphones size={20} />,
    systemPrompt: `You are a friendly and professional customer support assistant. Your goal is to help customers resolve their issues quickly and efficiently. Always:\n\n1. Greet customers warmly and acknowledge their concern\n2. Ask clarifying questions to understand the issue better\n3. Provide step-by-step solutions when possible\n4. Be patient and empathetic\n5. Escalate to human agents when necessary\n6. Follow up to ensure the issue is resolved\n\nKeep responses concise but thorough. If you cannot solve an issue, explain what steps the customer should take next.`,
    tags: ['support', 'customer-service', 'troubleshooting', 'help-desk'],
    sampleConversations: [
      { user: "My order hasn't arrived yet.", assistant: "I apologize for the delay. Could you please provide your order number so I can check its status?" },
    ],
    features: ['24/7 availability', 'Escalation handling', 'Issue tracking'],
    complexity: 'Simple',
    popularity: 95
  },
  {
    id: 'coding-assistant',
    name: 'Code Review Assistant',
    description: 'Expert assistant for code review, debugging, and best practices',
    category: 'Technical',
    icon: <Code size={20} />,
    systemPrompt: `You are an expert programming assistant specializing in code review and debugging. Analyze code for bugs, performance issues, and security vulnerabilities. Suggest improvements for readability and maintainability. Provide refactored code examples when helpful.`,
    tags: ['programming', 'code-review', 'debugging', 'development'],
    sampleConversations: [
      { user: "Can you review this Python function?", assistant: "Of course. Please paste the function here, and I'll provide a detailed review focusing on best practices and potential improvements." },
    ],
    features: ['Multi-language support', 'Security analysis', 'Performance optimization'],
    complexity: 'Advanced',
    popularity: 88
  },
  // Add more templates as needed
];

const categories = Array.from(new Set(templates.map(t => t.category)));

export function ConversationTemplates({ onSelectTemplate, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.popularity - a.popularity);

  if (selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
            <ArrowRight size={16} className="rotate-180 mr-2" />
            Back to Templates
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">{selectedTemplate.icon}</div>
            <div>
              <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
              <p className="text-muted-foreground">{selectedTemplate.description}</p>
            </div>
          </div>
          <div className="ml-auto">
            <Button onClick={() => onSelectTemplate(selectedTemplate)} size="lg">Use This Template</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Template Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">System Prompt</h4>
                <div className="bg-muted rounded-lg p-4 text-sm"><pre className="whitespace-pre-wrap font-mono">{selectedTemplate.systemPrompt}</pre></div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Sample Conversations</h4>
                <div className="space-y-4">
                  {selectedTemplate.sampleConversations.map((conv, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-3">
                      <div className="flex gap-3"><div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0"><Users size={12} /></div><div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[80%]">{conv.user}</div></div>
                      <div className="flex gap-3"><div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">{selectedTemplate.icon}</div><div className="bg-muted rounded-lg px-3 py-2 max-w-[80%]">{conv.assistant}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Template Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Category</h5>
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Complexity</h5>
                  <Badge variant={selectedTemplate.complexity === 'Simple' ? 'secondary' : selectedTemplate.complexity === 'Intermediate' ? 'default' : 'destructive'}>{selectedTemplate.complexity}</Badge>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Popularity</h5>
                  <div className="flex items-center gap-2">
                    <div className="flex">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} size={16} className={i < Math.floor(selectedTemplate.popularity / 20) ? 'text-yellow-500 fill-current' : 'text-gray-300'} />))}</div>
                    <span className="text-sm text-muted-foreground">{selectedTemplate.popularity}%</span>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-1">{selectedTemplate.tags.map(tag => (<Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>))}</div>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Features</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">{selectedTemplate.features.map(feature => (<li key={feature} className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full"></div>{feature}</li>))}</ul>
                </div>
              </CardContent>
            </Card>
            <Button onClick={() => onSelectTemplate(selectedTemplate)} className="w-full" size="lg">Start Using Template</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant Templates</h1>
          <p className="text-muted-foreground">Choose from pre-built AI assistants optimized for specific use cases</p>
        </div>
        <Button variant="outline" onClick={onClose}><X size={16} className="mr-2" />Close</Button>
      </div>
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Search templates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant={selectedCategory === 'All' ? 'default' : 'outline'} onClick={() => setSelectedCategory('All')} size="sm">All</Button>
          {categories.map(category => (
            <Button key={category} variant={selectedCategory === category ? 'default' : 'outline'} onClick={() => setSelectedCategory(category)} size="sm">{category}</Button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTemplates.map((template) => (
            <motion.div key={template.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
              <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedTemplate(template)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">{template.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1"><Star size={14} className="text-yellow-500 fill-current" /><span className="text-xs text-muted-foreground">{template.popularity}%</span></div>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (<Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>))}
                      {template.tags.length > 3 && <Badge variant="secondary" className="text-xs">+{template.tags.length - 3} more</Badge>}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={template.complexity === 'Simple' ? 'secondary' : template.complexity === 'Intermediate' ? 'default' : 'destructive'} className="text-xs">{template.complexity}</Badge>
                      <div className="text-xs text-muted-foreground">{template.features.length} features</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }} className="flex-1">View Details</Button>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); onSelectTemplate(template); }} className="flex-1">Use Template</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <ChatCircle size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms or category filter</p>
        </div>
      )}
    </div>
  );
}