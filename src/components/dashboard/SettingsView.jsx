import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { BillingView } from './BillingView';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Key,
  Lock,
  Copy,
  Eye,
  EyeSlash
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';

export function SettingsView({ user }) {
  const { settings, setSettings, apiKeys, setApiKeys } = useAppContext();
  
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    company: user.company,
    bio: ''
  });

  const [showApiKey, setShowApiKey] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const highlight = sessionStorage.getItem('highlightSection');
    if (highlight) {
      setActiveTab(highlight);
      sessionStorage.removeItem('highlightSection');
    }
  }, []);

  const handleSaveProfile = () => {
    // Here you would typically also update the global user state
    // For now, just a toast message
    toast.success('Profile updated successfully');
  };

  const handleUpdateSetting = (category, setting, value) => {
    setSettings(current => ({
      ...current,
      [category]: {
        ...current[category],
        [setting]: value
      }
    }));
    toast.success('Settings updated');
  };

  const copyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleChangePassword = () => {
    toast.info('Change password flow initiated.');
  };

  const handleGenerateApiKey = () => {
    const newKey = {
        id: `key_${Date.now()}`,
        name: 'New API Key',
        key: `sk-proj-${Math.random().toString(36).substring(2, 11)}...${Math.random().toString(36).substring(2, 8)}`,
        created: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        usage: 0
    };
    setApiKeys(current => [...current, newKey]);
    toast.success('New API key generated!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences and security settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="gap-2"><User size={16} />Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell size={16} />Notifications</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield size={16} />Security</TabsTrigger>
          <TabsTrigger value="api" className="gap-2"><Key size={16} />API Keys</TabsTrigger>
          <TabsTrigger value="billing" className="gap-2"><CreditCard size={16} />Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account profile and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-lg">{user.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-sm text-muted-foreground mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profile.name} onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={profile.company} onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={user.role} disabled>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself..." value={profile.bio} onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))} />
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch checked={settings.notifications.email} onCheckedChange={(checked) => handleUpdateSetting('notifications', 'email', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Browser Notifications</p>
                  <p className="text-sm text-muted-foreground">Show desktop notifications</p>
                </div>
                <Switch checked={settings.notifications.browser} onCheckedChange={(checked) => handleUpdateSetting('notifications', 'browser', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Get weekly usage summaries</p>
                </div>
                <Switch checked={settings.notifications.weekly} onCheckedChange={(checked) => handleUpdateSetting('notifications', 'weekly', checked)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Updates</p>
                  <p className="text-sm text-muted-foreground">Product updates and feature announcements</p>
                </div>
                <Switch checked={settings.notifications.marketing} onCheckedChange={(checked) => handleUpdateSetting('notifications', 'marketing', checked)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={settings.security.twoFactor ? 'default' : 'secondary'}>{settings.security.twoFactor ? 'Enabled' : 'Disabled'}</Badge>
                  <Switch checked={settings.security.twoFactor} onCheckedChange={(checked) => handleUpdateSetting('security', 'twoFactor', checked)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Select value={settings.security.sessionTimeout} onValueChange={(value) => handleUpdateSetting('security', 'sessionTimeout', value)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="8h">8 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4 border-t">
                <Button variant="outline" className="gap-2" onClick={handleChangePassword}><Lock size={16} />Change Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for accessing the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <motion.div key={apiKey.id} className="border rounded-lg p-4" whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{apiKey.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Created: {new Date(apiKey.created).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{apiKey.usage.toLocaleString()} calls</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}>
                          {showApiKey === apiKey.id ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyApiKey(apiKey.key)}><Copy size={16} /></Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                      </code>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button className="gap-2" onClick={handleGenerateApiKey}><Key size={16} />Generate New API Key</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <BillingView user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}