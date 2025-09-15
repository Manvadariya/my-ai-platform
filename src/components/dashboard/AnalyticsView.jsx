import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ChartBar, 
  TrendUp, 
  Lightning,
  Users,
  Cpu,
  CalendarBlank
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

export function AnalyticsView({ user }) {
  const [timeRange, setTimeRange] = useState('7d');
  const { projects } = useAppContext(); // Using context though not directly in JSX

  // Mock analytics data
  const apiCallsData = [
    { date: '2024-01-01', calls: 245, tokens: 12500 },
    { date: '2024-01-02', calls: 378, tokens: 18900 },
    { date: '2024-01-03', calls: 456, tokens: 22800 },
    { date: '2024-01-04', calls: 323, tokens: 16150 },
    { date: '2024-01-05', calls: 567, tokens: 28350 },
    { date: '2024-01-06', calls: 234, tokens: 11700 },
    { date: '2024-01-07', calls: 678, tokens: 33900 }
  ];

  const projectUsageData = [
    { name: 'Customer Support Bot', value: 45, calls: 1247, color: '#3b82f6' },
    { name: 'Knowledge Assistant', value: 30, calls: 832, color: '#10b981' },
    { name: 'Content Generator', value: 15, calls: 416, color: '#f59e0b' },
    { name: 'Code Helper', value: 10, calls: 277, color: '#ef4444' }
  ];

  const responseTimeData = [
    { time: '00:00', avg: 450, p95: 650 },
    { time: '04:00', avg: 320, p95: 480 },
    { time: '08:00', avg: 780, p95: 1200 },
    { time: '12:00', avg: 890, p95: 1350 },
    { time: '16:00', avg: 1020, p95: 1580 },
    { time: '20:00', avg: 670, p95: 920 }
  ];

  const metrics = [
    { title: 'Total API Calls', value: '2,847', change: '+12.5%', trend: 'up', icon: ChartBar, color: 'text-blue-600' },
    { title: 'Response Time', value: '680ms', change: '-8.2%', trend: 'down', icon: Lightning, color: 'text-green-600' },
    { title: 'Active Users', value: '156', change: '+24.1%', trend: 'up', icon: Users, color: 'text-purple-600' },
    { title: 'Token Usage', value: '142.5K', change: '+15.3%', trend: 'up', icon: Cpu, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">Monitor your AI platform performance and usage</p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <CalendarBlank size={16} className="mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.trend === 'up';
          
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendUp size={14} className={`${isPositive ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
                        <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                    <Icon size={24} className={metric.color} weight="duotone" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="projects">Project Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API Calls Over Time</CardTitle>
                <CardDescription>Daily API call volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={apiCallsData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [value.toLocaleString(), 'API Calls']}
                    />
                    <Bar dataKey="calls" fill="oklch(0.45 0.15 250)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Token Consumption</CardTitle>
                <CardDescription>Daily token usage trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={apiCallsData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value) => [value.toLocaleString(), 'Tokens']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tokens" 
                      stroke="oklch(0.65 0.12 180)" 
                      strokeWidth={3}
                      dot={{ fill: 'oklch(0.65 0.12 180)', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Analysis</CardTitle>
              <CardDescription>Average and 95th percentile response times throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value, name) => [`${value}ms`, name === 'avg' ? 'Average' : '95th Percentile']} />
                  <Line type="monotone" dataKey="avg" stroke="oklch(0.45 0.15 250)" strokeWidth={3} name="avg" />
                  <Line type="monotone" dataKey="p95" stroke="oklch(0.7 0.15 45)" strokeWidth={2} strokeDasharray="5 5" name="p95" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage by Project</CardTitle>
                <CardDescription>API call distribution across projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectUsageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {projectUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Usage']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Performance</CardTitle>
                <CardDescription>Detailed breakdown by project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectUsageData.map((project) => (
                    <div key={project.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                        <div>
                          <p className="font-medium text-sm">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.calls} API calls</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{project.value}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}