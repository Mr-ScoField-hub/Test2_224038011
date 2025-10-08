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
      return sum + (item.price * item.quantity);
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
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
    }
  };

  const removeItem = async (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
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
            } catch (error) {
              console.error('Error removing item:', error);
              Alert.alert('Error', 'Failed to remove item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const clearCart = () => {
    if (cartItems.length === 0) return;

    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your entire cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = auth.currentUser.uid;
              const cartRef = ref(database, `carts/${userId}`);
              await remove(cartRef);
            } catch (error) {
              console.error('Error clearing cart:', error);
              Alert.alert('Error', 'Failed to clear cart. Please try again.');
            }
          },
        },
      ]
    );
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
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <Text style={styles.removeButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyCartText}>🛒</Text>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>Start shopping to add items to your cart</Text>
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
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearCart}
          >
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

          {/* Total and Checkout */}
          <View style={styles.bottomContainer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>R{total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => Alert.alert('Checkout', 'Checkout functionality would be implemented here')}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout
              </Text>
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
    backgroundColor: '#E3F2FD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1976D2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#BBDEFB',
    paddingTop: 40,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  cartList: {
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  itemSubtotal: {
    fontSize: 12,
    color: '#666',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  quantityButton: {
    backgroundColor: '#BBDEFB',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  removeButtonText: {
    fontSize: 16,
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
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomContainer: {
    backgroundColor: 'white',
    padding: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CartScreen;