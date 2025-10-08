import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ref, push, set } from 'firebase/database';
import { auth, database } from '../config/firebase';
import CartButton from '../components/CartButton';

const ProductDetailScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    if (!auth.currentUser) {
      Alert.alert('Login Required', 'Please login to add items to your cart.');
      return;
    }

    setLoading(true);
    try {
      const userId = auth.currentUser.uid;
      const cartRef = ref(database, `carts/${userId}`);
      const newCartItemRef = push(cartRef);
      await set(newCartItemRef, {
        productId: product.id,
        title: product.title,
        price: product.price * 18.5,
        image: product.image,
        quantity: 1,
        addedAt: Date.now(),
      });

      Alert.alert('Added to Cart', `${product.title} was added successfully!`, [
        { text: 'Continue Shopping', style: 'default' },
        { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <CartButton onPress={() => navigation.navigate('Cart')} size="medium" />
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.productTitle}>{product.title}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>
              R{(product.price * 18.5).toFixed(2)}
            </Text>
            <View style={styles.ratingBox}>
              <Text style={styles.ratingText}>⭐ {product.rating.rate}</Text>
              <Text style={styles.ratingCount}>({product.rating.count})</Text>
            </View>
          </View>

          <Text style={styles.categoryText}>
            Category:{' '}
            <Text style={{ color: '#FF4081', fontWeight: '600' }}>
              {product.category}
            </Text>
          </Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* Fixed Add to Cart Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.addButton, loading && styles.addButtonDisabled]}
          onPress={addToCart}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.addButtonText}>Add to Cart</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE4EC', // soft pink background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF80AB', // medium pink header
    paddingVertical: 18,
    paddingHorizontal: 20,
    paddingTop: 45,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  backText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  imageContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 4,
  },
  productImage: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
  },
  infoContainer: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 90,
    borderRadius: 20,
    padding: 20,
    elevation: 3,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4081',
  },
  ratingBox: {
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
    color: '#555',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4081',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#FFDCE5',
    elevation: 6,
  },
  addButton: {
    backgroundColor: '#FF4081',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#FF80AB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addButtonDisabled: {
    backgroundColor: '#F8BBD0',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;
