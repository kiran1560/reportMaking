import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLimsStore } from '@/store/limsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  CheckCircle,
  Search,
  PauseCircle,
  Eye,
  FileCheck,
  Printer,
  Download,
} from 'lucide-react';
import { Order } from '@/types/lims';
import { cn } from '@/lib/utils';

export default function Verification() {
  const { orders, updateOrderStatus } = useLimsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [holdDialogOpen, setHoldDialogOpen] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [holdReason, setHoldReason] = useState('');

  // Orders ready for verification
  const eligibleOrders = orders.filter(
    (order) =>
      (order.status === 'report_created' || order.status === 'on_hold' || order.status === 'verified') &&
      (order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleVerify = () => {
    if (!selectedOrder || !doctorName.trim()) {
      toast.error('Please enter doctor name');
      return;
    }

    updateOrderStatus(selectedOrder.id, 'verified', {
      verifiedAt: new Date(),
      verifiedBy: doctorName,
    });
    toast.success(`Report verified for ${selectedOrder.orderId}`);
    setSelectedOrder(null);
    setDoctorName('');
  };

  const handleHold = () => {
    if (!selectedOrder || !holdReason.trim()) {
      toast.error('Please provide a reason for holding');
      return;
    }

    updateOrderStatus(selectedOrder.id, 'on_hold');
    toast.warning(`Report on hold for ${selectedOrder.orderId}`);
    setHoldDialogOpen(false);
    setHoldReason('');
    setSelectedOrder(null);
  };

  const handleDeliver = (order: Order) => {
    updateOrderStatus(order.id, 'delivered', {
      deliveredAt: new Date(),
    });
    toast.success(`Report delivered for ${order.orderId}`);
  };

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Doctor Verification</h1>
          <p className="text-muted-foreground mt-1">
            Review and verify test reports before delivery
          </p>
        </div>

        {/* Search */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Order ID or Patient Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {eligibleOrders.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No reports pending verification</p>
              </CardContent>
            </Card>
          ) : (
            eligibleOrders.map((order) => (
              <Card key={order.id} className="glass-card hover:shadow-glow transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{order.orderId}</h3>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Patient</p>
                          <p className="font-medium">{order.patient.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tests</p>
                          <p className="font-medium">
                            {order.tests.map((t) => t.code).join(', ')}
                          </p>
                        </div>
                        {order.verifiedBy && (
                          <div>
                            <p className="text-muted-foreground">Verified By</p>
                            <p className="font-medium">{order.verifiedBy}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setPreviewOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Report
                      </Button>
                      {order.status === 'report_created' && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setHoldDialogOpen(true);
                            }}
                          >
                            <PauseCircle className="h-4 w-4 mr-1" />
                            Hold
                          </Button>
                          <Button size="sm" onClick={() => setSelectedOrder(order)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                        </>
                      )}
                      {order.status === 'verified' && (
                        <>
                          <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="h-4 w-4 mr-1" />
                            Print
                          </Button>
                          <Button size="sm" onClick={() => handleDeliver(order)}>
                            <Download className="h-4 w-4 mr-1" />
                            Deliver
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Verify Dialog */}
        <Dialog
          open={selectedOrder !== null && !previewOpen && !holdDialogOpen}
          onOpenChange={() => setSelectedOrder(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Verify report for order <strong>{selectedOrder?.orderId}</strong>
              </p>
              <div>
                <label className="text-sm font-medium">Doctor Name</label>
                <Input
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Enter verifying doctor's name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Cancel
              </Button>
              <Button onClick={handleVerify}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify & Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hold Dialog */}
        <Dialog open={holdDialogOpen} onOpenChange={setHoldDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Put Report On Hold</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                placeholder="Reason for holding (e.g., need clarification, re-testing required...)"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setHoldDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleHold}>
                <PauseCircle className="h-4 w-4 mr-2" />
                Put On Hold
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Preview</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="border rounded-lg p-6 bg-background">
                {/* Header */}
                <div className="text-center border-b pb-4 mb-4">
                  <h1 className="text-xl font-bold text-primary">MediLab Diagnostics</h1>
                  <p className="text-sm text-muted-foreground">
                    123 Medical Center Road, City - 12345
                  </p>
                </div>

                {/* Report Content */}
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: selectedOrder.reportContent || '<p>No report content available</p>',
                  }}
                />

                {/* Footer */}
                <div className="border-t mt-6 pt-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>
                      {selectedOrder.verifiedBy ? (
                        <p>Verified by: {selectedOrder.verifiedBy}</p>
                      ) : (
                        <p>Verified by: ___________________</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p>
                        {selectedOrder.verifiedAt
                          ? `Verified: ${new Date(selectedOrder.verifiedAt).toLocaleString()}`
                          : 'Pending verification'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
