import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLimsStore } from '@/store/limsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { toast } from 'sonner';
import { FileText, Search, Save, Eye, FileCode } from 'lucide-react';
import { Order } from '@/types/lims';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const REPORT_TEMPLATES = {
  cbc: `<h2>Complete Blood Count (CBC) Report</h2>
<table>
  <tr>
    <th>Parameter</th>
    <th>Result</th>
    <th>Unit</th>
    <th>Normal Range</th>
  </tr>
  <tr>
    <td>Hemoglobin</td>
    <td></td>
    <td>g/dL</td>
    <td>12-16 (F), 14-18 (M)</td>
  </tr>
  <tr>
    <td>RBC Count</td>
    <td></td>
    <td>million/cmm</td>
    <td>4.5-5.5</td>
  </tr>
  <tr>
    <td>WBC Count</td>
    <td></td>
    <td>/cmm</td>
    <td>4000-11000</td>
  </tr>
  <tr>
    <td>Platelet Count</td>
    <td></td>
    <td>lakh/cmm</td>
    <td>1.5-4.0</td>
  </tr>
</table>
<p><strong>Interpretation:</strong></p>
<p></p>`,
  thyroid: `<h2>Thyroid Profile Report</h2>
<table>
  <tr>
    <th>Parameter</th>
    <th>Result</th>
    <th>Unit</th>
    <th>Normal Range</th>
  </tr>
  <tr>
    <td>TSH</td>
    <td></td>
    <td>mIU/L</td>
    <td>0.4-4.0</td>
  </tr>
  <tr>
    <td>T3</td>
    <td></td>
    <td>ng/dL</td>
    <td>80-200</td>
  </tr>
  <tr>
    <td>T4</td>
    <td></td>
    <td>μg/dL</td>
    <td>4.5-12.5</td>
  </tr>
</table>
<p><strong>Interpretation:</strong></p>
<p></p>`,
  blank: `<h2>Laboratory Report</h2>
<p>Patient information and test results will be documented here.</p>
<p></p>`,
};

export default function ReportEditor() {
  const { orders, updateOrder, updateOrderStatus } = useLimsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reportContent, setReportContent] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Orders with results saved
  const eligibleOrders = orders.filter(
    (order) =>
      (order.status === 'result_saved' || order.status === 'report_created') &&
      (order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    setReportContent(order.reportContent || generateDefaultReport(order));
  };

  const generateDefaultReport = (order: Order) => {
    let content = `<h1>Laboratory Test Report</h1>
<p><strong>Order ID:</strong> ${order.orderId}</p>
<p><strong>Patient:</strong> ${order.patient.name}</p>
<p><strong>Age/Gender:</strong> ${order.patient.age} years / ${order.patient.gender}</p>
<p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
<hr/>
<h2>Test Results</h2>
<table>
  <tr>
    <th>Test Name</th>
    <th>Result</th>
    <th>Unit</th>
    <th>Reference Range</th>
    <th>Status</th>
  </tr>`;

    if (order.results) {
      order.results.forEach((result) => {
        const status = result.isAbnormal
          ? '<span style="color: #DC2626; font-weight: bold;">Abnormal</span>'
          : 'Normal';
        content += `
  <tr>
    <td>${result.testName}</td>
    <td>${result.value}</td>
    <td>${result.unit}</td>
    <td>${result.referenceRange}</td>
    <td>${status}</td>
  </tr>`;
      });
    }

    content += `</table>
<h2>Interpretation</h2>
<p></p>
<h2>Comments</h2>
<p></p>`;

    return content;
  };

  const handleInsertTemplate = (templateKey: keyof typeof REPORT_TEMPLATES) => {
    setReportContent((prev) => prev + REPORT_TEMPLATES[templateKey]);
    toast.success('Template inserted');
  };

  const handleSaveReport = () => {
    if (!selectedOrder) return;

    updateOrder(selectedOrder.id, { reportContent });
    if (selectedOrder.status === 'result_saved') {
      updateOrderStatus(selectedOrder.id, 'report_created');
    }
    toast.success(`Report saved for ${selectedOrder.orderId}`);
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Report Editor</h1>
          <p className="text-muted-foreground mt-1">
            Create and format medical reports with rich text editing
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Orders List */}
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Orders Ready</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {eligibleOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No orders ready for reports
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
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{order.orderId}</p>
                          <StatusBadge status={order.status} className="text-[10px] px-2 py-0.5" />
                        </div>
                        <p className="text-xs text-muted-foreground">{order.patient.name}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {selectedOrder ? `Report: ${selectedOrder.orderId}` : 'Report Editor'}
                  </CardTitle>
                  {selectedOrder && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" onClick={handleSaveReport}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Report
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedOrder ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an order to create or edit its report</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Templates */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-muted-foreground">Insert Template:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsertTemplate('cbc')}
                      >
                        <FileCode className="h-4 w-4 mr-1" />
                        CBC
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsertTemplate('thyroid')}
                      >
                        <FileCode className="h-4 w-4 mr-1" />
                        Thyroid
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsertTemplate('blank')}
                      >
                        <FileCode className="h-4 w-4 mr-1" />
                        Blank
                      </Button>
                    </div>

                    {/* Rich Text Editor */}
                    <RichTextEditor
                      content={reportContent}
                      onChange={setReportContent}
                      className="min-h-[400px]"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Report Preview</DialogTitle>
            </DialogHeader>
            <div className="border rounded-lg p-6 bg-background">
              {/* Header */}
              <div className="text-center border-b pb-4 mb-4">
                <h1 className="text-xl font-bold text-primary">MediLab Diagnostics</h1>
                <p className="text-sm text-muted-foreground">
                  123 Medical Center Road, City - 12345
                </p>
                <p className="text-sm text-muted-foreground">
                  Phone: +1 234 567 8900 | Email: info@medilab.com
                </p>
              </div>

              {/* Report Content */}
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: reportContent }}
              />

              {/* Footer */}
              <div className="border-t mt-6 pt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div>
                    <p>Verified by: ___________________</p>
                    <p>Doctor Signature</p>
                  </div>
                  <div className="text-right">
                    <p>Generated: {new Date().toLocaleString()}</p>
                    <p className="text-xs mt-2">
                      * This report is electronically generated
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
