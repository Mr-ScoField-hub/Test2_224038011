import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ref, remove, update } from 'firebase/database';
import { auth, database } from '../config/firebase';
import { useCart } from '../contexts/CartContext';

const CartScreen = ({ navigation }) => {
  const { cartItems, cartLoading } = useCart();
  const [total, setTotal] = useState(0);

  useEffect(() => {
    calculateTotal();
  }, [cartItems]);

  const calculateTotal = () => {
    const totalPrice = cartItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    setTotal(totalPrice);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      const itemRef = ref(database, `carts/${userId}/${itemId}`);
      await update(itemRef, { quantity: newQuantity });
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
    }
  };

  const removeItem = async (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = auth.currentUser.uid;
              const itemRef = ref(database, `carts/${userId}/${itemId}`);
              await remove(itemRef);
            } catch {
              Alert.alert('Error', 'Failed to remove item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const clearCart = () => {
    if (cartItems.length === 0) return;

    Alert.alert('Clear Cart', 'Clear all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            const userId = auth.currentUser.uid;
            const cartRef = ref(database, `carts/${userId}`);
            await remove(cartRef);
          } catch {
            Alert.alert('Error', 'Failed to clear cart. Please try again.');
          }
        },
      },
    ]);
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
        <Text style={styles.itemSubtotal}>
          Subtotal: R{(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyCartText}>🛍️</Text>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>Start shopping to add items</Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.navigate('ProductList')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (cartLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4081" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />

          {/* Bottom Total */}
          <View style={styles.bottomContainer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>R{total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => Alert.alert('Checkout', 'Proceeding to checkout...')}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE4EC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFE4EC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF4081',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF80AB',
    paddingVertical: 18,
    paddingHorizontal: 20,
    paddingTop: 45,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  clearButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  cartList: {
    padding: 15,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#FF80AB',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    color: '#FF4081',
    fontWeight: 'bold',
  },
  itemSubtotal: {
    fontSize: 12,
    color: '#666',
  },
  quantityContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: '#F8BBD0',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 2,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#FF4081',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyCartText: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#FF4081',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  bottomContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#FFDCE5',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF4081',
  },
  checkoutButton: {
    backgroundColor: '#FF4081',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CartScreen;
