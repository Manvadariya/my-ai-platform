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
import { User, Shield, Key, CreditCard, Lock, Copy, Eye, EyeSlash, Trash } from '@phosphor-icons/react'; // <-- CORRECTED LINE
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { apiService } from '../../lib/apiService';

export function SettingsView() {
  const { user, setUser } = useAppContext();
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profile, setProfile] = useState({ name: '', email: '', company: '' });
  const [securitySettings, setSecuritySettings] = useState({ twoFactorEnabled: false, sessionTimeout: '24h' });
  const [apiKeys, setApiKeys] = useState([]);
  const [showApiKey, setShowApiKey] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return; // Don't fetch if user is not loaded yet
      try {
        const userData = await apiService.getUserProfile();
        setUser(userData);
        setProfile({ name: userData.name, email: userData.email, company: userData.company });
        setSecuritySettings({ twoFactorEnabled: userData.twoFactorEnabled, sessionTimeout: userData.sessionTimeout });
      } catch (error) {
        toast.error('Failed to fetch profile data.');
      }
    };
    fetchProfileData();
  }, [user?.id, setUser]); // Depend on user.id to refetch if the user changes

  useEffect(() => {
    if (activeTab === 'api') {
      const fetchApiKeys = async () => {
        try {
          const keys = await apiService.getApiKeys();
          setApiKeys(keys.map(k => ({ ...k, id: k._id })));
        } catch (error) {
          toast.error('Failed to fetch API keys.');
        }
      };
      fetchApiKeys();
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await apiService.updateUserProfile(profile);
      setUser(prevUser => ({...prevUser, ...updatedUser}));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  };
  
  const handleUpdateSecuritySetting = async (setting, value) => {
    try {
      const updatedUser = await apiService.updateUserProfile({ [setting]: value });
      setUser(prevUser => ({...prevUser, ...updatedUser}));
      setSecuritySettings(prev => ({ ...prev, [setting]: value }));
      toast.success('Security setting updated');
    } catch (error) {
      toast.error(`Failed to update setting: ${error.message}`);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      const response = await apiService.generateApiKey({ name: 'New API Key' });
      const newKeyObject = { ...response.apiKey, id: response.apiKey._id };
      
      setApiKeys(current => [newKeyObject, ...current]);

      toast.success('API Key generated successfully!', {
        description: 'Copy your new key now. You will not be able to see it again.',
        action: {
          label: 'Copy Key',
          onClick: () => {
            navigator.clipboard.writeText(newKeyObject.key);
            toast.success("Key copied to clipboard!");
          },
        },
        duration: 15000, // Increase duration so user has time to copy
      });
    } catch (error) {
       toast.error(`Failed to generate API key: ${error.message}`);
    }
  };
  
  const handleDeleteApiKey = async (keyId) => {
    try {
        await apiService.deleteApiKey(keyId);
        setApiKeys(current => current.filter(key => key.id !== keyId));
        toast.success("API Key deleted.");
    } catch(error) {
        toast.error(`Failed to delete API key: ${error.message}`);
    }
  }

  if (!user) {
    return <div>Loading settings...</div>; // Or a skeleton loader
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences and security settings</p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2"><User size={16} />Profile</TabsTrigger>
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
                  <Input id="role" value={user.role} disabled />
                </div>
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
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
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={securitySettings.twoFactorEnabled ? 'default' : 'secondary'}>{securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}</Badge>
                  <Switch checked={securitySettings.twoFactorEnabled} onCheckedChange={(checked) => handleUpdateSecuritySetting('twoFactorEnabled', checked)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Select value={securitySettings.sessionTimeout} onValueChange={(value) => handleUpdateSecuritySetting('sessionTimeout', value)}>
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
                <Button variant="outline" className="gap-2" onClick={() => toast.info('Password change flow not implemented yet.')}><Lock size={16} />Change Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for programmatic access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <motion.div key={apiKey.id} className="border rounded-lg p-4" whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{apiKey.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteApiKey(apiKey.id)} className="text-destructive hover:text-destructive"><Trash size={16}/></Button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {`${apiKey.keyPrefix}........................${apiKey.lastFour}`}
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