import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLimsStore } from '@/store/limsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  FlaskConical,
  Search,
  CheckCircle,
  XCircle,
  Barcode,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order, OrderStatus } from '@/types/lims';

export default function SampleTracking() {
  const { orders, updateOrderStatus } = useLimsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [receiverName, setReceiverName] = useState('');

  const filteredOrders = orders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReceiveSample = (order: Order) => {
    if (!receiverName.trim()) {
      toast.error('Please enter receiver name');
      return;
    }
    updateOrderStatus(order.id, 'sample_received', {
      sampleReceivedAt: new Date(),
      sampleReceivedBy: receiverName,
    });
    toast.success(`Sample received for ${order.orderId}`);
    setSelectedOrder(null);
    setReceiverName('');
  };

  const handleAcceptSample = (order: Order) => {
    updateOrderStatus(order.id, 'accepted', {
      acceptedAt: new Date(),
    });
    toast.success(`Sample accepted for ${order.orderId}`);
  };

  const handleStartWork = (order: Order) => {
    updateOrderStatus(order.id, 'work_in_progress');
    toast.success(`Work started for ${order.orderId}`);
  };

  const handleRejectSample = () => {
    if (!selectedOrder || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    updateOrderStatus(selectedOrder.id, 'rejected', {
      rejectedAt: new Date(),
      rejectionReason,
    });
    toast.error(`Sample rejected for ${selectedOrder.orderId}`);
    setRejectDialogOpen(false);
    setRejectionReason('');
    setSelectedOrder(null);
  };

  const getAvailableActions = (order: Order) => {
    const actions: { label: string; action: () => void; variant: 'default' | 'destructive' | 'secondary' }[] = [];

    switch (order.status) {
      case 'booked':
        actions.push({
          label: 'Receive Sample',
          action: () => setSelectedOrder(order),
          variant: 'default',
        });
        break;
      case 'sample_received':
        actions.push({
          label: 'Accept',
          action: () => handleAcceptSample(order),
          variant: 'default',
        });
        actions.push({
          label: 'Reject',
          action: () => {
            setSelectedOrder(order);
            setRejectDialogOpen(true);
          },
          variant: 'destructive',
        });
        break;
      case 'accepted':
        actions.push({
          label: 'Start Testing',
          action: () => handleStartWork(order),
          variant: 'default',
        });
        break;
    }

    return actions;
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sample Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Manage sample reception, acceptance, and testing workflow
          </p>
        </div>

        {/* Search */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID, Barcode, or Patient Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {orders.length === 0
                    ? 'No orders found. Create a booking first.'
                    : 'No orders match your search.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const actions = getAvailableActions(order);
              return (
                <Card key={order.id} className="glass-card hover:shadow-glow transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{order.orderId}</h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Patient</p>
                            <p className="font-medium">{order.patient.name}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tests</p>
                            <p className="font-medium">{order.tests.length} test(s)</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Barcode className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-xs">{order.barcode}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {order.sampleReceivedBy && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Received by: {order.sampleReceivedBy}
                          </p>
                        )}
                        {order.rejectionReason && (
                          <p className="text-xs text-destructive mt-2">
                            Rejection reason: {order.rejectionReason}
                          </p>
                        )}
                      </div>
                      {actions.length > 0 && (
                        <div className="flex gap-2">
                          {actions.map((action, idx) => (
                            <Button
                              key={idx}
                              variant={action.variant}
                              onClick={action.action}
                              size="sm"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Receive Sample Dialog */}
        <Dialog open={selectedOrder !== null && !rejectDialogOpen} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Receive Sample</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Confirm sample reception for order <strong>{selectedOrder?.orderId}</strong>
              </p>
              <div>
                <label className="text-sm font-medium">Receiver Name</label>
                <Input
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Cancel
              </Button>
              <Button onClick={() => selectedOrder && handleReceiveSample(selectedOrder)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm Reception
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Sample</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Provide a reason for rejecting sample <strong>{selectedOrder?.orderId}</strong>
              </p>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for rejection (e.g., insufficient quantity, damaged container...)"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectSample}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject Sample
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
