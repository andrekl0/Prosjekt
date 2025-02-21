// Funksjon for å spinne hjulet
export const spinWheel = (items) => {
  if (!items || items.length === 0) {
    throw new Error("No items available to spin.");
  }

  // Beregn total vekt
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);

  // Generer et tilfeldig tall mellom 0 og total vekt
  const random = Math.random() * totalWeight;

  // Finn det vinnende alternativet
  let currentWeight = 0;
  for (const item of items) {
    currentWeight += item.weight;
    if (random < currentWeight) {
      return item;
    }
  }
};