import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService');

  onModuleInit(){
    this.$connect();
    this.logger.log('**** Connected to database');
  }

  create(createProductDto: CreateProductDto) {

    this.logger.log('**** Creating product');
    return this.product.create({
      data: createProductDto
    });
  }

  async findAll( paginationDto: PaginationDto ) {

    const { page = 1 , limit = 10 } = paginationDto;
    const totalProducts = await this.product.count({
      where: {
        available: true
      }
    });
    const lastPage = Math.ceil(totalProducts / limit);


    return {
      data: await this.product.findMany({
        where: {
          available: true
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      meta: {
        Page: page,
        Limite: limit,
        totalProductos: totalProducts,
        lastPage: lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where : {id, available: true}
    });
    if(!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    return this.product.update({
      where: { id },
      data: updateProductDto
    });
  }

  async remove(id: number) {
    
    await this.findOne(id);

    const product = await this.product.update({
      where: {id},
      data: {
        available: false
      }
    });

    return product;
  }

}
