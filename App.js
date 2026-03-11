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
import SearchScreen from './src/screens/SearchScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import BudgetsScreen from './src/screens/BudgetsScreen';
import BudgetAllocationScreen from './src/screens/BudgetAllocationScreen';
import SimulacaoScreen from './src/screens/SimulacaoScreen';

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

const SearchStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6C5CE7', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar Despesas' }} />
  </Stack.Navigator>
);

const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6C5CE7', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
  </Stack.Navigator>
);

const BudgetsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6C5CE7', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="Budgets" component={BudgetsScreen} options={{ title: 'Orçamentos' }} />
  </Stack.Navigator>
);

const AllocationStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6C5CE7', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="Allocation" component={BudgetAllocationScreen} options={{ title: 'Alocação 50/30/20' }} />
  </Stack.Navigator>
);

const SimulacaoStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#6C5CE7', elevation: 0, shadowOpacity: 0 },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
    <Stack.Screen name="Simulacao" component={SimulacaoScreen} options={{ title: 'Simulador de Poupança' }} />
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
            HomeTab: '🏠',
            SearchTab: '🔍',
            DashboardTab: '📈',
            BudgetsTab: '💰',
            AllocationTab: '💳',
            SimulacaoTab: '📊',
          };
          return <Text style={{ fontSize: 20 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Início' }} />
      <Tab.Screen name="SearchTab" component={SearchStack} options={{ title: 'Buscar' }} />
      <Tab.Screen name="DashboardTab" component={DashboardStack} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="BudgetsTab" component={BudgetsStack} options={{ title: 'Orçamentos' }} />
      <Tab.Screen name="AllocationTab" component={AllocationStack} options={{ title: 'Alocação' }} />
      <Tab.Screen name="SimulacaoTab" component={SimulacaoStack} options={{ title: 'Simulador' }} />
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
