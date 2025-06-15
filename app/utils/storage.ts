import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveStepsForToday(steps: number) {
  const key = getTodayKey();
  await AsyncStorage.setItem(key, steps.toString());
}

export async function getStepsHistory(days = 7) {
  const today = new Date();
  const history: { date: string; steps: number }[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = `steps-${date.toISOString().split("T")[0]}`;
    const value = await AsyncStorage.getItem(key);
    history.unshift({
      date: date.toLocaleDateString("es-PE", { weekday: "short" }),
      steps: value ? parseInt(value) : 0,
    });
  }
  return history;
}

function getTodayKey() {
  const today = new Date().toISOString().split("T")[0];
  return `steps-${today}`;
}
