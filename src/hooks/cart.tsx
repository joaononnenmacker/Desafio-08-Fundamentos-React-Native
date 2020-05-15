import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import Cart from 'src/pages/Cart';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:cart',
      );
      if (storagedProducts) {
        const productList: Product[] = JSON.parse(storagedProducts);

        setProducts([...productList]);
      }

      // await AsyncStorage.removeItem('@GoMarketplace:cart');
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const index = products.findIndex(p => p.id === product.id);
      if (index > -1) {
        const newProduct = products;
        newProduct[index].quantity = ++newProduct[index].quantity;
        setProducts([...newProduct]);
      } else {
        product.quantity = 1;
        const newProduct = products;
        newProduct.push(product);
        setProducts([...newProduct]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const index = products.findIndex(p => p.id === id);

      const newProduct = products;
      newProduct[index].quantity = ++newProduct[index].quantity;
      setProducts([...newProduct]);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const index = products.findIndex(p => p.id === id);
      if (products[index].quantity > 1) {
        const newProduct = products;
        newProduct[index].quantity = --newProduct[index].quantity;
        setProducts([...newProduct]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      } /* else {
        products.splice(index, 1);
        setProducts(products);
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      } */
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
