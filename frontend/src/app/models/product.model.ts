export interface ProductSpecification {
  id: number;
  name: string;
  value: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  productCode: string;
  purchasePrice: number | null;
  productType: string;
  active: boolean;
  createdAt: string;
  specifications: ProductSpecification[];
  descriptionImages: string[];
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
