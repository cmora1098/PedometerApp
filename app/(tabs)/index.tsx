import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import * as Progress from "react-native-progress";
import { usePedometer } from "../hooks/usePedometer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

export default function StepsScreen() {
  const { isAvailable, steps } = usePedometer();
  const theme = useColorScheme();
  const hasReachedGoal = useRef(false);
  const [dailyGoal, setDailyGoal] = useState(10000);

  const progress = Math.min(steps / dailyGoal, 1);

  // 🔄 Cargar meta al enfocar pantalla
  useFocusEffect(
    useCallback(() => {
      const loadGoal = async () => {
        const saved = await AsyncStorage.getItem("meta_diaria_pasos");
        if (saved) setDailyGoal(parseInt(saved));
      };
      loadGoal();
    }, [])
  );

  // 🔔 Notificación (si la vas a usar)
  /*
  useEffect(() => {
    if (steps >= dailyGoal && !hasReachedGoal.current) {
      Notifications.scheduleNotificationAsync({
        content: { title: "¡Meta alcanzada!", body: "Lograste tu meta diaria" },
        trigger: null,
      });
      hasReachedGoal.current = true;
    }
  }, [steps, dailyGoal]);
  */

  const backgroundColor = theme === "dark" ? "#000" : "#fff";
  const textColor = theme === "dark" ? "#fff" : "#333";

  const today = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>
        Contador de Pasos
      </Text>
      <Text style={[styles.date, { color: textColor }]}>{formattedDate}</Text>

      <Progress.Circle
        size={160}
        progress={progress}
        showsText
        formatText={() => `${Math.round(progress * 100)}%`}
        color="#00A896"
        thickness={10}
        borderWidth={3}
        unfilledColor="#e0e0e0"
        animated={true}
      />

      <Text style={[styles.steps, { color: "#00A896" }]}>
        {steps.toLocaleString()} pasos
      </Text>
      <Text style={[styles.meta, { color: textColor }]}>
        Meta diaria: {dailyGoal.toLocaleString()} pasos
      </Text>

      <Text style={[styles.status, { color: textColor }]}>
        Sensor:{" "}
        <Text
          style={{ fontWeight: "bold", color: isAvailable ? "#00A896" : "red" }}
        >
          {isAvailable === null
            ? "Cargando..."
            : isAvailable
            ? "Disponible"
            : "No disponible"}
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    marginBottom: 24,
    fontStyle: "italic",
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
    marginTop: 12,
    fontSize: 16,
  },
});
