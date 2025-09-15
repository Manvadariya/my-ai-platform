import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Star, Check, Lightning, Calendar, TrendUp, Receipt, Crown, Sparkle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { apiService } from '../../lib/apiService';

const plans = [
    { id: 'starter', name: 'Starter', price: 0, description: 'Perfect for getting started', features: ['1,000 API calls/month', '1 GB storage', 'Email support'], apiCalls: 1000, storage: '1 GB' },
    { id: 'professional', name: 'Professional', price: 49, description: 'Best for growing businesses', features: ['10,000 API calls/month', '10 GB storage', 'Priority support'], apiCalls: 10000, storage: '10 GB', popular: true },
    { id: 'enterprise', name: 'Enterprise', price: 199, description: 'For large organizations', features: ['Unlimited API calls', '100 GB storage', '24/7 phone support'], apiCalls: Infinity, storage: '100 GB' }
];

export function BillingView() {
  const [subscription, setSubscription] = useState(null);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true);
      try {
        const subData = await apiService.getSubscription();
        setSubscription(subData);
      } catch (error) {
        toast.error("Could not load subscription details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  const currentPlanData = plans.find(p => p.id === subscription?.plan) || plans[0];

  const handleUpgradePlan = (plan) => {
    setSelectedPlan(plan);
    setIsUpgradeDialogOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPlan) return;
    try {
      const updatedSub = await apiService.updateSubscription({ plan: selectedPlan.id });
      setSubscription(updatedSub);
      toast.success(`Successfully changed to ${selectedPlan.name} plan!`);
    } catch (error) {
      toast.error(`Failed to change plan: ${error.message}`);
    } finally {
      setIsUpgradeDialogOpen(false);
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price) => (price === 0 ? 'Free' : `$${price}/month`);

  if (isLoading) {
    return <div>Loading billing information...</div>;
  }
  
  if (!subscription) {
    return <div>Could not load billing information. Please try again later.</div>
  }

  // Mock usage data for UI purposes, can be connected to backend later
  const usage = { apiCalls: 8547, storage: 2.3 };

  return (
    <div className="space-y-6">
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
                  <span className="text-sm text-muted-foreground">{usage.apiCalls.toLocaleString()} / {currentPlanData.apiCalls.toLocaleString()}</span>
                </div>
                <Progress value={(usage.apiCalls / currentPlanData.apiCalls) * 100} className="h-2" />
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
                    <Check size={16} className="text-green-500" />{feature}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Next Billing</p><p className="text-lg font-bold">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p></div><Calendar size={24} className="text-primary" weight="duotone" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Monthly Spend</p><p className="text-lg font-bold">${currentPlanData.price}</p></div><TrendUp size={24} className="text-green-600" weight="duotone" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-muted-foreground">Total API Calls</p><p className="text-lg font-bold">{usage.apiCalls.toLocaleString()}</p></div><Lightning size={24} className="text-primary" weight="duotone" /></div></CardContent></Card>
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
              <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className={`relative rounded-lg border p-6 ${plan.id === currentPlanData.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'} ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                {plan.popular && (<div className="absolute -top-3 left-1/2 transform -translate-x-1/2"><Badge className="bg-primary text-primary-foreground}"><Star size={12} className="mr-1" />Most Popular</Badge></div>)}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold flex items-center justify-center gap-2">{plan.id === 'enterprise' && <Crown size={20} className="text-yellow-500" />}{plan.id === 'professional' && <Sparkle size={20} className="text-primary" />}{plan.name}</h3>
                  <p className="text-3xl font-bold mt-2">{formatPrice(plan.price)}</p>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (<div key={featureIndex} className="flex items-center gap-2 text-sm"><Check size={14} className="text-green-500" />{feature}</div>))}
                </div>
                <Button className="w-full" variant={plan.id === currentPlanData.id ? "outline" : "default"} disabled={plan.id === currentPlanData.id} onClick={() => handleUpgradePlan(plan)}>{plan.id === currentPlanData.id ? 'Current Plan' : plan.price > currentPlanData.price ? 'Upgrade' : 'Downgrade'}</Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Invoice section removed as it's part of a full billing system */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>{selectedPlan && `Are you sure you want to switch to the ${selectedPlan.name} plan?`}</DialogDescription>
          </DialogHeader>
          {selectedPlan && (<div className="py-4"><div className="bg-muted/50 rounded-lg p-4 space-y-3"><div className="flex justify-between"><span>New Plan:</span><span className="font-medium">{selectedPlan.name}</span></div><div className="flex justify-between"><span>New Price:</span><span className="font-medium">{formatPrice(selectedPlan.price)}</span></div></div></div>)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmUpgrade}><CreditCard size={16} className="mr-2" />Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}