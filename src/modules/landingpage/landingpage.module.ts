import { Module } from "@nestjs/common";
import { LandingpageController } from "./landingpage.controller";
import { LandingpageService } from "./ladingpage.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    controllers: [LandingpageController],
    providers: [LandingpageService],
})
export class LandingpageModule {}
