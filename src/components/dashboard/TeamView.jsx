import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Crown, 
  Shield, 
  PencilSimple,
  Envelope,
  CalendarBlank,
  Trash,
  Gear,
  ChartLine,
  Users,
  Lock
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { PermissionsMatrix } from './team/PermissionsMatrix';
import { InvitationManager } from './team/InvitationManager';
import { TeamActivity } from './team/TeamActivity';
import { TeamSettings } from './team/TeamSettings';
import { useAppContext } from '../../context/AppContext';

export function TeamView({ user }) {
  const { teamMembers, setTeamMembers } = useAppContext();
  
  const [highlightedMemberId, setHighlightedMemberId] = useState(null);
  const [activityLog, setActivityLog] = useState([]); // Local state for activity
  const [rolePermissions, setRolePermissions] = useState({
    Admin: {
      'projects.view': true, 'projects.create': true, 'projects.edit': true, 'projects.delete': true, 'projects.deploy': true,
      'team.view': true, 'team.invite': true, 'team.manage': true,
      'data.view': true, 'data.upload': true, 'data.delete': true, 'data.export': true,
      'deployment.view': true, 'deployment.manage': true,
      'billing.view': true, 'billing.manage': true
    },
    Developer: {
      'projects.view': true, 'projects.create': true, 'projects.edit': true, 'projects.delete': false, 'projects.deploy': true,
      'team.view': true, 'team.invite': false, 'team.manage': false,
      'data.view': true, 'data.upload': true, 'data.delete': false, 'data.export': true,
      'deployment.view': true, 'deployment.manage': true,
      'billing.view': false, 'billing.manage': false
    },
    Editor: {
      'projects.view': true, 'projects.create': false, 'projects.edit': true, 'projects.delete': false, 'projects.deploy': false,
      'team.view': true, 'team.invite': false, 'team.manage': false,
      'data.view': true, 'data.upload': true, 'data.delete': false, 'data.export': false,
      'deployment.view': true, 'deployment.manage': false,
      'billing.view': false, 'billing.manage': false
    }
  });
  
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'Editor' });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const highlightId = sessionStorage.getItem('highlightMemberId');
    if (highlightId) {
      setActiveTab('overview'); // Ensure the overview tab is active
      setHighlightedMemberId(highlightId);
      sessionStorage.removeItem('highlightMemberId');
      
      setTimeout(() => {
        const element = document.getElementById(`member-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      setTimeout(() => setHighlightedMemberId(null), 3000);
    }
  }, []);

  const logActivity = (action, details, type = 'info') => {
    const newActivity = {
      id: `activity_${Date.now()}`,
      userId: user.id,
      action,
      details,
      timestamp: new Date().toISOString(),
      type
    };
    setActivityLog(current => [newActivity, ...current.slice(0, 49)]);
  };

  const handleInviteMember = () => {
    if (!inviteForm.email.trim()) {
        toast.error("Email address cannot be empty.");
        return;
    }

    const newMember = {
      id: `member_${Date.now()}`,
      name: inviteForm.email.split('@')[0],
      email: inviteForm.email,
      role: inviteForm.role,
      status: 'pending',
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${inviteForm.email}`,
      activityScore: 0,
      permissions: Object.keys(rolePermissions[inviteForm.role]).filter(key => rolePermissions[inviteForm.role][key])
    };

    setTeamMembers(current => [...current, newMember]);
    logActivity('Invited Member', `Invited ${inviteForm.email} as ${inviteForm.role}`, 'success');
    setInviteForm({ email: '', role: 'Editor' });
    setIsInviteDialogOpen(false);
    toast.success('Invitation sent successfully!');
  };

  const handleRemoveMember = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      setTeamMembers(current => current.filter(m => m.id !== memberId));
      logActivity('Removed Member', `Removed ${member.name} from the team`, 'warning');
      toast.success('Team member removed');
    }
  };

  const handleRoleChange = (memberId, newRole) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member) {
      setTeamMembers(current => 
        current.map(m => 
          m.id === memberId 
            ? { ...m, role: newRole, permissions: Object.keys(rolePermissions[newRole]).filter(key => rolePermissions[newRole][key]) } 
            : m
        )
      );
      logActivity('Updated Role', `Changed ${member.name}'s role to ${newRole}`, 'info');
      toast.success('Role updated successfully');
    }
  };

  const handlePermissionChange = (role, permission, enabled) => {
    const updatedRolePermissions = {
      ...rolePermissions,
      [role]: {
        ...rolePermissions[role],
        [permission]: enabled
      }
    };
    setRolePermissions(updatedRolePermissions);
    
    setTeamMembers(current => 
      current.map(member => 
        member.role === role 
          ? { ...member, permissions: Object.keys(updatedRolePermissions[role]).filter(key => updatedRolePermissions[role][key]) }
          : member
      )
    );
    
    logActivity('Updated Permissions', `Modified ${role} permissions for: ${permission}`, 'info');
    toast.success('Permissions updated');
  };

  const handleInvitationAccepted = (invitation) => {
    setTeamMembers(current => 
      current.map(member => 
        member.email === invitation.email 
          ? { ...member, status: 'active', activityScore: Math.floor(Math.random() * 40) + 20 }
          : member
      )
    );
    logActivity('Member Joined', `${invitation.email} accepted the invitation`, 'success');
  };

  const getRoleConfig = (role) => {
    switch (role) {
      case 'Admin': return { color: 'bg-red-100 text-red-800 border-red-200', icon: Crown };
      case 'Developer': return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield };
      case 'Editor': return { color: 'bg-green-100 text-green-800 border-green-200', icon: PencilSimple };
      default: return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Users };
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'active': return { label: 'Active', color: 'bg-green-100 text-green-800' };
      case 'pending': return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 'inactive': return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Collaboration</h2>
          <p className="text-muted-foreground">Manage members, permissions, and collaboration settings</p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><UserPlus size={16} />Invite Member</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Send an invitation to join your AI platform team</DialogDescription>
            </DialogHeader>
            <motion.div className="space-y-4 py-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <div className="relative">
                  <Envelope size={16} className="absolute left-3 top-3 text-muted-foreground" />
                  <Input id="invite-email" type="email" placeholder="colleague@company.com" className="pl-10" value={inviteForm.email} onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin"><div className="flex items-center gap-2"><Crown size={14} />Admin - Full access</div></SelectItem>
                    <SelectItem value="Developer"><div className="flex items-center gap-2"><Shield size={14} />Developer - Create & deploy</div></SelectItem>
                    <SelectItem value="Editor"><div className="flex items-center gap-2"><PencilSimple size={14} />Editor - Edit projects</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleInviteMember}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2"><Users size={16} /><span className="hidden sm:inline">Overview</span></TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2"><Envelope size={16} /><span className="hidden sm:inline">Invitations</span></TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2"><Lock size={16} /><span className="hidden sm:inline">Permissions</span></TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2"><ChartLine size={16} /><span className="hidden sm:inline">Activity</span></TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2"><Gear size={16} /><span className="hidden sm:inline">Settings</span></TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Members</p><p className="text-2xl font-bold">{teamMembers.length}</p></div><UserPlus size={24} className="text-primary" weight="duotone" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Active</p><p className="text-2xl font-bold text-green-600">{teamMembers.filter(m => m.status === 'active').length}</p></div><Shield size={24} className="text-green-600" weight="duotone" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-600">{teamMembers.filter(m => m.status === 'pending').length}</p></div><CalendarBlank size={24} className="text-yellow-600" weight="duotone" /></div></CardContent></Card>
            <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Admins</p><p className="text-2xl font-bold text-red-600">{teamMembers.filter(m => m.role === 'Admin').length}</p></div><Crown size={24} className="text-red-600" weight="duotone" /></div></CardContent></Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage team member roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => {
                    const roleConfig = getRoleConfig(member.role);
                    const statusConfig = getStatusConfig(member.status);
                    const RoleIcon = roleConfig.icon;
                    return (
                      <TableRow key={member.id} id={`member-${member.id}`} className={`${highlightedMemberId === member.id ? 'bg-primary/10 animate-pulse border-l-4 border-l-primary' : ''}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8"><AvatarImage src={member.avatar} /><AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                            <div><p className="font-medium">{member.name}</p><p className="text-sm text-muted-foreground">{member.email}</p></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={member.role} onValueChange={(value) => handleRoleChange(member.id, value)} disabled={member.id === user.id}>
                            <SelectTrigger className="w-[140px]"><Badge variant="outline" className={`${roleConfig.color} border-0`}><RoleIcon size={12} className="mr-1" />{member.role}</Badge></SelectTrigger>
                            <SelectContent><SelectItem value="Admin">Admin</SelectItem><SelectItem value="Developer">Developer</SelectItem><SelectItem value="Editor">Editor</SelectItem></SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell><Badge variant="outline" className={statusConfig.color}>{statusConfig.label}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${member.activityScore}%` }} /></div>
                            <span className="text-sm text-muted-foreground">{member.activityScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{member.status === 'active' ? new Date(member.lastActive).toLocaleDateString() : 'Never'}</TableCell>
                        <TableCell>{member.id !== user.id && (<Button variant="ghost" size="sm" onClick={() => handleRemoveMember(member.id)} className="text-destructive hover:text-destructive"><Trash size={14} /></Button>)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationManager currentUser={user} onInvitationAccepted={handleInvitationAccepted} initialInvitations={teamMembers.filter(m => m.status === 'pending')} />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsMatrix rolePermissions={rolePermissions} onPermissionChange={handlePermissionChange} />
        </TabsContent>
        <TabsContent value="activity">
          <TeamActivity teamMembers={teamMembers} activityLog={activityLog} />
        </TabsContent>
        <TabsContent value="settings">
          <TeamSettings rolePermissions={rolePermissions} onRolePermissionsChange={setRolePermissions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}