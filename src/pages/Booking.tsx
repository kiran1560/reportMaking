import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLimsStore } from '@/store/limsStore';
import { AVAILABLE_TESTS, Patient, Test } from '@/types/lims';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { UserPlus, FlaskConical, Search, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Booking() {
  const { patients, addPatient, addOrder } = useLimsStore();
  
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTests, setSelectedTests] = useState<Test[]>([]);
  
  // New patient form
  const [patientForm, setPatientForm] = useState({
    name: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    phone: '',
    email: '',
    address: '',
  });

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm)
  );

  const handleTestToggle = (test: Test) => {
    setSelectedTests((prev) =>
      prev.find((t) => t.id === test.id)
        ? prev.filter((t) => t.id !== test.id)
        : [...prev, test]
    );
  };

  const totalAmount = selectedTests.reduce((sum, test) => sum + test.price, 0);

  const handleSubmit = () => {
    let patient = selectedPatient;

    if (mode === 'new') {
      if (!patientForm.name || !patientForm.phone || !patientForm.age) {
        toast.error('Please fill in all required patient details');
        return;
      }
      patient = addPatient({
        name: patientForm.name,
        age: parseInt(patientForm.age),
        gender: patientForm.gender,
        phone: patientForm.phone,
        email: patientForm.email || undefined,
        address: patientForm.address || undefined,
      });
    }

    if (!patient) {
      toast.error('Please select or register a patient');
      return;
    }

    if (selectedTests.length === 0) {
      toast.error('Please select at least one test');
      return;
    }

    const order = addOrder({
      patient,
      tests: selectedTests,
      status: 'booked',
    });

    toast.success(`Order ${order.orderId} created successfully!`, {
      description: `Barcode: ${order.barcode}`,
    });

    // Reset form
    setPatientForm({
      name: '',
      age: '',
      gender: 'male',
      phone: '',
      email: '',
      address: '',
    });
    setSelectedPatient(null);
    setSelectedTests([]);
    setSearchTerm('');
  };

  const testCategories = [...new Set(AVAILABLE_TESTS.map((t) => t.category))];

  return (
    <MainLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">New Booking</h1>
          <p className="text-muted-foreground mt-1">
            Register patient and order tests in one place
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Patient Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <Button
                  variant={mode === 'new' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setMode('new');
                    setSelectedPatient(null);
                  }}
                >
                  New Patient
                </Button>
                <Button
                  variant={mode === 'existing' ? 'default' : 'ghost'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMode('existing')}
                >
                  Existing Patient
                </Button>
              </div>

              {mode === 'existing' ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredPatients.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {patients.length === 0
                          ? 'No patients registered yet'
                          : 'No patients found'}
                      </p>
                    ) : (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          onClick={() => setSelectedPatient(patient)}
                          className={cn(
                            'p-3 rounded-lg cursor-pointer transition-colors border',
                            selectedPatient?.id === patient.id
                              ? 'border-primary bg-primary/5'
                              : 'border-transparent bg-muted/30 hover:bg-muted/50'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {patient.age} yrs • {patient.gender} • {patient.phone}
                              </p>
                            </div>
                            {selectedPatient?.id === patient.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter patient name"
                        value={patientForm.name}
                        onChange={(e) =>
                          setPatientForm({ ...patientForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Age"
                        value={patientForm.age}
                        onChange={(e) =>
                          setPatientForm({ ...patientForm, age: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select
                        value={patientForm.gender}
                        onValueChange={(value: 'male' | 'female' | 'other') =>
                          setPatientForm({ ...patientForm, gender: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        placeholder="Phone number"
                        value={patientForm.phone}
                        onChange={(e) =>
                          setPatientForm({ ...patientForm, phone: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email (optional)"
                        value={patientForm.email}
                        onChange={(e) =>
                          setPatientForm({ ...patientForm, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="Address (optional)"
                        value={patientForm.address}
                        onChange={(e) =>
                          setPatientForm({ ...patientForm, address: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tests Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                Select Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testCategories.map((category) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="space-y-2">
                      {AVAILABLE_TESTS.filter((t) => t.category === category).map((test) => {
                        const isSelected = selectedTests.some((t) => t.id === test.id);
                        return (
                          <div
                            key={test.id}
                            onClick={() => handleTestToggle(test)}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border',
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-transparent bg-muted/30 hover:bg-muted/50'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleTestToggle(test)}
                              />
                              <div>
                                <p className="font-medium text-sm">{test.name}</p>
                                <p className="text-xs text-muted-foreground">{test.code}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-primary">${test.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Submit */}
        <Card className="glass-card mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {selectedTests.length} test(s) selected
                </p>
                <p className="text-2xl font-bold text-primary">
                  Total: ${totalAmount}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTests([]);
                    setSelectedPatient(null);
                    setPatientForm({
                      name: '',
                      age: '',
                      gender: 'male',
                      phone: '',
                      email: '',
                      address: '',
                    });
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={handleSubmit} size="lg">
                  <Check className="h-4 w-4 mr-2" />
                  Create Booking
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
