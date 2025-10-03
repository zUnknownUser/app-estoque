import { Alert, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';

export default function LogoutButton() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();

  const onLogout = () => {
    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <Pressable
      onPress={onLogout}
      style={({ pressed }) => [
        styles.btn,
        { top: insets.top + 8 }, 
        pressed && { opacity: 0.7 },
      ]}
      accessibilityLabel="Sair"
    >
      <Ionicons name="log-out-outline" size={22} color="#111827" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 12,
    zIndex: 10,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 8,
    elevation: 2, // Android
    shadowColor: '#000', // iOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
});
