// app/admin/services/_components/DeleteServiceButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/_components/ui/alert-dialog";
import { deleteService } from "../_actions/serviceActions";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteServiceButtonProps {
  serviceId: string;
  barbershopId: string;
  serviceName: string;
  onDeleted?: () => void;
}

export default function DeleteServiceButton({ serviceId, barbershopId, serviceName, onDeleted }: DeleteServiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteService(serviceId, barbershopId);
      toast.success(`Serviço "${serviceName}" excluído com sucesso!`);
      setIsAlertOpen(false);
      if(onDeleted) onDeleted();
      router.refresh();
    } catch (error: any) {
      console.error("Failed to delete service:", error);
      toast.error(error.message || "Falha ao excluir o serviço.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full" size="sm">
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o serviço "{serviceName}"? Esta ação não pode ser desfeita. Agendamentos futuros para este serviço impedirão a exclusão.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}