import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import CartButton from '../components/CartButton';

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProductsByCategory();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://fakestoreapi.com/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://fakestoreapi.com/products/categories');
      const data = await response.json();
      setCategories(['all', ...data]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterProductsByCategory = async () => {
    if (selectedCategory === 'all') {
      fetchProducts();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://fakestoreapi.com/products/category/${selectedCategory}`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products for this category.');
      console.error('Error filtering products:', error);
    }
    setLoading(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    if (selectedCategory === 'all') {
      fetchProducts();
    } else {
      filterProductsByCategory();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        },
      ]
    );
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>R{(item.price * 18.5).toFixed(2)}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {item.rating.rate}</Text>
          <Text style={styles.ratingCount}>({item.rating.count})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategoryButton,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryButtonText,
          selectedCategory === category && styles.selectedCategoryButtonText,
        ]}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ShopEZ Products</Text>
        <View style={styles.headerButtons}>
          <CartButton 
            onPress={() => navigation.navigate('Cart')}
            size="medium"
          />
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(renderCategoryButton)}
      </ScrollView>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.productsList}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    backgroundColor: '#BBDEFB',
    paddingVertical: 15,
    minHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedCategoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  productsList: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-around',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    margin: 6,
    width: '45%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 10,
    color: '#FF9500',
    marginRight: 5,
  },
  ratingCount: {
    fontSize: 10,
    color: '#666',
  },
});

export default ProductListScreen;