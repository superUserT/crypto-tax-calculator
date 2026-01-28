import {  Wallet, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { styles } from "../styles/style";

export default function FinalSummary({ processedTransactions, finalBalances }) {
  const capitalGains = {};

  processedTransactions.forEach((txObj) => {
    const disposal = txObj.disposal;
    if (!disposal) return;
    const coin = txObj.transaction.sellCoin;
    if (!capitalGains[coin]) capitalGains[coin] = 0;
    capitalGains[coin] += disposal.gain;
  });

  const totalGain = Object.values(capitalGains).reduce((sum, g) => sum + g, 0);

  const formatNumber = (num) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
        <div style={{ ...styles.statCard, boxShadow: "0 0 40px rgba(45, 212, 191, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ ...styles.statIcon, background: "rgba(45, 212, 191, 0.2)" }}>
              <Wallet size={20} color="#2dd4bf" />
            </div>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>Total Coins</span>
          </div>
          <p style={{ fontSize: "32px", fontWeight: "700" }}>{Object.keys(finalBalances).length}</p>
        </div>

        <div style={styles.statCard}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ ...styles.statIcon, background: "rgba(167, 139, 250, 0.2)" }}>
              <Layers size={20} color="#a78bfa" />
            </div>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>Disposed Coins</span>
          </div>
          <p style={{ fontSize: "32px", fontWeight: "700" }}>{Object.keys(capitalGains).length}</p>
        </div>

        <div style={{ ...styles.statCard, boxShadow: totalGain >= 0 ? "0 0 40px rgba(34, 197, 94, 0.1)" : "0 0 40px rgba(239, 68, 68, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div style={{ ...styles.statIcon, background: totalGain >= 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)" }}>
              {totalGain >= 0 ? <TrendingUp size={20} color="#22c55e" /> : <TrendingDown size={20} color="#ef4444" />}
            </div>
            <span style={{ fontSize: "14px", color: "#94a3b8" }}>Total Capital Gain</span>
          </div>
          <p style={{ fontSize: "32px", fontWeight: "700", ...styles.mono, ...(totalGain >= 0 ? styles.success : styles.danger) }}>
            {totalGain >= 0 ? '+' : ''}${formatNumber(totalGain)}
          </p>
        </div>
      </div>

      {/* Final Balances */}
      <div style={styles.card}>
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(71, 85, 105, 0.3)" }}>
          <h3 style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Wallet size={20} color="#2dd4bf" />
            Final Balances
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Coin</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Total Amount</th>
                <th style={styles.th}>Remaining Lots</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(finalBalances).map(([coin, data], i) => (
                <tr key={i}>
                  <td style={styles.td}>
                    <span style={{ ...styles.tag, ...styles.primaryBg, padding: "6px 12px" }}>{coin}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: "right", ...styles.mono, fontWeight: "600" }}>
                    {formatNumber(data.totalAmount)}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {(Array.isArray(data.lots) ? data.lots : []).map((lot, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
                          <span style={styles.mono}>{formatNumber(lot.amount)}</span>
                          <span style={{ color: "#64748b" }}>@</span>
                          <span style={styles.mono}>${formatNumber(lot.pricePerCoin)}</span>
                          <span style={{ fontSize: "12px", color: "#64748b" }}>({lot.date})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capital Gains per Coin */}
      <div style={styles.card}>
        <div style={{ padding: "16px", borderBottom: "1px solid rgba(71, 85, 105, 0.3)" }}>
          <h3 style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <TrendingUp size={20} color="#2dd4bf" />
            Capital Gains by Coin
          </h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", padding: "16px" }}>
          {Object.entries(capitalGains).map(([coin, gain], i) => (
            <div
              key={i}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: `1px solid ${gain >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                background: gain >= 0 ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ ...styles.tag, ...styles.mutedBg }}>{coin}</span>
                {gain >= 0 ? <TrendingUp size={16} color="#22c55e" /> : <TrendingDown size={16} color="#ef4444" />}
              </div>
              <p style={{ fontSize: "24px", fontWeight: "700", ...styles.mono, ...(gain >= 0 ? styles.success : styles.danger) }}>
                {gain >= 0 ? '+' : ''}${formatNumber(gain)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
