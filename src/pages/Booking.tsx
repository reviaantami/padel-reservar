import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Field {
  id: string;
  name: string;
  description: string | null;
  price_per_slot: number;
  image_url: string | null;
}

interface FieldAvailability {
  fieldId: string;
  availableSlots: number;
  totalBookings: number;
}

interface Booking {
  start_time: string;
  end_time: string;
}

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

const Booking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(1);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldAvailability, setFieldAvailability] = useState<Record<string, FieldAvailability>>({});

  useEffect(() => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/auth');
      return;
    }
    fetchFields();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedField && selectedDate) {
      fetchBookedSlots();
    }
  }, [selectedField, selectedDate]);

  const fetchFields = async () => {
    const { data: fieldsData } = await supabase
      .from('fields')
      .select('*')
      .eq('is_active', true);
    
    if (fieldsData) {
      setFields(fieldsData);
      // Fetch availability for each field
      fieldsData.forEach(field => {
        fetchFieldAvailability(field.id);
      });
    }
  };

  const fetchFieldAvailability = async (fieldId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('field_id', fieldId)
      .eq('booking_date', today)
      .neq('status', 'canceled');

    if (bookings) {
      const bookedHours = new Set<string>();
      bookings.forEach((booking: Booking) => {
        const startHour = parseInt(booking.start_time.slice(0, 2));
        const endHour = parseInt(booking.end_time.slice(0, 2));
        for (let hour = startHour; hour < endHour; hour++) {
          bookedHours.add(String(hour));
        }
      });

      // Calculate available slots (total slots - booked slots)
      const totalSlots = timeSlots.length;
      const availability: FieldAvailability = {
        fieldId,
        availableSlots: totalSlots - bookedHours.size,
        totalBookings: bookings.length
      };

      setFieldAvailability(prev => ({
        ...prev,
        [fieldId]: availability
      }));
    }
  };

  const fetchBookedSlots = async () => {
    if (!selectedField || !selectedDate) return;

    const { data } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('field_id', selectedField.id)
      .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
      .neq('status', 'canceled');

    if (data) {
      // Get all booked slots including duration
      const bookedTimeSlots = new Set<string>();
      data.forEach((booking: Booking) => {
        const startHour = parseInt(booking.start_time.slice(0, 2));
        const endHour = parseInt(booking.end_time.slice(0, 2));
        
        // Add all hours between start and end time
        for (let hour = startHour; hour < endHour; hour++) {
          bookedTimeSlots.add(`${String(hour).padStart(2, '0')}:00`);
        }
      });
      
      setBookedSlots(Array.from(bookedTimeSlots));
    }
  };

  const handleBooking = async () => {
      if (!selectedField || !selectedDate || !selectedSlot || !user) return;
    
      setLoading(true);
      try {
        const startTime = selectedSlot;
        const [hour] = startTime.split(':').map(Number);
        const endTime = `${String(hour + duration).padStart(2, '0')}:00`;
    
        // 1. Insert booking ke supabase
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            user_id: user.id,
            field_id: selectedField.id,
            booking_date: format(selectedDate, 'yyyy-MM-dd'),
            start_time: startTime,
            end_time: endTime,
            total_amount: selectedField.price_per_slot * duration,
            status: 'pending',
          })
          .select()
          .single(); // biar dapat data booking yang baru disimpan
        
        if (error) throw error;
        
        // 2. Ambil webhook_booking dari settings
        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'webhook_booking')
          .single();
        
        if (settingsData?.value) {
          // 🔑 Ambil profile user dari tabel profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', user.id) // FIXED
            .single();
        
          if (profileError) console.error(profileError);
        
          // 3. Kirim data booking ke webhook n8n
          await fetch(settingsData.value, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking: data,
              user: {
                id: user.id,
                email: user.email,
                full_name: profileData?.full_name || '',
                phone: profileData?.phone || '',
              },
              field: selectedField,
            }),
          });
        }


    
        toast.success('Booking berhasil! Silakan lakukan pembayaran');
        navigate('/payment', {
          state: {
            fieldName: selectedField.name,
            date: format(selectedDate, 'dd MMMM yyyy', { locale: id }),
            time: `${startTime} - ${endTime}`,
            amount: selectedField.price_per_slot * duration,
          }
        });
      } catch (error: any) {
        toast.error(error.message || 'Gagal melakukan booking');
      } finally {
        setLoading(false);
      }
    };


  const isSlotBooked = (slot: string) => {
    const slotHour = parseInt(slot.split(':')[0]);
    
    // Check if any slot within the duration is booked
    for (let i = 0; i < duration; i++) {
      const checkHour = slotHour + i;
      const checkSlot = `${String(checkHour).padStart(2, '0')}:00`;
      if (bookedSlots.includes(checkSlot)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Booking Lapangan</h1>

        {/* Step 1: Select Field */}
        <Card className="mb-8 shadow-elegant">
          <CardHeader>
            <CardTitle>1. Pilih Lapangan</CardTitle>
            <CardDescription>Pilih lapangan yang ingin Anda booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map((field) => (
                <Card
                  key={field.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-elegant ${
                    selectedField?.id === field.id ? 'ring-2 ring-primary shadow-glow' : ''
                  }`}
                  onClick={() => setSelectedField(field)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{field.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {field.description || 'Lapangan berkualitas'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        Rp {field.price_per_slot.toLocaleString('id-ID')}
                      </p>
                      <p className="text-sm text-muted-foreground">per jam</p>
                    </div>
                    {fieldAvailability[field.id] && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Slot Tersedia:</span>
                          <span className="font-medium">{fieldAvailability[field.id].availableSlots} jam</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Booking Hari Ini:</span>
                          <span className="font-medium">{fieldAvailability[field.id].totalBookings}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{
                              width: `${(fieldAvailability[field.id].availableSlots / timeSlots.length) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Date */}
        {selectedField && (
          <Card className="mb-8 shadow-elegant">
            <CardHeader>
              <CardTitle>2. Pilih Tanggal</CardTitle>
              <CardDescription>Pilih tanggal booking Anda</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        )}

        {/* Step 3: Select Time */}
        {selectedField && selectedDate && (
          <Card className="mb-8 shadow-elegant">
            <CardHeader>
              <CardTitle>3. Pilih Durasi & Waktu</CardTitle>
              <CardDescription>
                Pilih durasi dan waktu booking Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-2 block">Durasi Booking</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((hours) => (
                      <Button
                        key={hours}
                        variant={duration === hours ? 'default' : 'outline'}
                        onClick={() => setDuration(hours)}
                        className="w-full py-6"
                      >
                        {hours} Jam
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-2 block">Pilih Waktu Mulai</Label>
                  <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
                    {timeSlots.map((slot) => {
                      const [hour] = slot.split(':').map(Number);
                      const isLastSlots = hour > (22 - duration);
                      const booked = isSlotBooked(slot);
                      return (
                        <Button
                          key={slot}
                          variant={selectedSlot === slot ? 'default' : 'outline'}
                          disabled={booked || isLastSlots}
                          onClick={() => setSelectedSlot(slot)}
                          className={`${booked || isLastSlots ? 'opacity-50' : ''} transition-all duration-300`}
                        >
                          {slot}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {bookedSlots.length > 0 && (
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-semibold mb-2 block">Slot yang Sudah Dibooking:</Label>
                  <div className="flex flex-wrap gap-2">
                    {bookedSlots.map((slot) => (
                      <span key={slot} className="px-3 py-1 bg-destructive/10 text-destructive rounded-md text-sm">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary and Checkout */}
        {selectedField && selectedDate && selectedSlot && (
          <Card className="shadow-elegant border-2 border-primary">
            <CardHeader>
              <CardTitle>Ringkasan Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lapangan:</span>
                  <span className="font-semibold">{selectedField.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal:</span>
                  <span className="font-semibold">
                    {format(selectedDate, 'dd MMMM yyyy', { locale: id })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waktu:</span>
                  <span className="font-semibold">{selectedSlot} - {String(parseInt(selectedSlot.split(':')[0]) + duration).padStart(2, '0')}:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durasi:</span>
                  <span className="font-semibold">{duration} Jam</span>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    Rp {(selectedField.price_per_slot * duration).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <Button 
                onClick={handleBooking}
                disabled={loading}
                className="w-full shadow-glow"
                size="lg"
              >
                {loading ? 'Memproses...' : 'Konfirmasi Booking'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Booking;