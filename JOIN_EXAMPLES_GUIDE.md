# Hướng dẫn JOIN 2 bảng bằng Prisma ORM

## Tổng quan

Trong Prisma ORM, việc join 2 bảng được thực hiện thông qua các phương thức:
- `include`: Tương đương INNER JOIN hoặc LEFT JOIN
- `select`: Chọn các field cụ thể từ các bảng
- Raw queries: Cho các trường hợp phức tạp

## 1. INNER JOIN với `include`

### Cú pháp cơ bản:
```typescript
await prisma.model.findMany({
  include: {
    relatedModel: true
  }
})
```

### Ví dụ thực tế:
```typescript
// Lấy sản phẩm cùng với danh mục
const products = await prisma.product.findMany({
  include: {
    category: true
  }
});
```

**Tương đương SQL:**
```sql
SELECT * FROM products p 
INNER JOIN categories c ON p.categoryId = c.id
```

## 2. LEFT JOIN với `include`

### Cú pháp:
```typescript
await prisma.model.findMany({
  include: {
    relatedModel: true // Sẽ trả về null nếu không có relation
  }
})
```

### Ví dụ:
```typescript
// Lấy tất cả sản phẩm, kể cả không có danh mục
const products = await prisma.product.findMany({
  include: {
    category: true // category sẽ là null nếu sản phẩm không có danh mục
  }
});
```

## 3. Nested JOIN (JOIN nhiều bảng)

### Cú pháp:
```typescript
await prisma.model.findMany({
  include: {
    relation1: {
      include: {
        relation2: true
      }
    }
  }
})
```

### Ví dụ:
```typescript
// Lấy kho -> tồn kho -> sản phẩm -> danh mục
const warehouses = await prisma.warehouse.findMany({
  include: {
    inventories: {
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    }
  }
});
```

## 4. SELECT với JOIN

### Cú pháp:
```typescript
await prisma.model.findMany({
  select: {
    field1: true,
    field2: true,
    relation: {
      select: {
        relatedField1: true,
        relatedField2: true
      }
    }
  }
})
```

### Ví dụ:
```typescript
// Chỉ lấy một số field cụ thể
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    code: true,
    category: {
      select: {
        name: true
      }
    }
  }
});
```

## 5. JOIN với WHERE conditions

### Cú pháp:
```typescript
await prisma.model.findMany({
  where: {
    // Điều kiện trên bảng chính
    field: value,
    // Điều kiện trên bảng liên quan
    relation: {
      field: value
    }
  },
  include: {
    relation: true
  }
})
```

### Ví dụ:
```typescript
// Lấy giao dịch nhập kho với chi tiết
const transactions = await prisma.stockTransaction.findMany({
  where: {
    transactionType: 'IMPORT'
  },
  include: {
    warehouse: true,
    details: {
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    }
  }
});
```

## 6. JOIN với PAGINATION

### Cú pháp:
```typescript
const [total, results] = await prisma.$transaction([
  prisma.model.count({ where }),
  prisma.model.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      relation: true
    }
  })
]);
```

### Ví dụ:
```typescript
async getProductsWithPagination(page: number = 1, pageSize: number = 10) {
  const skip = (page - 1) * pageSize;
  
  const [total, products] = await this.prisma.$transaction([
    this.prisma.product.count(),
    this.prisma.product.findMany({
      skip,
      take: pageSize,
      include: {
        category: true,
        inventories: {
          include: {
            warehouse: true
          }
        }
      }
    })
  ]);

  return { total, page, pageSize, results: products };
}
```

## 7. JOIN với AGGREGATION

### Cú pháp:
```typescript
await prisma.model.findMany({
  include: {
    relation: {
      _count: {
        select: {
          relatedRelation: true
        }
      }
    }
  }
})
```

### Ví dụ:
```typescript
// Thống kê sản phẩm theo danh mục
const categories = await prisma.category.findMany({
  include: {
    products: {
      select: {
        id: true,
        name: true
      }
    },
    _count: {
      select: {
        products: true
      }
    }
  }
});
```

