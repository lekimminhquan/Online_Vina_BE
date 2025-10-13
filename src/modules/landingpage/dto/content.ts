import { IsNotEmpty } from "class-validator";


export class metaDataDto {
    id?: number;
    @IsNotEmpty()
    backgroundImage: string;
    page?: string;
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    description: string;
    backgroundColor?: string;
}
export class selectCardDto {
    id?: number;
    @IsNotEmpty()
    title: string;
    @IsNotEmpty()
    description: string;
    @IsNotEmpty()
    icon: string;
    page?: string;
    @IsNotEmpty()
    content: string | string[];
    @IsNotEmpty()
    image: string;
    backgroundColor: string;
    numericalOrder: number;
}

export class contentPageDto {
    @IsNotEmpty()
    metadata: metaDataDto;
    @IsNotEmpty()
    selectCards: selectCardDto[];
}



