export function parseCSV(content) {
  const requiredFields = [
    "type",
    "buyCoin",
    "sellCoin",
    "buyAmount",
    "sellAmount",
    "buyPricePerCoin",
    "sellPricePerCoin",
    "date"
  ];

  const lines = content.trim().split("\n");
  if (lines.length < 2) throw new Error("The file is empty or missing rows.");

  const headers = lines[0].split(/\t|,| {2,}/).map((h) => h.trim());

  // Check for missing required fields
  const missingFields = requiredFields.filter(f => !headers.includes(f));
  if (missingFields.length > 0) {
    throw new Error(`Missing required columns: ${missingFields.join(", ")}`);
  }

  return lines
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line)
    .map((line) => {
      const values = line.split(/\t|,| {2,}/);
      const tx = {};

      headers.forEach((h, i) => {
        tx[h] = values[i]?.trim() || "";
      });

      requiredFields.forEach((f) => {
        if (!(f in tx)) tx[f] = "";
      });

      tx.buyAmount = parseFloat((tx.buyAmount || 0).toString().replace(/,/g, "")) || 0;
      tx.sellAmount = parseFloat((tx.sellAmount || 0).toString().replace(/,/g, "")) || 0;
      tx.buyPricePerCoin = parseFloat((tx.buyPricePerCoin || "").toString().replace(/[^0-9.-]+/g, "")) || 0;
      tx.sellPricePerCoin = parseFloat((tx.sellPricePerCoin || "").toString().replace(/[^0-9.-]+/g, "")) || 0;

      tx.type = (tx.type || "").toUpperCase();
      tx.date = tx.date || new Date().toISOString().slice(0, 19).replace("T", " ");

      return tx;
    });
}