## 8. Raw Query cho JOIN phức tạp

### Cú pháp:
```typescript
await prisma.$queryRaw`
  SELECT 
    t1.field1,
    t2.field2
  FROM table1 t1
  INNER JOIN table2 t2 ON t1.id = t2.table1Id
  WHERE condition
`
```

### Ví dụ:
```typescript
// Báo cáo phức tạp
const report = await prisma.$queryRaw`
  SELECT 
    w.name as warehouse_name,
    c.name as category_name,
    COUNT(p.id) as product_count,
    SUM(i.quantity) as total_quantity
  FROM warehouses w
  INNER JOIN inventories i ON w.id = i."warehouseId"
  INNER JOIN products p ON i."productId" = p.id
  LEFT JOIN categories c ON p."categoryId" = c.id
  GROUP BY w.name, c.name
  ORDER BY w.name, c.name
`;
```

## 9. JOIN với TRANSACTION

### Cú pháp:
```typescript
await prisma.$transaction(async (tx) => {
  // Tạo bản ghi chính
  const mainRecord = await tx.model.create({ data });
  
  // Tạo bản ghi liên quan
  const relatedRecord = await tx.relatedModel.create({
    data: { ...data, mainId: mainRecord.id }
  });
  
  // Trả về với JOIN
  return await tx.model.findUnique({
    where: { id: mainRecord.id },
    include: { relatedModel: true }
  });
});
```

## 10. JOIN với FILTERING phức tạp

### Cú pháp:
```typescript
await prisma.model.findMany({
  where: {
    AND: [
      { field1: value1 },
      { 
        relation: {
          some: { // hoặc every, none
            field: value
          }
        }
      }
    ]
  },
  include: {
    relation: true
  }
})
```

### Ví dụ:
```typescript
// Tìm sản phẩm có tồn kho trong kho cụ thể
const products = await prisma.product.findMany({
  where: {
    AND: [
      {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        inventories: {
          some: {
            warehouseId: warehouseId,
            quantity: { gt: 0 }
          }
        }
      }
    ]
  },
  include: {
    category: true,
    inventories: {
      where: { warehouseId: warehouseId },
      include: {
        warehouse: true
      }
    }
  }
});
```

## Các loại JOIN trong Prisma

| Loại JOIN | Prisma Syntax | Mô tả |
|-----------|---------------|-------|
| INNER JOIN | `include: { relation: true }` | Chỉ lấy bản ghi có khớp |
| LEFT JOIN | `include: { relation: true }` | Lấy tất cả bản ghi, relation có thể null |
| RIGHT JOIN | Không hỗ trợ trực tiếp | Cần dùng raw query |
| FULL OUTER JOIN | Không hỗ trợ trực tiếp | Cần dùng raw query |

## Lưu ý quan trọng

1. **Performance**: Sử dụng `select` thay vì `include` khi chỉ cần một số field
2. **N+1 Problem**: Sử dụng `include` để tránh query nhiều lần
3. **Deep nesting**: Tránh join quá sâu (3-4 level)
4. **Raw queries**: Chỉ dùng khi cần thiết, ưu tiên Prisma syntax

## API Endpoints để test

Sau khi thêm module vào `app.module.ts`, bạn có thể test các endpoint:

- `GET /join-examples/products-with-category` - INNER JOIN
- `GET /join-examples/products-with-optional-category` - LEFT JOIN  
- `GET /join-examples/product-summary` - SELECT với JOIN
- `GET /join-examples/import-transactions` - JOIN với WHERE
- `GET /join-examples/products-paginated?page=1&pageSize=10` - JOIN với pagination
- `GET /join-examples/inventory-details` - Complex JOIN
- `GET /join-examples/product-stats-by-category` - JOIN với aggregation
- `GET /join-examples/complex-report` - Raw query
- `GET /join-examples/search-products?search=abc&categoryId=1` - JOIN với filtering
