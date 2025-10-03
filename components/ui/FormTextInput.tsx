import { Controller, Control } from 'react-hook-form';
import { TextInput, View, Text, StyleSheet } from 'react-native';

export default function FormTextInput({
  control, name, label, keyboardType, multiline
}:{
  control: Control<any>, name: string, label: string,
  keyboardType?: 'default'|'numeric'|'number-pad'|'decimal-pad',
  multiline?: boolean
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field:{onChange, onBlur, value}, fieldState:{error} }) => (
        <View style={{marginBottom:12}}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={[styles.input, multiline && {height:100, textAlignVertical:'top'}]}
            value={value?.toString() ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType={keyboardType}
            multiline={multiline}
          />
          {error ? <Text style={styles.err}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  label:{ marginBottom:6, fontWeight:'600' },
  input:{ backgroundColor:'#fff', borderWidth:1, borderColor:'#e5e7eb', borderRadius:12, padding:12 },
  err:{ color:'#ef4444', marginTop:4, fontSize:12 },
});
