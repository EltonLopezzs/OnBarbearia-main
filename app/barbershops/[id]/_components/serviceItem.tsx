"use client"; // ESSENCIAL

import { Booking } from "@prisma/client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ptBR } from "date-fns/locale";
import { format, setHours, setMinutes, isValid, eachDayOfInterval } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateDayTimeList } from "../_helpers/hours";
import * as saveBooking from "../_actions/save-booking";
import { getDayBookings } from "../_actions/get-day-bookings";
import BookingInfo from "@/app/_components/booking-info";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import { Dialog, DialogContent } from "@/app/_components/ui/dialog";
import SigInDialog from "@/app/_components/sig-in-dialog";
import type { DisplayableService, SimpleBarbershopForServiceItem } from "../page";

interface ServiceItemProps {
  barbershop: SimpleBarbershopForServiceItem;
  service: DisplayableService;
  isAuthenticated: boolean;
}

const ServiceItem = ({
  service,
  barbershop,
  isAuthenticated,
}: ServiceItemProps) => {
  const router = useRouter();
  const { data } = useSession();

  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>();
  const [submitIsLoading, setSubmitIsLoading] = useState(false);
  const [sheetIsOpen, setSheetIsOpen] = useState(false);
  const [dayBookings, setDayBookingsState] = useState<Booking[]>([]);

  useEffect(() => {
    if (!date || !isValid(date)) {
      setDayBookingsState([]);
      return;
    }
    const refreshAvaliableHours = async () => {
      try {
        const _dayBookings = await getDayBookings(barbershop.id, date);
        setDayBookingsState(_dayBookings);
      } catch (error) {
        console.error("Erro ao buscar agendamentos do dia:", error);
        setDayBookingsState([]);
      }
    };
    refreshAvaliableHours();
  }, [date, barbershop.id]);

  const handleDateClick = (selectedDate: Date) => {
    setDate(selectedDate);
    setHour(undefined);
  };

  const handleHourClick = (time: string) => {
    setHour(time);
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      return setSignInDialogIsOpen(true);
    }
    setSheetIsOpen(true);
  };

  const handleBookingSubmit = async () => {
    if (!hour || !date || !isValid(date) || !data?.user) {
      toast.error("Selecione uma data e horário válidos.");
      return;
    }
    setSubmitIsLoading(true);
    try {
      const dateHour = Number(hour.split(":")[0]);
      const dateMinutes = Number(hour.split(":")[1]);
      const newDate = setMinutes(setHours(date, dateHour), dateMinutes);

      await saveBooking.saveBooking({
        serviceId: service.id,
        barbershopId: barbershop.id,
        date: newDate,
        userId: (data.user as any).id,
      });

      setSheetIsOpen(false);
      setHour(undefined);
      setDate(undefined);
      toast("Reserva realizada com sucesso!", {
        description: format(newDate, "'Para' dd 'de' MMMM 'às' HH':'mm'.'", {
          locale: ptBR,
        }),
        action: {
          label: "Visualizar",
          onClick: () => router.push("/bookings"),
        },
      });
    } catch (error) {
      console.error("Erro ao realizar reserva:", error);
      toast.error("Falha ao realizar reserva.");
    } finally {
      setSubmitIsLoading(false);
    }
  };

  const timeList = useMemo(() => {
    if (!date || !isValid(date)) {
      return [];
    }
    return generateDayTimeList(date).filter((time) => {
      const timeHour = Number(time.split(":")[0]);
      const timeMinutes = Number(time.split(":")[1]);
      const bookingExists = dayBookings.find((b) => {
        const bookingDate = new Date(b.date);
        return bookingDate.getHours() === timeHour && bookingDate.getMinutes() === timeMinutes;
      });
      return !bookingExists;
    });
  }, [date, dayBookings]);

  // Generate list of dates for May 2025 starting from today (May 24, 2025)
  const dateList = useMemo(() => {
    const startDate = new Date(2025, 4, 24); // May 24, 2025
    const endDate = new Date(2025, 4, 31); // May 31, 2025
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, []);

  return (
    <>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
            <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
              <Image
                fill
                src={service.imageUrl || "/placeholder-image.png"}
                alt={service.name}
                style={{ objectFit: "contain" }}
                className="rounded-lg"
              />
            </div>
            <div className="flex w-full flex-col">
              <h2 className="font-bold lg:text-base">{service.name}</h2>
              <p className="text-sm text-gray-400">{service.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-bold text-primary lg:text-base">
                  {Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(service.price)}
                </p>
                <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="secondary" onClick={handleBookingClick}>
                      Reservar
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="p-0 flex flex-col h-full">
                    <SheetHeader className="border-b border-solid border-secondary px-5 py-5 text-left">
                      <SheetTitle>Fazer Reserva</SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-5">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div>
                          <h3 className="text-sm font-semibold mb-3 border-b pb-2">
                            Datas para maio 2025
                          </h3>
                          <div className="grid grid-cols-4 gap-2">
                            {dateList.map((d) => (
                              <Button
                                key={d.toISOString()}
                                variant={date && isValid(date) && d.getTime() === date.getTime() ? "default" : "outline"}
                                className="rounded-full text-xs h-9"
                                onClick={() => handleDateClick(d)}
                              >
                                {format(d, "dd")}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {date && isValid(date) && (
                          <div className="lg:w-full lg:max-w-xs">
                            <h3 className="text-sm font-semibold mb-3 border-b pb-2">
                              Horários para {format(date, "dd 'de' MMMM", { locale: ptBR })}
                            </h3>
                            {timeList.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2">
                                {timeList.map((time) => (
                                  <Button
                                    variant={hour === time ? "default" : "outline"}
                                    key={time}
                                    className="rounded-full text-xs h-9"
                                    onClick={() => handleHourClick(time)}
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-center text-gray-400 py-4">
                                Nenhum horário disponível.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {date && isValid(date) && hour && (
                      <div className="border-t border-solid border-secondary px-5 py-4">
                        <BookingInfo
                          booking={{
                            barbershop: { name: barbershop.name },
                            date: setMinutes(setHours(date, Number(hour.split(":")[0])), Number(hour.split(":")[1])),
                            Service: {
                              name: service.name,
                              price: service.price,
                            },
                          }}
                        />
                      </div>
                    )}
                    <SheetFooter className="px-5 pb-5 border-t border-secondary pt-4">
                      <Button
                        onClick={handleBookingSubmit}
                        disabled={!hour || !date || !isValid(date) || submitIsLoading}
                        className="w-full"
                      >
                        {submitIsLoading && <Loader2 className="mr-2 flex h-4 w-4 animate-spin" />}
                        Confirmar reserva
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={signInDialogIsOpen} onOpenChange={setSignInDialogIsOpen}>
        <DialogContent className="w-[90%] max-w-sm">
          <SigInDialog />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServiceItem;