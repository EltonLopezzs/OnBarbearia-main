// OnBarbearia-main/app/admin/services/_components/ServiceDialogController.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/_components/ui/dialog";
import { Button } from "@/app/_components/ui/button";
import ServiceForm from "./ServiceForm";
// import { Service } from "@prisma/client"; // Pode não ser mais necessário se usarmos SerializableService
import { PlusCircle, Edit3, LucideProps } from "lucide-react";
import type { SerializableService } from "../page"; // Importe o tipo da página

const iconMap: { [key: string]: React.ElementType<LucideProps> } = {
  PlusCircle: PlusCircle,
  Edit3: Edit3,
};

interface ServiceDialogControllerProps {
  barbershopId: string;
  service?: SerializableService | null; // Alterado para SerializableService
  triggerButtonText: string;
  dialogTitle: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link" | null | undefined;
  iconName?: keyof typeof iconMap;
}

export default function ServiceDialogController({ /* ...props */ service, ...props }: ServiceDialogControllerProps) {
  const [open, setOpen] = useState(false);
  const IconComponent = props.iconName ? iconMap[props.iconName] : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={props.variant || "default"} size={service ? "sm" : "default"} className="w-full md:w-auto">
          {IconComponent && <IconComponent className={`mr-2 h-4 w-4 ${service ? "" : "md:h-5 md:w-5"}`} />}
          {props.triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl">{props.dialogTitle}</DialogTitle>
        </DialogHeader>
        <ServiceForm
          barbershopId={props.barbershopId}
          service={service} // Passando service (que agora é SerializableService)
          onFormSubmit={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}