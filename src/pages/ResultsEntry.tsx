import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLimsStore } from '@/store/limsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from 'sonner';
import { ClipboardList, Search, Save, AlertTriangle, Check } from 'lucide-react';
import { Order, TestResult } from '@/types/lims';
import { cn } from '@/lib/utils';

export default function ResultsEntry() {
  const { orders, updateOrder, updateOrderStatus } = useLimsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [results, setResults] = useState<Record<string, TestResult>>({});

  // Orders that are in work_in_progress status
  const eligibleOrders = orders.filter(
    (order) =>
      order.status === 'work_in_progress' &&
      (order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    // Initialize results from existing or empty
    const initialResults: Record<string, TestResult> = {};
    order.tests.forEach((test) => {
      const existing = order.results?.find((r) => r.testId === test.id);
      initialResults[test.id] = existing || {
        testId: test.id,
        testName: test.name,
        value: '',
        unit: '',
        referenceRange: test.referenceRange || '',
        isAbnormal: false,
      };
    });
    setResults(initialResults);
  };

  const handleResultChange = (testId: string, field: keyof TestResult, value: string | boolean) => {
    setResults((prev) => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value,
      },
    }));
  };

  const handleSaveResults = () => {
    if (!selectedOrder) return;

    const resultArray = Object.values(results);
    const hasEmptyValues = resultArray.some((r) => !r.value.trim());

    if (hasEmptyValues) {
      toast.error('Please fill in all test results');
      return;
    }

    updateOrder(selectedOrder.id, { results: resultArray });
    updateOrderStatus(selectedOrder.id, 'result_saved');
    toast.success(`Results saved for ${selectedOrder.orderId}`);
    setSelectedOrder(null);
    setResults({});
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Results Entry</h1>
          <p className="text-muted-foreground mt-1">
            Enter test results for orders in progress
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Work In Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {eligibleOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No orders in progress
                    </p>
                  ) : (
                    eligibleOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => handleSelectOrder(order)}
                        className={cn(
                          'p-3 rounded-lg cursor-pointer transition-all border',
                          selectedOrder?.id === order.id
                            ? 'border-primary bg-primary/5'
                            : 'border-transparent bg-muted/30 hover:bg-muted/50'
                        )}
                      >
                        <p className="font-medium text-sm">{order.orderId}</p>
                        <p className="text-xs text-muted-foreground">{order.patient.name}</p>
                        <p className="text-xs text-muted-foreground">{order.tests.length} test(s)</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  {selectedOrder ? `Enter Results: ${selectedOrder.orderId}` : 'Select an Order'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedOrder ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an order from the list to enter results</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Patient Info */}
                    <div className="p-4 rounded-lg bg-muted/30">
                      <p className="text-sm">
                        <strong>Patient:</strong> {selectedOrder.patient.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.patient.age} yrs • {selectedOrder.patient.gender}
                      </p>
                    </div>

                    {/* Test Results */}
                    <div className="space-y-4">
                      {selectedOrder.tests.map((test) => {
                        const result = results[test.id];
                        return (
                          <div
                            key={test.id}
                            className={cn(
                              'p-4 rounded-lg border transition-colors',
                              result?.isAbnormal ? 'border-destructive bg-destructive/5' : 'border-border'
                            )}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-medium">{test.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Code: {test.code} • Ref: {test.referenceRange}
                                </p>
                              </div>
                              {result?.isAbnormal && (
                                <span className="flex items-center gap-1 text-xs text-destructive">
                                  <AlertTriangle className="h-3 w-3" />
                                  Abnormal
                                </span>
                              )}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">
                                  Value
                                </label>
                                <Input
                                  value={result?.value || ''}
                                  onChange={(e) =>
                                    handleResultChange(test.id, 'value', e.target.value)
                                  }
                                  placeholder="Enter value"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">
                                  Unit
                                </label>
                                <Input
                                  value={result?.unit || ''}
                                  onChange={(e) =>
                                    handleResultChange(test.id, 'unit', e.target.value)
                                  }
                                  placeholder="e.g., g/dL"
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  variant={result?.isAbnormal ? 'destructive' : 'outline'}
                                  size="sm"
                                  className="w-full"
                                  onClick={() =>
                                    handleResultChange(test.id, 'isAbnormal', !result?.isAbnormal)
                                  }
                                >
                                  {result?.isAbnormal ? 'Abnormal' : 'Normal'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveResults}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Results
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
