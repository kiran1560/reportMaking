import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLimsStore } from '@/store/limsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, Phone, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Patients() {
  const { patients, orders } = useLimsStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPatientOrders = (patientId: string) => {
    return orders.filter((order) => order.patient.id === patientId);
  };

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Registered Patients</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all registered patients
          </p>
        </div>

        {/* Search */}
        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Patients Grid */}
        {filteredPatients.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {patients.length === 0
                  ? 'No patients registered yet. Create a booking to register patients.'
                  : 'No patients match your search.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => {
              const patientOrders = getPatientOrders(patient.id);
              return (
                <Card key={patient.id} className="glass-card hover:shadow-glow transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{patient.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {patient.age} years • {patient.gender}
                        </p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{patient.phone}</span>
                      </div>
                      {patient.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{patient.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Registered: {format(new Date(patient.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    {patient.address && (
                      <p className="mt-3 text-xs text-muted-foreground">{patient.address}</p>
                    )}

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Orders</span>
                        <span className="font-semibold text-primary">{patientOrders.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
