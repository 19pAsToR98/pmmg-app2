import { Screen } from '../types';

export interface Product {
  name: string;
  price: string;
  imageUrl: string;
  link: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'fardamento',
    name: 'Fardamento e Vestuário',
    icon: 'apparel',
    products: [
      { name: 'Fardamento Tático Completo', price: 'R$ 450,00', imageUrl: 'https://picsum.photos/seed/farda/150/150', link: 'https://www.exemplo.com/fardamento' },
      { name: 'Botas Táticas Impermeáveis', price: 'R$ 280,00', imageUrl: 'https://picsum.photos/seed/bota/150/150', link: 'https://www.exemplo.com/botas' },
      { name: 'Luvas Táticas', price: 'R$ 85,00', imageUrl: 'https://picsum.photos/seed/luva/150/150', link: 'https://www.exemplo.com/luvas' },
    ],
  },
  {
    id: 'protecao',
    name: 'Proteção e Balística',
    icon: 'shield',
    products: [
      { name: 'Colete Balístico Nível III-A', price: 'R$ 3.500,00', imageUrl: 'https://picsum.photos/seed/colete/150/150', link: 'https://www.exemplo.com/colete' },
      { name: 'Capacete Tático', price: 'R$ 1.200,00', imageUrl: 'https://picsum.photos/seed/capacete/150/150', link: 'https://www.exemplo.com/capacete' },
    ],
  },
  {
    id: 'acessorios',
    name: 'Acessórios e Iluminação',
    icon: 'flashlight_on',
    products: [
      { name: 'Lanterna Tática de Alta Potência', price: 'R$ 150,00', imageUrl: 'https://picsum.photos/seed/lanterna/150/150', link: 'https://www.exemplo.com/lanterna' },
      { name: 'Mochila de Assalto 30L', price: 'R$ 199,90', imageUrl: 'https://picsum.photos/seed/mochila/150/150', link: 'https://www.exemplo.com/mochila' },
      { name: 'Coldre Velado', price: 'R$ 90,00', imageUrl: 'https://picsum.photos/seed/coldre/150/150', link: 'https://www.exemplo.com/coldre' },
    ],
  },
  {
    id: 'comunicacao',
    name: 'Comunicação e GPS',
    icon: 'satellite_alt',
    products: [
      { name: 'Rádio HT Digital', price: 'R$ 800,00', imageUrl: 'https://picsum.photos/seed/radio/150/150', link: 'https://www.exemplo.com/radio' },
      { name: 'GPS Tático Militar', price: 'R$ 1.500,00', imageUrl: 'https://picsum.photos/seed/gps/150/150', link: 'https://www.exemplo.com/gps' },
    ],
  },
];

export const findCategoryById = (id: string) => CATEGORIES.find(c => c.id === id);