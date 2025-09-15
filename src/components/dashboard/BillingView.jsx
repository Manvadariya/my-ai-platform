import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Download, Star, Check, Lightning, Calendar, TrendUp, Receipt, Crown, Sparkle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function BillingView({ user }) {
  const [currentPlan, setCurrentPlan] = useState('professional');
  const [usage] = useState({
    apiCalls: 8547,
    maxApiCalls: 10000,
    storage: 2.3,
    maxStorage: 10
  });
  
  const [invoices] = useState([
    { id: 'inv_001', date: '2024-01-15', amount: 49.00, status: 'paid', description: 'Professional Plan - January 2024' },
    { id: 'inv_002', date: '2024-12-15', amount: 49.00, status: 'paid', description: 'Professional Plan - December 2023' },
    { id: 'inv_003', date: '2023-11-15', amount: 49.00, status: 'paid', description: 'Professional Plan - November 2023' }
  ]);

  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'starter', name: 'Starter', price: 0, description: 'Perfect for getting started',
      features: ['1,000 API calls/month', '1 GB storage', 'Email support', 'Basic analytics', '1 team member'],
      apiCalls: 1000, storage: '1 GB', support: 'Email'
    },
    {
      id: 'professional', name: 'Professional', price: 49, description: 'Best for growing businesses',
      features: ['10,000 API calls/month', '10 GB storage', 'Priority support', 'Advanced analytics', '5 team members', 'Custom models'],
      apiCalls: 10000, storage: '10 GB', support: 'Priority', popular: true
    },
    {
      id: 'enterprise', name: 'Enterprise', price: 199, description: 'For large organizations',
      features: ['Unlimited API calls', '100 GB storage', '24/7 phone support', 'Custom analytics', 'Unlimited team members', 'Custom integrations', 'Dedicated account manager'],
      apiCalls: Infinity, storage: '100 GB', support: '24/7 Phone'
    }
  ];

  const currentPlanData = plans.find(p => p.id === currentPlan) || plans[1];

  const handleUpgradePlan = (plan) => {
    setSelectedPlan(plan);
    setIsUpgradeDialogOpen(true);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlan) return;
    setCurrentPlan(selectedPlan.id);
    toast.success(`Successfully upgraded to ${selectedPlan.name} plan!`);
    setIsUpgradeDialogOpen(false);
    setSelectedPlan(null);
  };

  const handleDownloadInvoice = (invoice) => {
    const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${invoice.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  const handleUpdatePaymentMethod = () => {
    toast.success('Payment method update initiated.');
  };

  const handleViewBillingHistory = () => {
    const billingSection = document.getElementById('billing-history');
    if (billingSection) {
      billingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatPrice = (price) => (price === 0 ? 'Free' : `$${price}/month`);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing & Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentPlanData.popular && <Star size={20} className="text-yellow-500" />}
                  Current Plan: {currentPlanData.name}
                </CardTitle>
                <CardDescription>{currentPlanData.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg font-bold">{formatPrice(currentPlanData.price)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">API Calls</span>
                  <span className="text-sm text-muted-foreground">{usage.apiCalls.toLocaleString()} / {usage.maxApiCalls.toLocaleString()}</span>
                </div>
                <Progress value={(usage.apiCalls / usage.maxApiCalls) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{Math.round(((usage.maxApiCalls - usage.apiCalls) / usage.maxApiCalls) * 100)}% remaining</p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Storage</span>
                  <span className="text-sm text-muted-foreground">{usage.storage} GB / {currentPlanData.storage}</span>
                </div>
                <Progress value={(usage.storage / parseFloat(currentPlanData.storage)) * 100} className="h-2" />
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Plan Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentPlanData.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button className="gap-2" onClick={handleUpdatePaymentMethod}><CreditCard size={16} />Update Payment Method</Button>
              <Button variant="outline" className="gap-2" onClick={handleViewBillingHistory}><Receipt size={16} />Billing History</Button>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Billing</p>
                  <p className="text-lg font-bold">Feb 15, 2025</p>
                </div>
                <Calendar size={24} className="text-primary" weight="duotone" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Spend</p>
                  <p className="text-lg font-bold">${currentPlanData.price}</p>
                </div>
                <TrendUp size={24} className="text-green-600" weight="duotone" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total API Calls</p>
                  <p className="text-lg font-bold">{usage.apiCalls.toLocaleString()}</p>
                </div>
                <Lightning size={24} className="text-primary" weight="duotone" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`relative rounded-lg border p-6 ${plan.id === currentPlan ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'} ${plan.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground}"><Star size={12} className="mr-1" />Most Popular</Badge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                    {plan.id === 'enterprise' && <Crown size={20} className="text-yellow-500" />}
                    {plan.id === 'professional' && <Sparkle size={20} className="text-primary" />}
                    {plan.name}
                  </h3>
                  <p className="text-3xl font-bold mt-2">{formatPrice(plan.price)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Button className="w-full" variant={plan.id === currentPlan ? "outline" : "default"} disabled={plan.id === currentPlan} onClick={() => handleUpgradePlan(plan)}>
                  {plan.id === currentPlan ? 'Current Plan' : plan.price > currentPlanData.price ? 'Upgrade' : 'Downgrade'}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card id="billing-history">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Download your previous invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                  <TableCell>{invoice.description}</TableCell>
                  <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(invoice.status)} border`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(invoice)} className="gap-1">
                      <Download size={14} /> Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upgrade Plan</DialogTitle>
            <DialogDescription>{selectedPlan && `Upgrade to ${selectedPlan.name} plan?`}</DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="py-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Plan:</span><span className="font-medium">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span><span className="font-medium">{formatPrice(selectedPlan.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Billing:</span><span className="font-medium">Monthly</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmUpgrade}><CreditCard size={16} className="mr-2" />Confirm Upgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}