import { useEffect, useState } from "react";
import { Pedometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";

type StepHistory = {
  [date: string]: number;
};

export function usePedometer() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [steps, setSteps] = useState<number>(0);

  useEffect(() => {
    let subscription: any;

    // Revisar disponibilidad del sensor
    Pedometer.isAvailableAsync().then(
      (result) => setIsAvailable(result),
      () => setIsAvailable(false)
    );

    // Obtener pasos del día actual
    const now = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    Pedometer.getStepCountAsync(start, now).then(
      (result) => {
        setSteps(result.steps);
        saveStepsToHistory(result.steps);
      },
      () => setSteps(0)
    );

    // Escuchar pasos en tiempo real
    subscription = Pedometer.watchStepCount((result) => {
      setSteps((prev) => {
        const updated = prev + result.steps;
        saveStepsToHistory(updated);
        return updated;
      });
    });

    return () => {
      subscription?.remove?.();
    };
  }, []);

  // Guardar pasos por fecha en AsyncStorage
  const saveStepsToHistory = async (count: number) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const json = await AsyncStorage.getItem("stepHistory");
      const history: StepHistory = json ? JSON.parse(json) : {};
      history[today] = count;
      await AsyncStorage.setItem("stepHistory", JSON.stringify(history));
    } catch (error) {
      console.error("Error guardando historial de pasos", error);
    }
  };

  return { isAvailable, steps };
}
