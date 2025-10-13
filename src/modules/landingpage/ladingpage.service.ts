import { Injectable } from '@nestjs/common';
import { contentPageDto } from './dto/content';
import { PrismaService } from '../prisma/prisma.service';
import { PAGE_NAME } from 'src/constants/landingpage';

@Injectable()
export class LandingpageService {
  constructor(private readonly prisma: PrismaService) { }

  async getDataAllLandingPage() {
    console.log('getDataAllLandingPage');
    return await this.prisma.$transaction(async (context) => {
      const metadata = await context.metaData.findMany({
        include: {
          cards: {
            orderBy: { numericalOrder: 'asc' }
          }
        }
      });
      return this.createResponse(
        200,
        'success',
        'Landing page content retrieved successfully',
        metadata
      )
    });
  }
  async getLandingPageContent(page: string) {
    try {
      const pageData = await this.prisma.metaData.findFirst({
        where: { page: page },
        include: {
          cards: {
            orderBy: { numericalOrder: 'asc' }
          }
        }
      });

      if (!pageData) {
        return this.createResponse(
          404,
          'error',
          'Page not found'
        );
      }

      return this.createResponse(
        200,
        'success',
        'Landing page content retrieved successfully',
        {
          metadata: {
            id: pageData.id,
            title: pageData.title,
            description: pageData.description,
            backgroundImage: pageData.backgroundImage,
            backgroundColor: pageData.backgroundColor,
            page: pageData.page,
            createdAt: pageData.createdAt,
            updatedAt: pageData.updatedAt
          },
          cards: pageData.cards,
        }
      );
    } catch (error) {
      return this.createResponse(
        500,
        'error',
        error.message || 'Failed to retrieve landing page content'
      );
    }
  }

  private createResponse(code: number, status: string, message: string, data?: any) {
    return {
      code,
      status,
      message,
      ...(data && { data })
    };
  }

  private getAllowedCardNumber(page: string): number {
    switch (page) {
      case PAGE_NAME.information:
        return 6;
      default:
        return 5;
    }
  }

  async createAndUpdateContentLandingPage(body: contentPageDto, page: string) {
    try {
      const allowedNumber = this.getAllowedCardNumber(page);

      if (body.selectCards.length > allowedNumber) {
        return this.createResponse(
          300,
          'error',
          `Exceed the number of cards allowed. Maximum allowed: ${allowedNumber}`
        );
      }

      const existingCardsCount = await this.prisma.card.count({
        where: { page: page }
      });

      const newCardsCount = body.selectCards.filter(card => !card.id).length;

      if (existingCardsCount + newCardsCount > allowedNumber) {
        return this.createResponse(
          300,
          'error',
          `Total cards would exceed limit. CurrentExist: ${existingCardsCount}, Adding: ${newCardsCount}, Limit: ${allowedNumber}`
        );
      }

      // Tất cả operations trong một transaction duy nhất
      const result = await this.prisma.$transaction(async (context) => {
        const existingMetadata = await context.metaData.findUnique({
          where: { page: page }
        });

        let metadata;
        if (existingMetadata) {
          metadata = await context.metaData.update({
            where: { id: existingMetadata.id },
            data: {
              backgroundImage: body.metadata.backgroundImage,
              title: body.metadata.title,
              description: body.metadata.description,
              backgroundColor: body.metadata.backgroundColor,
            },
          });
        } else {
          metadata = await context.metaData.create({
            data: {
              backgroundImage: body.metadata.backgroundImage,
              title: body.metadata.title,
              description: body.metadata.description,
              page: page,
              backgroundColor: body.metadata.backgroundColor,
            }
          });
        }

        const cards = await Promise.all(
          body.selectCards.map(async (item) => {
            const data = {
              title: item.title,
              description: item.description,
              page: page,
              icon: item.icon,
              content: item.content as any,
              image: item.image,
              backgroundColor: item.backgroundColor,
              numericalOrder: item.numericalOrder,
            };

            return item?.id
              ? await context.card.update({
                where: { id: item.id },
                data,
              })
              : await context.card.create({ 
                data,
                include: {
                  metaData: true
                }
              });
          }),
        );

        return { metadata, contentCards: cards };
      });

      return this.createResponse(
        200,
        'success',
        'Content updated successfully',
        result
      );
    } catch (error) {
      console.error('Error in createAndUpdateContentLandingPage:', error);
      return this.createResponse(
        500,
        'error',
        error.message || 'Internal server error'
      );
    }
  }



}
