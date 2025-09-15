import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Envelope, Clock, Check, X, Copy, Eye, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function InvitationManager({ currentUser, onInvitationAccepted, initialInvitations = [] }) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [isViewingInvites, setIsViewingInvites] = useState(false);

  useEffect(() => {
    const updatedInvitations = invitations.map(inv => {
      const now = new Date();
      const expiryDate = new Date(inv.expiresAt);
      if (inv.status === 'pending' && now > expiryDate) {
        return { ...inv, status: 'expired' };
      }
      return inv;
    });
    setInvitations(updatedInvitations);
  }, []); // Run only once on mount to check for expired invites

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  const copyInviteLink = (invitation) => {
    const inviteUrl = `${window.location.origin}/invite/${invitation.inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard');
  };

  const resendInvitation = (invitationId) => {
    setInvitations(current =>
      current.map(inv =>
        inv.id === invitationId
          ? {
              ...inv,
              invitedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'pending'
            }
          : inv
      )
    );
    toast.success('Invitation resent');
  };

  const cancelInvitation = (invitationId) => {
    setInvitations(current =>
      current.map(inv =>
        inv.id === invitationId ? { ...inv, status: 'cancelled' } : inv
      )
    );
    toast.success('Invitation cancelled');
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 'accepted': return { label: 'Accepted', color: 'bg-green-100 text-green-800' };
      case 'expired': return { label: 'Expired', color: 'bg-red-100 text-red-800' };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' };
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Developer': return 'bg-blue-100 text-blue-800';
      case 'Editor': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiry = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const expiredCount = invitations.filter(inv => inv.status === 'expired').length;
  const acceptedCount = invitations.filter(inv => inv.status === 'accepted').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Invites</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingInvitations.length}</p>
              </div>
              <Clock size={20} className="text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
              </div>
              <X size={20} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
              </div>
              <Check size={20} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Invitations</CardTitle>
            <CardDescription>Manage pending and sent invitations</CardDescription>
          </div>
          <Dialog open={isViewingInvites} onOpenChange={setIsViewingInvites}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye size={16} className="mr-2" />
                View All
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>All Invitations</DialogTitle>
                <DialogDescription>Complete history of team invitations</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {invitations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No invitations sent yet</div>
                ) : (
                  invitations.map((invitation) => {
                    const statusConfig = getStatusConfig(invitation.status);
                    const daysUntilExpiry = getDaysUntilExpiry(invitation.expiresAt);
                    return (
                      <motion.div
                        key={invitation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${invitation.email}`} />
                              <AvatarFallback>{invitation.email.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{invitation.email}</p>
                              <p className="text-sm text-muted-foreground">Invited by {invitation.invitedBy}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getRoleColor(invitation.role)}>{invitation.role}</Badge>
                            <Badge variant="outline" className={statusConfig.color}>{statusConfig.label}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Sent {new Date(invitation.invitedAt).toLocaleDateString()}</span>
                          {invitation.status === 'pending' && (
                            <span className={daysUntilExpiry <= 1 ? 'text-red-600' : ''}>
                              {daysUntilExpiry > 0 ? `Expires in ${daysUntilExpiry} days` : 'Expired'}
                            </span>
                          )}
                        </div>
                        {invitation.status === 'pending' && (
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Button size="sm" variant="outline" onClick={() => copyInviteLink(invitation)}>
                              <Copy size={14} className="mr-1" />
                              Copy Link
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => resendInvitation(invitation.id)}>
                              <Envelope size={14} className="mr-1" />
                              Resend
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => cancelInvitation(invitation.id)} className="text-destructive hover:text-destructive">
                              <Trash size={14} className="mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending invitations</div>
          ) : (
            <div className="space-y-4">
              {pendingInvitations.slice(0, 3).map((invitation) => {
                const daysUntilExpiry = getDaysUntilExpiry(invitation.expiresAt);
                return (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${invitation.email}`} />
                        <AvatarFallback>{invitation.email.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <p className="text-sm text-muted-foreground">{invitation.role} • Expires in {daysUntilExpiry} days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyInviteLink(invitation)}>
                        <Copy size={14} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => resendInvitation(invitation.id)}>
                        <Envelope size={14} />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {pendingInvitations.length > 3 && (
                <Button variant="ghost" className="w-full" onClick={() => setIsViewingInvites(true)}>
                  View {pendingInvitations.length - 3} more invitations
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}