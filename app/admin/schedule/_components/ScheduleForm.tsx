// app/admin/schedule/_components/ScheduleForm.tsx
"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/_components/ui/form";
import { OperatingHours } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateOperatingHours } from "../_actions/scheduleActions";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const operatingHourSchema = z.object({
  dbId: z.string().optional(), // Para manter o ID se estiver editando
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().refine(val => val === "" || timeRegex.test(val), {
    message: "Formato HH:MM ou vazio.",
  }),
  endTime: z.string().refine(val => val === "" || timeRegex.test(val), {
    message: "Formato HH:MM ou vazio.",
  }),
  isClosed: z.boolean(),
}).refine(data => {
    if (!data.isClosed) {
        if (!data.startTime || !data.endTime) {
            return false; // Ambos obrigatórios se não fechado
        }
        if (data.startTime && data.endTime) { // Comparar apenas se ambos existem
            const [startH, startM] = data.startTime.split(':').map(Number);
            const [endH, endM] = data.endTime.split(':').map(Number);
            if (endH < startH || (endH === startH && endM <= startM)) {
                return false; // Fim deve ser após início
            }
        }
    }
    return true;
}, {
    message: "Se aberto, horários de início e fim são obrigatórios, e o fim deve ser após o início.",
    path: ["endTime"], // Path para o erro
});

const scheduleFormSchema = z.object({
  hours: z.array(operatingHourSchema),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;
const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

interface ScheduleFormProps {
  initialHours: OperatingHours[];
}

export default function ScheduleForm({ initialHours }: ScheduleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const defaultHours = daysOfWeek.map((_, index) => {
    const existing = initialHours.find(h => h.dayOfWeek === index);
    return {
      dbId: existing?.id,
      dayOfWeek: index,
      startTime: existing && !existing.isClosed ? existing.startTime : "",
      endTime: existing && !existing.isClosed ? existing.endTime : "",
      isClosed: existing ? existing.isClosed : (index === 0 || index === 6), // Dom/Sab fechado por padrão
    };
  });

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { hours: defaultHours },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "hours",
  });

  const onSubmit = async (data: ScheduleFormValues) => {
    setIsLoading(true);
    try {
      await updateOperatingHours(data.hours);
      toast.success("Horários de funcionamento atualizados com sucesso!");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update schedule:", error);
      toast.error(error.message || "Falha ao atualizar os horários.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
            {fields.map((fieldItem, index) => {
            const currentDayIsClosed = form.watch(`hours.${index}.isClosed`);
            return (
                <Card key={fieldItem.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 p-4 border-b">
                    <CardTitle className="text-lg flex items-center justify-between">
                    {daysOfWeek[fieldItem.dayOfWeek]}
                    <Controller
                        control={form.control}
                        name={`hours.${index}.isClosed`}
                        render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    if (checked) { // Se marcar como fechado, limpa os horários
                                        form.setValue(`hours.${index}.startTime`, "");
                                        form.setValue(`hours.${index}.endTime`, "");
                                    } else { // Se marcar como aberto, define horários padrão se vazios
                                        if(!form.getValues(`hours.${index}.startTime`)) form.setValue(`hours.${index}.startTime`, "09:00");
                                        if(!form.getValues(`hours.${index}.endTime`)) form.setValue(`hours.${index}.endTime`, "18:00");
                                    }
                                }}
                            />
                            </FormControl>
                            <FormLabel className="font-normal text-sm cursor-pointer select-none">
                                Fechado
                            </FormLabel>
                        </FormItem>
                        )}
                    />
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    {!currentDayIsClosed && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name={`hours.${index}.startTime`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Horário de Início</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} disabled={currentDayIsClosed} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={`hours.${index}.endTime`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Horário de Término</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} disabled={currentDayIsClosed} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    )}
                    {currentDayIsClosed && (
                        <p className="text-sm text-muted-foreground text-center py-4">Fechado neste dia.</p>
                    )}
                     {/* Exibe erro específico do array item */}
                    {form.formState.errors.hours?.[index] && !currentDayIsClosed && (
                        <p className="text-xs text-destructive mt-2">
                            {form.formState.errors.hours[index]?.startTime?.message ||
                             form.formState.errors.hours[index]?.endTime?.message ||
                             form.formState.errors.hours[index]?.root?.message}
                        </p>
                    )}
                </CardContent>
                </Card>
            );
            })}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full md:w-auto text-md py-3 px-6">
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          Salvar Alterações nos Horários
        </Button>
      </form>
    </Form>
  );
}