import { useLimsStore } from '@/store/limsStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  ClipboardList,
  FlaskConical,
  FileCheck,
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/types/lims';

const statusFlow: OrderStatus[] = [
  'booked',
  'sample_received',
  'accepted',
  'work_in_progress',
  'result_saved',
  'report_created',
  'verified',
  'delivered',
];

export default function Dashboard() {
  const { orders, patients } = useLimsStore();

  const stats = [
    {
      name: 'Total Orders',
      value: orders.length,
      icon: ClipboardList,
      color: 'bg-primary/10 text-primary',
    },
    {
      name: 'Pending Samples',
      value: orders.filter((o) => o.status === 'booked').length,
      icon: FlaskConical,
      color: 'bg-info/10 text-info',
    },
    {
      name: 'Awaiting Verification',
      value: orders.filter((o) => o.status === 'report_created').length,
      icon: FileCheck,
      color: 'bg-warning/10 text-warning',
    },
    {
      name: 'Registered Patients',
      value: patients.length,
      icon: Users,
      color: 'bg-success/10 text-success',
    },
  ];

  const recentOrders = orders.slice(-5).reverse();

  return (
    <MainLayout>
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your laboratory operations.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name} className="glass-card hover:shadow-glow transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link to="/booking">
                <Button className="w-full justify-start gap-3" size="lg">
                  <ClipboardList className="h-5 w-5" />
                  New Test Booking
                </Button>
              </Link>
              <Link to="/samples">
                <Button variant="secondary" className="w-full justify-start gap-3" size="lg">
                  <FlaskConical className="h-5 w-5" />
                  Track Samples
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" className="w-full justify-start gap-3" size="lg">
                  <FileCheck className="h-5 w-5" />
                  Create Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                  <Link to="/booking">
                    <Button variant="link" className="mt-2">Create your first booking</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{order.orderId}</p>
                        <p className="text-xs text-muted-foreground">{order.patient.name}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Workflow Overview */}
        <Card className="glass-card mt-6">
          <CardHeader>
            <CardTitle>Workflow Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 items-center justify-center">
              {statusFlow.map((status, index) => {
                const count = orders.filter((o) => o.status === status).length;
                return (
                  <div key={status} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <StatusBadge status={status} />
                      <span className="text-xs text-muted-foreground mt-1">{count} orders</span>
                    </div>
                    {index < statusFlow.length - 1 && (
                      <div className="mx-2 text-muted-foreground">→</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
