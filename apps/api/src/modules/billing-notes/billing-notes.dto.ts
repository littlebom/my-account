import { IsString, IsNotEmpty, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateBillingNoteDto {
    @IsString()
    @IsNotEmpty()
    customerId: string;

    @IsDateString()
    @IsNotEmpty()
    documentDate: string;

    @IsDateString()
    @IsNotEmpty()
    dueDate: string;

    @IsString()
    @IsOptional()
    notes?: string;

    @IsArray()
    @IsNotEmpty()
    items: { invoiceId: string }[];
}

export class SearchUnpaidInvoicesDto {
    @IsString()
    @IsNotEmpty()
    customerId: string;
}
