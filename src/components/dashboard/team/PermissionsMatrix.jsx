import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Crown, PencilSimple, Eye, Plus, Rocket, DownloadSimple, Trash, Users, CreditCard } from '@phosphor-icons/react';

const permissions = [
  { id: 'projects.view', name: 'View Projects', description: 'Can view project details', icon: Eye, category: 'Projects' },
  { id: 'projects.create', name: 'Create Projects', description: 'Can create new projects', icon: Plus, category: 'Projects' },
  { id: 'projects.edit', name: 'Edit Projects', description: 'Can modify project settings', icon: PencilSimple, category: 'Projects' },
  { id: 'projects.delete', name: 'Delete Projects', description: 'Can delete projects', icon: Trash, category: 'Projects' },
  { id: 'projects.deploy', name: 'Deploy Projects', description: 'Can deploy projects to production', icon: Rocket, category: 'Projects' },
  { id: 'team.view', name: 'View Team', description: 'Can view team members', icon: Users, category: 'Team' },
  { id: 'team.invite', name: 'Invite Members', description: 'Can send team invitations', icon: Plus, category: 'Team' },
  { id: 'team.manage', name: 'Manage Members', description: 'Can modify member roles and remove members', icon: Shield, category: 'Team' },
  { id: 'data.view', name: 'View Data', description: 'Can view uploaded data sources', icon: Eye, category: 'Data' },
  { id: 'data.upload', name: 'Upload Data', description: 'Can upload new data sources', icon: Plus, category: 'Data' },
  { id: 'data.delete', name: 'Delete Data', description: 'Can delete data sources', icon: Trash, category: 'Data' },
  { id: 'data.export', name: 'Export Data', description: 'Can export data sources', icon: DownloadSimple, category: 'Data' },
  { id: 'deployment.view', name: 'View Deployments', description: 'Can view deployment status', icon: Eye, category: 'Deployment' },
  { id: 'deployment.manage', name: 'Manage Deployments', description: 'Can start/stop deployments', icon: Rocket, category: 'Deployment' },
  { id: 'billing.view', name: 'View Billing', description: 'Can view billing information', icon: Eye, category: 'Billing' },
  { id: 'billing.manage', name: 'Manage Billing', description: 'Can modify billing and subscriptions', icon: CreditCard, category: 'Billing' },
];

const roleColors = {
  Admin: 'bg-red-100 text-red-800 border-red-200',
  Developer: 'bg-blue-100 text-blue-800 border-blue-200',
  Editor: 'bg-green-100 text-green-800 border-green-200'
};

const roleIcons = {
  Admin: Crown,
  Developer: Shield,
  Editor: PencilSimple
};

export function PermissionsMatrix({ onPermissionChange, rolePermissions }) {
  const categories = [...new Set(permissions.map(p => p.category))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions Matrix</CardTitle>
        <CardDescription>Configure what each role can access and modify</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(category => {
          const categoryPermissions = permissions.filter(p => p.category === category);
          return (
            <div key={category} className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">{category}</h4>
              <div className="space-y-3">
                {categoryPermissions.map(permission => {
                  const PermissionIcon = permission.icon;
                  return (
                    <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <PermissionIcon size={20} className="text-muted-foreground" />
                        <div>
                          <Label className="font-medium">{permission.name}</Label>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {Object.keys(rolePermissions).map(role => {
                          const RoleIcon = roleIcons[role];
                          return (
                            <div key={role} className="flex flex-col items-center gap-2">
                              <Badge variant="outline" className={`${roleColors[role]} text-xs`}>
                                <RoleIcon size={10} className="mr-1" />
                                {role}
                              </Badge>
                              <Switch
                                checked={rolePermissions[role]?.[permission.id] || false}
                                onCheckedChange={(checked) => onPermissionChange(role, permission.id, checked)}
                                className="scale-75"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}