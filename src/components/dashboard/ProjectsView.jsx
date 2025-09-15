import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Rocket, Clock, CheckCircle, Code, Brain, DotsThree, Trash, PencilSimple } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { apiService } from '../../lib/apiService'; // Import our API service

export function ProjectsView({ triggerNewProject, onNewProjectTriggered }) {
  const { projects, setProjects } = useAppContext(); // Get projects from global context
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [highlightedProjectId, setHighlightedProjectId] = useState(null);
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    description: '',
    model: 'gpt-4o'
  });
  const [isLoading, setIsLoading] = useState(false); // For loading states on buttons

  useEffect(() => {
    if (triggerNewProject) {
      setIsCreateDialogOpen(true);
      onNewProjectTriggered?.();
    }
  }, [triggerNewProject, onNewProjectTriggered]);

  useEffect(() => {
    const highlightId = sessionStorage.getItem('highlightProjectId');
    if (highlightId) {
      setHighlightedProjectId(highlightId);
      sessionStorage.removeItem('highlightProjectId');
      
      setTimeout(() => {
        const element = document.getElementById(`project-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      setTimeout(() => {
        setHighlightedProjectId(null);
      }, 3000);
    }
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectForm.name.trim()) {
        toast.error("Project name is required.");
        return;
    };
    setIsLoading(true);
    try {
      const newProject = await apiService.createProject(newProjectForm);
      // Mongoose uses _id, let's map it to id for frontend consistency
      const formattedProject = { ...newProject, id: newProject._id };
      setProjects(current => [formattedProject, ...current]);
      setNewProjectForm({ name: '', description: '', model: 'gpt-4o' });
      setIsCreateDialogOpen(false);
      toast.success('Project created successfully!');
    } catch (error) {
      toast.error(`Failed to create project: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    // Optimistic UI update
    const originalProjects = [...projects];
    setProjects(current => current.filter(p => p.id !== projectId));
    try {
      await apiService.deleteProject(projectId);
      toast.success('Project deleted');
    } catch (error) {
      // Revert if API call fails
      setProjects(originalProjects);
      toast.error(`Failed to delete project: ${error.message}`);
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setNewProjectForm({
      name: project.name,
      description: project.description,
      model: project.model
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject || !newProjectForm.name.trim()) return;
    setIsLoading(true);
    try {
      const updatedData = await apiService.updateProject(selectedProject.id, newProjectForm);
      const formattedProject = { ...updatedData, id: updatedData._id };

      setProjects(current => current.map(p => 
        p.id === formattedProject.id ? formattedProject : p
      ));
      
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      setNewProjectForm({ name: '', description: '', model: 'gpt-4o' });
      toast.success('Project updated successfully!');
    } catch (error) {
      toast.error(`Failed to update project: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeployProject = (project) => {
    setSelectedProject(project);
    setIsDeployDialogOpen(true);
  };

  const handleConfirmDeploy = async () => {
    if (!selectedProject) return;
    setIsLoading(true);
    try {
        const updatedData = await apiService.updateProject(selectedProject.id, { status: 'deployed' });
        const formattedProject = { ...updatedData, id: updatedData._id };

        setProjects(current => current.map(p => 
          p.id === formattedProject.id ? formattedProject : p
        ));
      
        setIsDeployDialogOpen(false);
        setSelectedProject(null);
        toast.success('Project deployed successfully!');
    } catch (error) {
        toast.error(`Failed to deploy project: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleViewAPI = (project) => {
    const apiEndpoint = `https://api.aiplatform.com/v1/projects/${project.id}/chat`;
    navigator.clipboard.writeText(apiEndpoint);
    toast.success('API endpoint copied to clipboard!');
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'development': return { label: 'In Development', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Code };
      case 'testing': return { label: 'Testing', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock };
      case 'deployed': return { label: 'Deployed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Code };
    }
  };
  
  // Calculate dashboard stats from the projects state
  const totalProjects = projects.length;
  const deployedProjects = projects.filter(p => p.status === 'deployed').length;
  const devProjects = projects.filter(p => p.status === 'development').length;
  const totalApiCalls = projects.reduce((acc, p) => acc + p.apiCalls, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage your AI models and deployments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus size={16} />New Project</Button></DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Start building your custom AI assistant</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" placeholder="Customer Support Bot" value={newProjectForm.name} onChange={(e) => setNewProjectForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea id="project-description" placeholder="Intelligent customer support assistant..." value={newProjectForm.description} onChange={(e) => setNewProjectForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base-model">Base Model</Label>
                <Select value={newProjectForm.model} onValueChange={(value) => setNewProjectForm(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4O (Recommended)</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateProject} disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Project'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update your project settings</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-project-name">Project Name</Label>
                <Input id="edit-project-name" value={newProjectForm.name} onChange={(e) => setNewProjectForm(prev => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-project-description">Description</Label>
                <Textarea id="edit-project-description" value={newProjectForm.description} onChange={(e) => setNewProjectForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-base-model">Base Model</Label>
                <Select value={newProjectForm.model} onValueChange={(value) => setNewProjectForm(prev => ({ ...prev, model: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4O (Recommended)</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4O Mini</SelectItem>
                    <SelectItem value="claude-3">Claude 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateProject} disabled={isLoading}>{isLoading ? 'Updating...' : 'Update Project'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Deploy Project</DialogTitle>
              <DialogDescription>Deploy "{selectedProject?.name}" to production?</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">This will make the project live and accessible via API.</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeployDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmDeploy} disabled={isLoading}><Rocket size={16} className="mr-2" />{isLoading ? 'Deploying...' : 'Deploy Now'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total Projects</p><p className="text-2xl font-bold">{totalProjects}</p></div><Brain size={24} className="text-primary" weight="duotone" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Deployed</p><p className="text-2xl font-bold text-green-600">{deployedProjects}</p></div><Rocket size={24} className="text-green-600" weight="duotone" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">In Development</p><p className="text-2xl font-bold text-yellow-600">{devProjects}</p></div><Code size={24} className="text-yellow-600" weight="duotone" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">API Calls Today</p><p className="text-2xl font-bold">{totalApiCalls.toLocaleString()}</p></div><CheckCircle size={24} className="text-primary" weight="duotone" /></div></CardContent></Card>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center"><Brain size={32} className="text-muted-foreground" /></div>
            <div><h3 className="font-semibold text-lg">No projects yet</h3><p className="text-muted-foreground">Create your first AI project to get started</p></div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2"><Plus size={16} />Create Project</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const statusConfig = getStatusConfig(project.status);
            const StatusIcon = statusConfig.icon;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card id={`project-${project.id}`} className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${highlightedProjectId === project.id ? 'ring-2 ring-primary/50 bg-primary/5 animate-pulse' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1"><CardTitle className="text-lg">{project.name}</CardTitle><CardDescription className="text-sm">{project.description || 'No description provided'}</CardDescription></div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity"><DotsThree size={16} /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`${statusConfig.color} border`}><StatusIcon size={12} className="mr-1" />{statusConfig.label}</Badge>
                      <Badge variant="secondary" className="text-xs">v{project.version}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Model: {project.model}</p>
                      <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                      <p>API Calls: {project.apiCalls.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleEditProject(project)}><PencilSimple size={14} />Edit</Button>
                      {project.status === 'deployed' ? (
                        <Button size="sm" className="flex-1 gap-1" onClick={() => handleViewAPI(project)}><Rocket size={14} />View API</Button>
                      ) : (
                        <Button size="sm" className="flex-1 gap-1" onClick={() => handleDeployProject(project)}><Rocket size={14} />Deploy</Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleDeleteProject(project.id)} className="text-destructive hover:text-destructive"><Trash size={14} /></Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}