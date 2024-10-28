import { RowDataPacket } from "mysql2";

export interface CardDetail extends RowDataPacket {
    cardId: number;
    customerId: number;
    cardNumber: bigint;
    nameOnCard: string;
    expiryDate: string;
};