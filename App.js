import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { initDatabase } from './src/database/database';
import { ExpensasProvider } from './src/context/ExpensasContext';

import HomeScreen from './src/screens/HomeScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import MonthlySummaryScreen from './src/screens/MonthlySummaryScreen';
import ByCategoryScreen from './src/screens/ByCategoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6C5CE7', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Despesas' }} />
    <Stack.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Nova Despesa' }} />
  </Stack.Navigator>
);

const SummaryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6C5CE7', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="MonthlySummary" component={MonthlySummaryScreen} options={{ title: 'Resumo Mensal' }} />
  </Stack.Navigator>
);

const CategoryStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6C5CE7', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="ByCategory" component={ByCategoryScreen} options={{ title: 'Por Categoria' }} />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6C5CE7',
        tabBarInactiveTintColor: '#B2BEC3',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#F5F6FA',
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            HomeTab: focused ? '🏠' : '🏠',
            SummaryTab: focused ? '📊' : '📊',
            CategoryTab: focused ? '🏷️' : '🏷️',
          };
          return <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Início' }} />
      <Tab.Screen name="SummaryTab" component={SummaryStack} options={{ title: 'Resumo' }} />
      <Tab.Screen name="CategoryTab" component={CategoryStack} options={{ title: 'Categorias' }} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setDbReady(true));
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ExpensasProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </ExpensasProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F6FA' },
  loadingText: { marginTop: 12, color: '#636E72', fontSize: 15 },
});
