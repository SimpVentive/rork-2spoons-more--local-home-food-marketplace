import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable style={styles.button} onPress={onCancel}>
              <Text style={styles.buttonText}>{cancelText}</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={onConfirm}>
              <Text
                style={[
                  styles.buttonText,
                  destructive && styles.destructiveText,
                ]}
              >
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 17, fontWeight: "600", marginBottom: 8 },
  message: { fontSize: 14, color: "#444", marginBottom: 20 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 16 },
  button: { paddingVertical: 6, paddingHorizontal: 10 },
  buttonText: { fontSize: 15, color: "#007AFF" },
  destructiveText: { color: "#FF3B30", fontWeight: "600" },
});