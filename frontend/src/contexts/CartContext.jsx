import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(
        item => item.menuItemId === action.payload.menuItemId && 
               item.specialInstructions === action.payload.specialInstructions
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.menuItemId === action.payload.menuItemId &&
            item.specialInstructions === action.payload.specialInstructions
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload]
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    // >>>>>>>>> ADD THIS NEW CASE <<<<<<<<<
    case 'UPDATE_INSTRUCTIONS':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, specialInstructions: action.payload.instructions }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        tableId: null
      };

    case 'SET_TABLE':
      return {
        ...state,
        tableId: action.payload
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  tableId: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : initialState;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addItem = (item) => {
    const cartItem = {
      id: Date.now(), // temporary ID
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      specialInstructions: '',
      imageUrl: item.imageUrl
    };
    dispatch({ type: 'ADD_ITEM', payload: cartItem });
  };

  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
  };

  // >>>>>>>>> ADD THIS NEW FUNCTION <<<<<<<<<
  const updateItemInstructions = (itemId, instructions) => {
    dispatch({
      type: 'UPDATE_INSTRUCTIONS',
      payload: { id: itemId, instructions }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setTable = (tableId) => {
    dispatch({ type: 'SET_TABLE', payload: tableId });
  };

  const getTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items: state.items,
      tableId: state.tableId,
      addItem,
      removeItem,
      updateQuantity,
      updateItemInstructions, // >>>>>>>>> ADD THIS TO THE PROVIDER <<<<<<<<<
      clearCart,
      setTable,
      getTotal,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};