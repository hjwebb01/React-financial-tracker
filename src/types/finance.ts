 export type Category = {
   id: string;
   name: string;
 };

 export type Transaction = {
   id: string;
   date: string;
   description: string;
   categoryId: string;
   amountCents: number;
   createdAt?: string;
   editedAt?: string;
 };

 export type Budget = {
   id: string;
   categoryId: string;
   monthlyLimit: number; // in cents
   notes?: string;
   createdAt: string;
   updatedAt: string;
 };
