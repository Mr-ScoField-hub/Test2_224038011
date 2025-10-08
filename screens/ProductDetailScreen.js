import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ref, push, set } from 'firebase/database';
import { auth, database } from '../config/firebase';
import CartButton from '../components/CartButton';

const ProductDetailScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    if (!auth.currentUser) {
      Alert.alert('Error', 'Please login to add items to cart');
      return;
    }

    setLoading(true);

    try {
      const userId = auth.currentUser.uid;
      const cartRef = ref(database, `carts/${userId}`);
      const newCartItemRef = push(cartRef);
      
      const cartItem = {
        productId: product.id,
        title: product.title,
        price: product.price * 18.5,
        image: product.image,
        quantity: 1,
        addedAt: Date.now(),
      };

      await set(newCartItemRef, cartItem);
      
      Alert.alert(
        'Success',
        `${product.title} has been added to your cart!`,
        [
          { text: 'Continue Shopping', style: 'default' },
          { 
            text: 'View Cart', 
            onPress: () => navigation.navigate('Cart'),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    }

    setLoading(false);
  };

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
        <CartButton 
          onPress={() => navigation.navigate('Cart')}
          size="medium"
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </View>

        {/* Product Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.productTitle}>{product.title}</Text>
          
          <View style={styles.priceRatingContainer}>
            <Text style={styles.productPrice}>R{(product.price * 18.5).toFixed(2)}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>⭐ {product.rating.rate}</Text>
              <Text style={styles.ratingCount}>({product.rating.count} reviews)</Text>
            </View>
          </View>

          <Text style={styles.categoryText}>Category: {product.category}</Text>

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Add to Cart Button - Fixed at bottom */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.addToCartButton, loading && styles.addToCartButtonDisabled]}
          onPress={addToCart}
          disabled={loading}
        >
          <Text style={styles.addToCartButtonText}>
            {loading ? 'Adding to Cart...' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
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
  content: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
  },
  infoContainer: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
    marginBottom: 80,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  priceRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 14,
    color: '#FF9500',
  },
  ratingCount: {
    fontSize: 12,
    color: '#666',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
  },
  addToCartButton: {
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
  addToCartButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;