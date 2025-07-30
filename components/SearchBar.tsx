import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle,
  Text,
  FlatList,
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { Search, Sliders, Mic, Clock, TrendingUp } from 'lucide-react-native';
import colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  style?: ViewStyle;
  onSubmitEditing?: () => void;
  onFilterPress?: () => void;
  isLarge?: boolean;
  showSuggestions?: boolean;
  onVoiceSearch?: () => void;
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending';
  count?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  style,
  onSubmitEditing,
  onFilterPress,
  isLarge = false,
  showSuggestions = false,
  onVoiceSearch,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const [trendingSearches] = useState<SearchSuggestion[]>([
    { id: '1', text: 'Biryani', type: 'trending', count: 234 },
    { id: '2', text: 'Pizza', type: 'trending', count: 189 },
    { id: '3', text: 'Pasta', type: 'trending', count: 156 },
    { id: '4', text: 'Samosa', type: 'trending', count: 143 },
    { id: '5', text: 'Burger', type: 'trending', count: 128 },
  ]);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (showSuggestionsPanel) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showSuggestionsPanel]);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentSearches');
      if (stored) {
        const searches = JSON.parse(stored);
        setRecentSearches(searches.slice(0, 5)); // Show only last 5
      }
    } catch (error) {
      console.log('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (searchText: string) => {
    if (!searchText.trim()) return;
    
    try {
      const stored = await AsyncStorage.getItem('recentSearches');
      let searches: SearchSuggestion[] = stored ? JSON.parse(stored) : [];
      
      // Remove if already exists
      searches = searches.filter(s => s.text.toLowerCase() !== searchText.toLowerCase());
      
      // Add to beginning
      searches.unshift({
        id: Date.now().toString(),
        text: searchText,
        type: 'recent'
      });
      
      // Keep only last 10
      searches = searches.slice(0, 10);
      
      await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
      setRecentSearches(searches.slice(0, 5));
    } catch (error) {
      console.log('Error saving recent search:', error);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions) {
      setShowSuggestionsPanel(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for tap
    setTimeout(() => setShowSuggestionsPanel(false), 150);
  };

  const handleSubmit = () => {
    if (value.trim()) {
      saveRecentSearch(value.trim());
    }
    onSubmitEditing?.();
    setShowSuggestionsPanel(false);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    onChangeText(suggestion.text);
    saveRecentSearch(suggestion.text);
    setShowSuggestionsPanel(false);
  };

  const handleVoicePress = () => {
    if (Platform.OS !== 'web') {
      // Add haptic feedback for mobile
      // Haptics.selectionAsync();
    }
    onVoiceSearch?.();
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionIcon}>
        {item.type === 'recent' ? (
          <Clock size={16} color={colors.textLight} />
        ) : (
          <TrendingUp size={16} color={colors.primary} />
        )}
      </View>
      <Text style={styles.suggestionText}>{item.text}</Text>
      {item.count && (
        <Text style={styles.suggestionCount}>{item.count}</Text>
      )}
    </TouchableOpacity>
  );

  const containerStyle = isLarge ? styles.largeContainer : styles.container;
  const searchContainerStyle = isLarge ? styles.largeSearchContainer : styles.searchContainer;
  const inputStyle = isLarge ? styles.largeInput : styles.input;

  return (
    <View style={[containerStyle, style]}>
      <View style={styles.searchRow}>
        {onFilterPress && (
          <TouchableOpacity 
            style={[styles.filterButton, isLarge && styles.largeFilterButton]}
            onPress={onFilterPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Sliders size={isLarge ? 24 : 20} color={colors.white} />
          </TouchableOpacity>
        )}
        
        <View style={[
          searchContainerStyle,
          isFocused && styles.focusedSearchContainer,
          isLarge && styles.elevatedSearchContainer
        ]}>
          <Search 
            size={isLarge ? 24 : 20} 
            color={isFocused ? colors.primary : colors.textLight} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={inputStyle}
            placeholder={placeholder}
            placeholderTextColor={colors.textLight}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={handleSubmit}
            onFocus={handleFocus}
            onBlur={handleBlur}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {onVoiceSearch && (
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={handleVoicePress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Mic size={isLarge ? 22 : 18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showSuggestions && showSuggestionsPanel && (recentSearches.length > 0 || trendingSearches.length > 0) && (
        <Animated.View 
          style={[
            styles.suggestionsContainer,
            { opacity: fadeAnim }
          ]}
        >
          {recentSearches.length > 0 && (
            <View style={styles.suggestionSection}>
              <Text style={styles.sectionTitle}>Recent Searches</Text>
              <FlatList
                data={recentSearches}
                keyExtractor={(item) => item.id}
                renderItem={renderSuggestion}
                scrollEnabled={false}
              />
            </View>
          )}
          
          {trendingSearches.length > 0 && (
            <View style={styles.suggestionSection}>
              <Text style={styles.sectionTitle}>Trending Now</Text>
              <FlatList
                data={trendingSearches}
                keyExtractor={(item) => item.id}
                renderItem={renderSuggestion}
                scrollEnabled={false}
              />
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginHorizontal: 16,
  },
  largeContainer: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  largeSearchContainer: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
  },
  focusedSearchContainer: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  elevatedSearchContainer: {
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
    fontWeight: '400',
  },
  largeInput: {
    fontSize: 18,
    fontWeight: '500',
  },
  voiceButton: {
    padding: 8,
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  largeFilterButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  suggestionsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 8,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 300,
  },
  suggestionSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  suggestionCount: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
  },
});

export default SearchBar;