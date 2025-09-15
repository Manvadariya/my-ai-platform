import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, Crown, PencilSimple, Clock, CheckCircle, Warning, TrendUp } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

export function TeamActivity({ teamMembers, activityLog }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return Warning;
      case 'error': return Warning;
      default: return Clock;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return Crown;
      case 'Developer': return Shield;
      case 'Editor': return PencilSimple;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Developer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Editor': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getActivityScore = (score) => {
    if (score >= 80) return { label: 'Very Active', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Active', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 30) return { label: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Low Activity', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const recentActivity = activityLog.slice(0, 10);
  const activeMembers = teamMembers.filter(m => m.status === 'active');
  const sortedByActivity = [...activeMembers].sort((a, b) => b.activityScore - a.activityScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendUp size={20} />
            Team Activity Overview
          </CardTitle>
          <CardDescription>Member engagement and activity levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedByActivity.map((member, index) => {
            const RoleIcon = getRoleIcon(member.role);
            const activityConfig = getActivityScore(member.activityScore);
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">1</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${getRoleColor(member.role)} text-xs`}>
                        <RoleIcon size={10} className="mr-1" />
                        {member.role}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Last active {new Date(member.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${activityConfig.color}`}>
                    {member.activityScore}%
                  </div>
                  <Badge variant="outline" className={`${activityConfig.bg} ${activityConfig.color} text-xs`}>
                    {activityConfig.label}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest team actions and events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No recent activity</div>
          ) : (
            recentActivity.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const member = teamMembers.find(m => m.id === activity.userId);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 border-l-2 border-l-primary/20 bg-muted/30 rounded-r-lg"
                >
                  <ActivityIcon size={16} className={`mt-1 ${getActivityColor(activity.type)}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {member && (
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <span className="font-medium text-sm">{member?.name || 'Unknown User'}</span>
                      <span className="text-sm text-muted-foreground">{activity.action}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}