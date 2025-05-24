// OnBarbearia-main/app/admin/services/_components/ServiceForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/_components/ui/form";
// import { Service } from "@prisma/client"; // Não mais necessário se usar SerializableService
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createService, updateService } from "../_actions/serviceActions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { SerializableService } from "../page"; // Importe o tipo

const serviceFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres."),
  description: z.string().min(10, "Descrição deve ter no mínimo 10 caracteres.").max(200, "Máximo 200 caracteres."),
  price: z.coerce.number().min(0.01, "Preço deve ser maior que zero.").positive("Preço deve ser positivo."),
  imageUrl: z.string().url("URL da imagem inválida.").or(z.literal("")).nullable(), // Permitir nullable se imageUrl pode ser null
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormProps {
  barbershopId: string;
  service?: SerializableService | null; // Alterado para SerializableService
  onFormSubmit?: () => void;
}

export default function ServiceForm({ barbershopId, service, onFormSubmit }: ServiceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues = service
    ? {
        name: service.name,
        description: service.description,
        price: service.price, // price já é number aqui
        imageUrl: service.imageUrl || "", // Garante que seja string para o input
      }
    : {
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
      };

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: ServiceFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        imageUrl: data.imageUrl || "", // Garante que imageUrl seja string ou string vazia
      };
      if (service) {
        await updateService(service.id, barbershopId, payload);
        toast.success("Serviço atualizado com sucesso!");
      } else {
        await createService(barbershopId, payload);
        toast.success("Serviço criado com sucesso!");
      }
      router.refresh();
      if (onFormSubmit) onFormSubmit();
      form.reset(service ? payload : defaultValues);
    } catch (error: any) {
      console.error("Failed to save service:", error);
      toast.error(error.message || "Falha ao salvar o serviço.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        {/* ... campos do formulário ... */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Serviço</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Corte Masculino Moderno" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva os detalhes do serviço..." {...field} rows={4}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço (R$)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Ex: 50.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/imagem.png" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {service ? "Atualizar Serviço" : "Adicionar Serviço"}
        </Button>
      </form>
    </Form>
  );
}