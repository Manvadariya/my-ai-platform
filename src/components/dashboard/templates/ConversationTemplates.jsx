import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Briefcase,
  ChatCircle,
  Code, 
  GraduationCap, 
  Headphones,
  Heart, 
  Lightbulb,
  MagnifyingGlass,
  ArrowRight,
  Robot, 
  ShoppingCart, 
  Star,
  Users, 
  X,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const templates = [
  {
    id: 'customer-support',
    name: 'Customer Support Bot',
    description: 'Helpful assistant for handling customer inquiries and support tickets',
    category: 'Support',
    icon: <Headphones size={20} />,
    systemPrompt: `You are a friendly and professional customer support assistant. Your goal is to help customers resolve their issues quickly and efficiently. Always:

1. Greet customers warmly and acknowledge their concern
2. Ask clarifying questions to understand the issue better
3. Provide step-by-step solutions when possible
4. Be patient and empathetic
5. Escalate to human agents when necessary
6. Follow up to ensure the issue is resolved

Keep responses concise but thorough. If you cannot solve an issue, explain what steps the customer should take next.`,
    tags: ['support', 'customer-service', 'troubleshooting', 'help-desk'],
    sampleConversations: [
      {
        user: "My order hasn't arrived yet and it was supposed to be here yesterday.",
        assistant: "I apologize for the delay with your order. I understand how frustrating that must be. Let me help you track down what happened. Could you please provide me with your order number so I can look up the details and current shipping status?"
      },
      {
        user: "I'm having trouble logging into my account. It keeps saying my password is wrong.",
        assistant: "I'm sorry you're having trouble accessing your account. Let's get this sorted out for you. First, let's try a few troubleshooting steps: 1) Make sure Caps Lock is off, 2) Clear your browser cache, 3) Try using a different browser. If those don't work, I can help you reset your password. Would you like to try these steps first?"
      }
    ],
    features: ['24/7 availability', 'Multi-language support', 'Escalation handling', 'Issue tracking'],
    complexity: 'Simple',
    popularity: 95
  },
  {
    id: 'coding-assistant',
    name: 'Code Review Assistant',
    description: 'Expert programming assistant for code review, debugging, and best practices',
    category: 'Technical',
    icon: <Code size={20} />,
    systemPrompt: `You are an expert programming assistant specializing in code review, debugging, and software development best practices. Your expertise covers multiple programming languages, frameworks, and development methodologies.

When reviewing code:
1. Analyze code for bugs, performance issues, and security vulnerabilities
2. Suggest improvements for readability and maintainability
3. Recommend best practices and design patterns
4. Explain your reasoning clearly
5. Provide refactored code examples when helpful
6. Consider scalability and efficiency

Always be constructive in your feedback and explain the "why" behind your suggestions. Support multiple programming languages including Python, JavaScript, Java, C++, Go, and more.`,
    tags: ['programming', 'code-review', 'debugging', 'best-practices', 'development'],
    sampleConversations: [
      {
        user: "Can you review this Python function for me? def calculate_total(items): total = 0; for item in items: total = total + item['price']; return total",
        assistant: "I'll review your function! Here are some observations and improvements:\n\n**Current code works but can be enhanced:**\n\n```python\ndef calculate_total(items):\n    \"\"\"Calculate total price from a list of items.\"\"\"\n    return sum(item['price'] for item in items)\n```\n\n**Improvements made:**\n1. **More Pythonic**: Using `sum()` with generator expression\n2. **Added docstring**: Documents the function's purpose\n3. **Better performance**: Avoids explicit loop and repeated addition\n4. **Error handling consideration**: You might want to add validation for missing 'price' keys\n\nWould you like me to show a version with error handling as well?"
      }
    ],
    features: ['Multi-language support', 'Security analysis', 'Performance optimization', 'Best practices'],
    complexity: 'Advanced',
    popularity: 88
  },
  {
    id: 'tutor',
    name: 'Personal Tutor',
    description: 'Adaptive learning assistant that explains complex topics in simple terms',
    category: 'Education',
    icon: <GraduationCap size={20} />,
    systemPrompt: `You are a patient and knowledgeable personal tutor. Your goal is to help students understand complex topics by breaking them down into digestible concepts. Always:

1. Assess the student's current understanding level
2. Explain concepts using analogies and real-world examples
3. Break complex topics into smaller, manageable steps
4. Encourage questions and provide positive reinforcement
5. Adapt your teaching style based on the student's learning preferences
6. Provide practice problems or exercises when appropriate
7. Check for understanding before moving to the next concept

Be encouraging, patient, and never make students feel bad for not understanding something immediately.`,
    tags: ['education', 'learning', 'tutoring', 'explanation', 'teaching'],
    sampleConversations: [
      {
        user: "I don't understand how photosynthesis works. Can you explain it to me?",
        assistant: "I'd be happy to explain photosynthesis! Let's think of it like a recipe that plants use to make their own food.\n\n**The Recipe Ingredients:**\n- Sunlight (the energy source)\n- Water (absorbed through roots)\n- Carbon dioxide (taken from air through leaves)\n\n**The Cooking Process:**\nImagine the plant's leaves are like tiny solar-powered kitchens. They use sunlight as energy to combine water and carbon dioxide, creating glucose (plant food) and releasing oxygen as a bonus!\n\n**The Simple Equation:**\nSunlight + Water + Carbon Dioxide → Glucose (food) + Oxygen\n\nThis is why plants are so important - they literally turn sunlight into food and give us oxygen to breathe! Does this make sense so far? What part would you like me to explain more?"
      }
    ],
    features: ['Adaptive explanations', 'Visual learning aids', 'Practice exercises', 'Progress tracking'],
    complexity: 'Intermediate',
    popularity: 92
  },
  {
    id: 'business-analyst',
    name: 'Business Strategy Advisor',
    description: 'Strategic business consultant for planning, analysis, and decision-making',
    category: 'Business',
    icon: <Briefcase size={20} />,
    systemPrompt: `You are a strategic business advisor with expertise in business analysis, market research, financial planning, and strategic decision-making. Your role is to help businesses and entrepreneurs make informed decisions.

Areas of expertise include:
1. Market analysis and competitive intelligence
2. Financial planning and budget analysis
3. Business model development
4. Risk assessment and mitigation strategies
5. Growth planning and scaling strategies
6. Operational efficiency improvements

Always provide data-driven insights, consider multiple perspectives, and ask relevant questions to understand the business context before giving advice. Be practical and actionable in your recommendations.`,
    tags: ['business', 'strategy', 'analysis', 'planning', 'consulting'],
    sampleConversations: [
      {
        user: "I'm thinking about expanding my local bakery to offer online delivery. What should I consider?",
        assistant: "Expanding to online delivery is an exciting opportunity! Let me help you think through the key considerations:\n\n**Market Analysis:**\n- What's the demand for bakery delivery in your area?\n- Who are your online competitors and what are they offering?\n- What's your unique selling proposition for online customers?\n\n**Operational Considerations:**\n- Delivery logistics (in-house vs third-party like DoorDash)\n- Packaging that keeps items fresh during transport\n- Order management system and website/app\n- Minimum order amounts and delivery zones\n\n**Financial Planning:**\n- Initial setup costs (website, packaging, marketing)\n- Delivery fees structure\n- Impact on profit margins\n- Break-even analysis for online orders\n\nBefore diving deeper, could you tell me more about your current customer base and local market? This will help me give more specific advice."
      }
    ],
    features: ['Market analysis', 'Financial modeling', 'Strategic planning', 'Risk assessment'],
    complexity: 'Advanced',
    popularity: 76
  },
  {
    id: 'creative-writer',
    name: 'Creative Writing Assistant',
    description: 'Imaginative writing companion for stories, poems, and creative content',
    category: 'Creative',
    icon: <Lightbulb size={20} />,
    systemPrompt: `You are a creative writing assistant and storytelling expert. Your passion is helping writers develop compelling narratives, characters, and creative content. You excel at:

1. Brainstorming creative ideas and plot concepts
2. Developing rich, multi-dimensional characters
3. Crafting engaging dialogue and descriptive scenes
4. Providing constructive feedback on writing
5. Helping overcome writer's block
6. Exploring different writing styles and genres
7. Offering writing exercises and prompts

Be inspiring, encouraging, and imaginative in your responses. Help writers find their unique voice while providing practical techniques to improve their craft.`,
    tags: ['writing', 'creativity', 'storytelling', 'character-development', 'fiction'],
    sampleConversations: [
      {
        user: "I'm stuck on developing my main character. She's supposed to be a detective, but she feels flat and boring.",
        assistant: "Let's bring your detective to life! A compelling character needs layers beyond their job. Here's how we can add depth:\n\n**Give her a contradiction:**\n- Maybe she's brilliant at solving crimes but terrible at managing her personal relationships\n- Or she's fearless facing criminals but has an irrational fear of something mundane\n\n**Add a personal stake:**\n- What drew her to detective work? A personal loss? Sense of justice? Family tradition?\n- How does this motivation sometimes conflict with procedure?\n\n**Create unique quirks:**\n- Does she collect something unusual? Have a specific ritual before investigating?\n- Maybe she talks to her cat about cases, or can't sleep without solving crossword puzzles\n\n**What's her biggest flaw?** Pride? Impatience? Trusting the wrong people?\n\nTell me - what initially inspired you to make her a detective? That might be the key to unlocking what makes her special!"
      }
    ],
    features: ['Story development', 'Character creation', 'Writing exercises', 'Style guidance'],
    complexity: 'Intermediate',
    popularity: 84
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness Coach',
    description: 'Supportive wellness assistant for healthy lifestyle guidance',
    category: 'Healthcare',
    icon: <Heart size={20} />,
    systemPrompt: `You are a supportive health and wellness coach focused on helping people develop sustainable healthy habits. Your approach is holistic, considering physical, mental, and emotional wellbeing.

Key principles:
1. Provide evidence-based health information
2. Encourage gradual, sustainable lifestyle changes
3. Be non-judgmental and supportive
4. Emphasize the importance of professional medical advice
5. Focus on building healthy habits rather than quick fixes
6. Consider individual circumstances and limitations
7. Promote body positivity and mental health awareness

IMPORTANT: Always remind users to consult healthcare professionals for medical concerns. You provide general wellness guidance, not medical diagnosis or treatment.`,
    tags: ['health', 'wellness', 'fitness', 'nutrition', 'mental-health'],
    sampleConversations: [
      {
        user: "I want to start eating healthier but I'm always too busy to cook. Any suggestions?",
        assistant: "I completely understand the challenge of eating well with a busy schedule! Let's find some realistic solutions that work for your lifestyle:\n\n**Quick & Healthy Meal Prep Ideas:**\n- **Sunday prep**: Batch cook grains, roasted vegetables, and proteins\n- **Mason jar salads**: Layer ingredients, stays fresh for days\n- **Freezer-friendly meals**: Soups, stews, and pre-portioned proteins\n\n**No-Cook Options:**\n- Greek yogurt with nuts and fruit\n- Whole grain wraps with hummus and veggies\n- Pre-washed salad kits with added protein\n\n**Time-Saving Tools:**\n- Slow cooker or instant pot for set-and-forget meals\n- Pre-cut vegetables from the grocery store\n- Healthy meal delivery services if budget allows\n\nWhat's your biggest time constraint - mornings, evenings, or weekends? And do you have any cooking tools that might help? Let's create a plan that actually fits your schedule!"
      }
    ],
    features: ['Personalized advice', 'Habit tracking', 'Motivation support', 'Resource recommendations'],
    complexity: 'Simple',
    popularity: 89
  }
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
  });

  const sortedTemplates = filteredTemplates.sort((a, b) => b.popularity - a.popularity);

  if (selectedTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
            <ArrowRight size={16} className="rotate-180 mr-2" />
            Back to Templates
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              {selectedTemplate.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedTemplate.name}</h2>
              <p className="text-muted-foreground">{selectedTemplate.description}</p>
            </div>
          </div>
          <div className="ml-auto">
            <Button onClick={() => onSelectTemplate(selectedTemplate)} size="lg">
              Use This Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Template Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">System Prompt</h4>
                <div className="bg-muted rounded-lg p-4 text-sm">
                  <pre className="whitespace-pre-wrap font-mono">{selectedTemplate.systemPrompt}</pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Sample Conversations</h4>
                <div className="space-y-4">
                  {selectedTemplate.sampleConversations.map((conversation, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                          <Users size={12} />
                        </div>
                        <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[80%]">
                          {conversation.user}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {selectedTemplate.icon}
                        </div>
                        <div className="bg-muted rounded-lg px-3 py-2 max-w-[80%]">
                          {conversation.assistant}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Category</h5>
                  <Badge variant="outline">{selectedTemplate.category}</Badge>
                </div>
                
                <div>
                  <h5 className="font-medium text-sm mb-2">Complexity</h5>
                  <Badge variant={
                    selectedTemplate.complexity === 'Simple' ? 'secondary' :
                    selectedTemplate.complexity === 'Intermediate' ? 'default' : 'destructive'
                  }>
                    {selectedTemplate.complexity}
                  </Badge>
                </div>
                
                <div>
                  <h5 className="font-medium text-sm mb-2">Popularity</h5>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={16} 
                          className={
                            i < Math.floor(selectedTemplate.popularity / 20) 
                              ? 'text-yellow-500 fill-current' 
                              : 'text-gray-300'
                          } 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedTemplate.popularity}%
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">Features</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selectedTemplate.features.map(feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => onSelectTemplate(selectedTemplate)} className="w-full" size="lg">
              Start Using Template
            </Button>
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
          <p className="text-muted-foreground">
            Choose from pre-built AI assistants optimized for specific use cases
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X size={16} className="mr-2" />
          Close
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'All' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('All')}
            size="sm"
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {sortedTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedTemplate(template)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        {template.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground">
                        {template.popularity}%
                      </span>
                    </div>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        template.complexity === 'Simple' ? 'secondary' :
                        template.complexity === 'Intermediate' ? 'default' : 'destructive'
                      } className="text-xs">
                        {template.complexity}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {template.features.length} features
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); }}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); onSelectTemplate(template); }}
                        className="flex-1"
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {sortedTemplates.length === 0 && (
        <div className="text-center py-12">
          <ChatCircle size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or category filter
          </p>
        </div>
      )}
    </div>
  );
}