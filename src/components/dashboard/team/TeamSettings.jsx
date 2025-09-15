import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Crown, Shield, PencilSimple, Copy, Gear, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function TeamSettings({ rolePermissions, onRolePermissionsChange }) {
  const [customRoles, setCustomRoles] = useState([]);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    color: 'blue',
    permissions: []
  });

  const [teamSettings, setTeamSettings] = useState({
    requireApprovalForInvites: false,
    allowSelfRegistration: false,
    enableActivityTracking: true,
    autoRemoveInactiveMembers: false,
    maxTeamSize: 50,
    defaultRole: 'Editor'
  });

  const builtInRoles = [
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full access to all features and settings',
      color: 'red',
      permissions: Object.keys(rolePermissions.Admin || {}),
      isBuiltIn: true
    },
    {
      id: 'developer',
      name: 'Developer',
      description: 'Can create, edit, and deploy projects',
      color: 'blue',
      permissions: Object.keys(rolePermissions.Developer || {}),
      isBuiltIn: true
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Can edit projects and manage data',
      color: 'green',
      permissions: Object.keys(rolePermissions.Editor || {}),
      isBuiltIn: true
    }
  ];

  const allRoles = [...builtInRoles, ...customRoles];

  const handleCreateCustomRole = () => {
    if (!newRole.name.trim()) return;

    const customRole = {
      id: `custom_${Date.now()}`,
      name: newRole.name,
      description: newRole.description,
      color: newRole.color,
      permissions: newRole.permissions,
      isBuiltIn: false
    };

    setCustomRoles(current => [...current, customRole]);
    
    const newPermissions = { ...rolePermissions };
    newPermissions[newRole.name] = {};
    newRole.permissions.forEach(permission => {
      newPermissions[newRole.name][permission] = true;
    });
    onRolePermissionsChange(newPermissions);

    setNewRole({ name: '', description: '', color: 'blue', permissions: [] });
    setIsCreatingRole(false);
    toast.success('Custom role created successfully!');
  };

  const handleDuplicateRole = (role) => {
    const duplicatedRole = {
      id: `custom_${Date.now()}`,
      name: `${role.name} Copy`,
      description: `Copy of ${role.description}`,
      color: role.color,
      permissions: [...role.permissions],
      isBuiltIn: false
    };

    setCustomRoles(current => [...current, duplicatedRole]);
    
    const newPermissions = { ...rolePermissions };
    newPermissions[duplicatedRole.name] = {};
    duplicatedRole.permissions.forEach(permission => {
      newPermissions[duplicatedRole.name][permission] = true;
    });
    onRolePermissionsChange(newPermissions);

    toast.success('Role duplicated successfully!');
  };

  const handleDeleteCustomRole = (roleId) => {
    const role = customRoles.find(r => r.id === roleId);
    if (role) {
      setCustomRoles(current => current.filter(r => r.id !== roleId));
      
      const newPermissions = { ...rolePermissions };
      delete newPermissions[role.name];
      onRolePermissionsChange(newPermissions);
      
      toast.success('Custom role deleted');
    }
  };

  const handleSettingChange = (setting, value) => {
    setTeamSettings(current => ({
      ...current,
      [setting]: value
    }));
    toast.success('Setting updated');
  };

  const getRoleColorClass = (color) => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200'
    };
    return colors[color] || colors.blue;
  };

  const availablePermissions = [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete', 'projects.deploy',
    'team.view', 'team.invite', 'team.manage',
    'data.view', 'data.upload', 'data.delete', 'data.export',
    'deployment.view', 'deployment.manage',
    'billing.view', 'billing.manage'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Configuration</CardTitle>
          <CardDescription>Configure team-wide settings and policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require approval for invites</Label>
                  <p className="text-sm text-muted-foreground">New invitations need admin approval</p>
                </div>
                <Switch
                  checked={teamSettings.requireApprovalForInvites}
                  onCheckedChange={(checked) => handleSettingChange('requireApprovalForInvites', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow self-registration</Label>
                  <p className="text-sm text-muted-foreground">Users can join without invitation</p>
                </div>
                <Switch
                  checked={teamSettings.allowSelfRegistration}
                  onCheckedChange={(checked) => handleSettingChange('allowSelfRegistration', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Activity tracking</Label>
                  <p className="text-sm text-muted-foreground">Track member activity and engagement</p>
                </div>
                <Switch
                  checked={teamSettings.enableActivityTracking}
                  onCheckedChange={(checked) => handleSettingChange('enableActivityTracking', checked)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Maximum team size</Label>
                <Input
                  type="number"
                  value={teamSettings.maxTeamSize}
                  onChange={(e) => handleSettingChange('maxTeamSize', parseInt(e.target.value))}
                  min={1}
                  max={100}
                />
              </div>
              <div className="space-y-2">
                <Label>Default role for new members</Label>
                <Select
                  value={teamSettings.defaultRole}
                  onValueChange={(value) => handleSettingChange('defaultRole', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Developer">Developer</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Manage built-in and custom roles</CardDescription>
          </div>
          <Dialog open={isCreatingRole} onOpenChange={setIsCreatingRole}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Create Custom Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Custom Role</DialogTitle>
                <DialogDescription>Define a new role with specific permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role Name</Label>
                    <Input
                      placeholder="e.g., Content Manager"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <Select
                      value={newRole.color}
                      onValueChange={(value) => setNewRole(prev => ({ ...prev, color: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                        <SelectItem value="yellow">Yellow</SelectItem>
                        <SelectItem value="pink">Pink</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe what this role can do..."
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-4 border rounded-lg">
                    {availablePermissions.map(permission => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={newRole.permissions.includes(permission)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRole(prev => ({
                                ...prev,
                                permissions: [...prev.permissions, permission]
                              }));
                            } else {
                              setNewRole(prev => ({
                                ...prev,
                                permissions: prev.permissions.filter(p => p !== permission)
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={permission} className="text-sm">
                          {permission.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreatingRole(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCustomRole}>
                  Create Role
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRoles.map((role) => {
              const RoleIcon = role.name === 'Admin' ? Crown : 
                              role.name === 'Developer' ? Shield : PencilSimple;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RoleIcon size={20} className="text-muted-foreground" />
                      <Badge variant="outline" className={getRoleColorClass(role.color)}>
                        {role.name}
                      </Badge>
                    </div>
                    {role.isBuiltIn && (
                      <Badge variant="outline" className="text-xs">
                        Built-in
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  <div className="text-xs text-muted-foreground">{role.permissions.length} permissions</div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDuplicateRole(role)} className="flex-1">
                      <Copy size={14} className="mr-1" />
                      Duplicate
                    </Button>
                    {!role.isBuiltIn && (
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCustomRole(role.id)} className="text-destructive hover:text-destructive">
                        <Warning size={14} />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Security & Compliance</CardTitle>
          <CardDescription>Configure security policies and compliance settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
            <div className="flex">
              <Warning size={20} className="text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Security Notice</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Advanced security features including SSO, 2FA, and audit logs are available in the Enterprise plan.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            <Shield size={48} className="mx-auto mb-4 opacity-50" />
            <p>Advanced security configuration coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}