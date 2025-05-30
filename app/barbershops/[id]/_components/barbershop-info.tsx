"use client";

import { Barbershop } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { toast } from "sonner";
import {
  ChevronLeftIcon,
  Clock,
  Copy,
  MapPinIcon,
  Phone,
  Smartphone,
  StarIcon,
} from "lucide-react";
import Header from "@/app/_components/header";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";

interface BarbershopInfoProps {
  barbershop: Barbershop;
}

const BarbershopInfo = ({ barbershop }: BarbershopInfoProps) => {
  const router = useRouter();
  const [_, copyToClipboard] = useCopyToClipboard();

  const handleBackClick = () => {
    router.replace("/");
  };

  const handleCopy = (text: string) => {
    copyToClipboard(text);
    toast.success("Número copiado com sucesso!");
  };

  return (
    <div>
      <div className="mb-20 hidden lg:block">
        <Header />
      </div>

      <div className="gap-5 lg:flex lg:gap-12 lg:px-32">
        <div className="lg:min-h-full lg:min-w-[50%]">
          <div className="hidden lg:mb-2 lg:block">
            <div className="flex justify-between pb-1">
              <h1 className="text-base font-bold lg:text-2xl">
                {barbershop.name}
              </h1>
              <div className="flex items-center gap-1">
                <StarIcon className="text-primary" size={20} />
                <p className="text-sm lg:text-base">
                  {barbershop.ratings} ({barbershop.stars} avaliações)
                </p>
              </div>
            </div>
          </div>

          <div className="relative mb-6 h-[280px] w-full lg:min-h-full">
            <Button
              size="icon"
              variant="outline"
              onClick={handleBackClick}
              className="absolute left-4 top-4 z-50 rounded-full md:left-9"
            >
              <ChevronLeftIcon />
            </Button>

            <Image
              fill
              src={barbershop.imageUrl}
              alt={barbershop.name}
              style={{ objectFit: "cover" }}
              className="h-auto w-full lg:max-h-[88%] lg:min-w-[100%] lg:rounded-3xl"
            />
          </div>
        </div>

        <div className="relative bottom-4 z-50 mt-[-1.5rem] rounded-tl-3xl rounded-tr-3xl bg-background px-5 pt-7 md:px-32 lg:mt-[22px] lg:px-0 lg:pt-0">
          <div className="lg:mb-5 lg:hidden">
            <div className="mb-7 flex justify-between border-b border-secondary pb-3">
              <h1 className="text-base font-bold">{barbershop.name}</h1>
              <div className="flex items-end gap-1">
                <StarIcon className="text-primary" size={20} />
                <p className="text-sm">
                  {barbershop.ratings} ({barbershop.stars} avaliações)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-1 pb-4">
            <MapPinIcon className="text-primary" size={20} />
            <p className="text-sm lg:text-base">{barbershop.address}</p>
          </div>

          <Card>
            <CardContent className="p-5 md:p-4">
              <h2 className="mb-3 border-b border-secondary pb-3 text-sm font-bold uppercase text-gray-400 md:text-lg lg:text-center lg:text-xl">
                INFORMAÇÕES
              </h2>

              <p className="mb-3 border-b border-secondary pb-3 text-sm text-gray-400">
                {barbershop.description}
              </p>

              <h2 className="mb-2 mt-2 flex items-center gap-2 font-bold lg:justify-center lg:text-lg">
                <Clock className="size-6 text-purple-500" />
                Horário de funcionamento
              </h2>

              <div className="mb-3 flex justify-between border-b border-secondary pb-3">
                <div>
                  <p className="text-sm text-gray-400">Domingo</p>
                  <p className="text-sm text-gray-400">Segunda-Feira</p>
                  <p className="text-sm text-gray-400">Terça-Feira</p>
                  <p className="text-sm text-gray-400">Quarta-Feira</p>
                  <p className="text-sm text-gray-400">Quinta-Feira</p>
                  <p className="text-sm text-gray-400">Sexta-Feira</p>
                  <p className="text-sm text-gray-400">Sábado</p>
                </div>

                <div>
                  <p className="text-sm">Fechado</p>
                  <p className="text-sm">08:00 - 18:00</p>
                  <p className="text-sm">08:00 - 18:00</p>
                  <p className="text-sm">08:00 - 18:00</p>
                  <p className="text-sm">08:00 - 18:00</p>
                  <p className="text-sm">08:00 - 18:00</p>
                  <p className="text-sm">08:00 - 15:00</p>
                </div>
              </div>

              <div className="mb-3 flex justify-between items-center md:px-5">
                <p className="flex items-center gap-2 text-sm lg:text-base">
                  <Phone className="size-4 text-purple-500" />
                  {barbershop.telefone}
                </p>
                <Button
                  onClick={() => handleCopy(barbershop.telefone)}
                  className="flex h-8 gap-1 bg-none px-3"
                >
                  Copiar
                  <Copy className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BarbershopInfo;
