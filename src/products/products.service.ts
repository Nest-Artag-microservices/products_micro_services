import { HttpStatus, Injectable, Logger, OnModuleInit, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';


@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  
  private readonly logger= new Logger('ProductsService');
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }
  create(createProductDto: CreateProductDto) {
    
    return this.product.create({
      data: createProductDto
    });
    
  }

  async findAll(paginationDto: PaginationDto) {

    const totalPages = await this.product.count({
      where: {available: true}});

    const {limit, page} = paginationDto

    return {
      data:await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {available: true}
      }),
      meta: {
        total: totalPages,
        page,
        last_page: Math.ceil(totalPages / limit)
      }
    }
  }

  async findOne(id: number) {

   const product = await this.product.findFirst({
      where: {id}
    })

    if (!product) {
      throw new RpcException({message:'Product not found',
      status:HttpStatus.BAD_REQUEST
      })
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const {id:_, ...data} = updateProductDto

    await this.findOne(id);


    return this.product.update({
      where: {id,available: true},
      data
    })


  }

  async remove(id: number) {
  
    await this.findOne(id);
   
    const product =await this.product.update({
      where: {id},
      data: {available: false}
    })

    return product
  }

  async validateProduct(ids: number[]) {
//console.log(ids);

    ids=Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: {
        id: {
          in: ids
        }
      }
    })
   

    if (products.length !== ids.length) {
      throw new RpcException({message:'Some products were not found',
      status:HttpStatus.BAD_REQUEST
      })
    }

    return products
  }
}
