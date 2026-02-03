import { Wallet, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { styles } from "../styles/style";

// Helper to get SA marginal tax rate based on taxable gain
function getSACryptoTaxRate(taxableGain) {
  if (taxableGain <= 237100) return 0.18;
  if (taxableGain <= 370500) return 0.26;
  if (taxableGain <= 512800) return 0.31;
  if (taxableGain <= 673000) return 0.36;
  if (taxableGain <= 857900) return 0.39;
  if (taxableGain <= 1817000) return 0.41;
  return 0.45;
}

export default function FinalSummary({ processedTransactions, finalBalances }) {
  const ANNUAL_EXCLUSION = 40000; // R40k annual exclusion
  const capitalGains = {};

  // Calculate capital gains per coin
  processedTransactions.forEach((txObj) => {
    const disposal = txObj.disposal;
    if (!disposal) return;
    const coin = txObj.transaction.sellCoin;
    if (!capitalGains[coin]) capitalGains[coin] = 0;
    capitalGains[coin] += disposal.gain;
  });

  const totalGain = Object.values(capitalGains).reduce((sum, g) => sum + g, 0);
  const taxableGain = Math.max(totalGain - ANNUAL_EXCLUSION, 0);
  const marginalTaxRate = getSACryptoTaxRate(taxableGain);
  const taxOwed = taxableGain * marginalTaxRate;

  const formatNumber = (num) =>
    num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        {/* Total Coins */}
        <div style={{ ...styles.statCard, boxShadow: "0 0 40px rgba(45, 212, 191, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ ...styles.statIcon, background: "rgba(45, 212, 191, 0.2)" }}>
              <Wallet size={20} color="#2dd4bf" />
            </div>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>Total Coins</span>
          </div>
          <p style={{ fontSize: "32px", fontWeight: "700" }}>{Object.keys(finalBalances).length}</p>
        </div>

        {/* Disposed Coins */}
        <div style={styles.statCard}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ ...styles.statIcon, background: "rgba(167, 139, 250, 0.2)" }}>
              <Layers size={20} color="#a78bfa" />
            </div>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>Disposed Coins</span>
          </div>
          <p style={{ fontSize: "32px", fontWeight: "700" }}>{Object.keys(capitalGains).length}</p>
        </div>

        {/* Total Capital Gain */}
        <div style={{ ...styles.statCard, boxShadow: totalGain >= 0 ? "0 0 40px rgba(34, 197, 94, 0.1)" : "0 0 40px rgba(239, 68, 68, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ ...styles.statIcon, background: totalGain >= 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)" }}>
              {totalGain >= 0 ? <TrendingUp size={20} color="#22c55e" /> : <TrendingDown size={20} color="#ef4444" />}
            </div>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>Total Capital Gain</span>
          </div>
          <p style={{ fontSize: "32px", fontWeight: "700", ...styles.mono, ...(totalGain >= 0 ? styles.success : styles.danger) }}>
            {totalGain >= 0 ? "+" : ""}R{formatNumber(totalGain)}
          </p>
        </div>

        {/* Taxable Gain */}
        <div style={{ ...styles.statCard, boxShadow: "0 0 40px rgba(239, 68, 68, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ ...styles.statIcon, background: "rgba(239, 68, 68, 0.2)" }}>
              <TrendingDown size={20} color="#ef4444" />
            </div>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>Taxable Gain</span>
          </div>
          <p style={{ fontSize: "32px", fontWeight: "700", ...styles.mono, ...styles.danger }}>
            R{formatNumber(taxableGain)}
          </p>
        </div>

        {/* Estimated Tax Owed */}
        <div style={{ ...styles.statCard, boxShadow: "0 0 40px rgba(239, 68, 68, 0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ ...styles.statIcon, background: "rgba(239, 68, 68, 0.2)" }}>
              <Wallet size={20} color="#ef4444" />
            </div>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>Estimated Tax Owed</span>
          </div>
          <p style={{ fontSize: "32px", fontWeight: "700", ...styles.mono, ...styles.danger }}>
            R{formatNumber(taxOwed)}
          </p>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
            (Applied tax rate: {(marginalTaxRate * 100).toFixed(0)}%)
          </p>
        </div>
      </div>

      {/* The rest of the code (Final Balances + Capital Gains per Coin) remains unchanged */}
      {/* You can reuse your current code for the tables here */}
    </div>
  );
}
