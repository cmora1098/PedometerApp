import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Switch,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import * as Progress from "react-native-progress";
import { usePedometer } from "../hooks/usePedometer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function StepsScreen() {
  const { isAvailable, steps } = usePedometer();
  const theme = useColorScheme();
  const hasReachedGoal = useRef(false);
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [useDarkMode, setUseDarkMode] = useState(theme === "dark");
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  const progress = Math.min(steps / dailyGoal, 1);
  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  useFocusEffect(
    useCallback(() => {
      const loadGoal = async () => {
        const saved = await AsyncStorage.getItem("meta_diaria_pasos");
        if (saved) setDailyGoal(parseInt(saved));
      };
      loadGoal();
    }, [])
  );

  const saveNewGoal = async () => {
    const parsed = parseInt(newGoal);
    if (!isNaN(parsed) && parsed > 0) {
      await AsyncStorage.setItem("meta_diaria_pasos", parsed.toString());
      setDailyGoal(parsed);
      setModalVisible(false);
      setNewGoal("");
    } else {
      alert("Ingrese una meta válida");
    }
  };

  const backgroundColor = useDarkMode ? "#121212" : "#F9F9F9";
  const cardColor = useDarkMode ? "#1F1F1F" : "#FFFFFF";
  const textColor = useDarkMode ? "#FFFFFF" : "#222222";
  const accentColor = "#00A896";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>
        Contador de Pasos
      </Text>
      <Text style={[styles.date, { color: textColor }]}>{formattedDate}</Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: cardColor,
            shadowColor: useDarkMode ? "#000" : "#ccc",
          },
        ]}
      >
        <Progress.Circle
          size={180}
          progress={progress}
          showsText
          formatText={() => `${Math.round(progress * 100)}%`}
          color={accentColor}
          thickness={10}
          borderWidth={0}
          unfilledColor={useDarkMode ? "#333" : "#eee"}
          animated
        />

        <Text style={[styles.steps, { color: accentColor }]}>
          {steps.toLocaleString()} pasos
        </Text>

        <Text style={[styles.meta, { color: textColor }]}>
          Meta diaria: {dailyGoal.toLocaleString()} pasos
        </Text>

        <Text style={[styles.status, { color: textColor }]}>
          Sensor:{" "}
          <Text
            style={{
              fontWeight: "bold",
              color: isAvailable ? accentColor : "red",
            }}
          >
            {isAvailable === null
              ? "Cargando..."
              : isAvailable
              ? "Disponible"
              : "No disponible"}
          </Text>
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: accentColor }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Cambiar Meta</Text>
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text style={[styles.switchLabel, { color: textColor }]}>
            Tema Oscuro
          </Text>
          <Switch
            value={useDarkMode}
            onValueChange={setUseDarkMode}
            trackColor={{ false: "#ccc", true: accentColor }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Modal para cambiar meta */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={[styles.modalContainer, { backgroundColor: cardColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Nueva meta diaria
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { color: textColor, borderColor: accentColor },
              ]}
              keyboardType="numeric"
              placeholder="Ej. 8000"
              placeholderTextColor="#888"
              value={newGoal}
              onChangeText={setNewGoal}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={saveNewGoal}
                style={[styles.modalButton, { backgroundColor: accentColor }]}
              >
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
              >
                <Text style={[styles.modalButtonText, { color: "#000" }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    marginBottom: 24,
    fontStyle: "italic",
    color: "#666",
  },
  card: {
    width: "100%",
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  steps: {
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 24,
  },
  meta: {
    fontSize: 16,
    marginTop: 8,
  },
  status: {
    marginTop: 16,
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  switchContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  switchLabel: {
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 16,
  },
});
