// app/lib/types.ts
import type { Barbershop, Booking, Service } from "@prisma/client";

// Service with price as number
export interface MySerializableService extends Omit<Service, 'price' | 'createdAt' | 'updatedAt'> {
  price: number; // Price is a number
  // Include other fields from Service that are serializable and needed
}

// Booking that includes a SerializableService and Barbershop
export interface MySerializableBooking extends Omit<Booking, 'service' | 'barbershop' | 'createdAt' | 'updatedAt' | 'date'> {
  date: string; // Dates should be stringified for props, or handled carefully
  service: MySerializableService;
  barbershop: Barbershop; // Assuming Barbershop fields are serializable (no Decimals etc.)
  // Include other fields from Booking that are serializable and needed
}

// For Barbershop Details Page (if not already handled)
export interface MyDisplayableServiceForDetails extends Omit<Service, 'price' | 'createdAt' | 'updatedAt' | 'barbershopId'> {
  price: number;
}
export type MySimpleBarbershop = Pick<Barbershop, 'id' | 'name' | 'imageUrl' | 'address' | 'description' | 'ratings' | 'stars' | 'telefone' | 'localizacaomaps'>;