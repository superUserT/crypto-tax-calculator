import { useState } from "react";
import { ChevronDown, ChevronRight, Expand, ArrowRightLeft, Calendar, Coins } from "lucide-react";
import { styles } from "../styles/style";

export default function TransactionsTable({ processedTransactions }) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (i) => setExpandedRows((prev) => ({ ...prev, [i]: !prev[i] }));

  const expandAll = () => {
    const all = {};
    processedTransactions.forEach((_, i) => (all[i] = true));
    setExpandedRows(all);
  };

  const formatNumber = (num) => num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });

  if (processedTransactions.length === 0) {
    return (
      <div style={{ ...styles.card, padding: "48px", textAlign: "center" }}>
        <div style={{ ...styles.uploadIcon, background: "rgba(51, 65, 85, 0.3)" }}>
          <ArrowRightLeft size={32} color="#64748b" />
        </div>
        <p style={{ color: "#94a3b8", marginTop: "16px" }}>No transactions to display</p>
        <p style={{ fontSize: "14px", color: "#64748b" }}>Upload a CSV and click Calculate</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <div style={{ padding: "16px", borderBottom: "1px solid rgba(71, 85, 105, 0.3)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
          <ArrowRightLeft size={20} color="#2dd4bf" />
          Transactions
          <span style={{ fontSize: "14px", fontWeight: "400", color: "#94a3b8" }}>
            ({processedTransactions.length} records)
          </span>
        </h3>
        <button onClick={expandAll} style={styles.buttonSecondary}>
          <Expand size={16} />
          Expand All
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "40px" }}></th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Sell</th>
              <th style={styles.th}>Buy</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Price/Coin</th>
            </tr>
          </thead>
          <tbody>
            {processedTransactions.map((txObj, i) => {
              const tx = txObj.transaction;
              const disposal = txObj.disposal;
              const isExpanded = expandedRows[i];

              const typeStyle = tx.type === "BUY" ? styles.successBg : tx.type === "SELL" ? styles.dangerBg : styles.accentBg;

              return (
                <>
                  <tr
                    key={`row-${i}`}
                    style={{ cursor: disposal ? "pointer" : "default" }}
                    onClick={() => disposal && toggleRow(i)}
                  >
                    <td style={styles.td}>
                      {disposal && (isExpanded ? <ChevronDown size={16} color="#94a3b8" /> : <ChevronRight size={16} color="#94a3b8" />)}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Calendar size={16} color="#64748b" />
                        <span style={styles.mono}>{tx.date}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.tag, ...typeStyle, textTransform: "uppercase" }}>{tx.type}</span>
                    </td>
                    <td style={styles.td}>
                      {tx.sellAmount > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={styles.mono}>{formatNumber(tx.sellAmount)}</span>
                          <span style={{ ...styles.tag, ...styles.mutedBg }}>{tx.sellCoin}</span>
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {tx.buyAmount > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={styles.mono}>{formatNumber(tx.buyAmount)}</span>
                          <span style={{ ...styles.tag, ...styles.primaryBg }}>{tx.buyCoin}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ ...styles.td, textAlign: "right", ...styles.mono }}>
                      {tx.buyPricePerCoin > 0 && `R${formatNumber(tx.buyPricePerCoin)}`}
                    </td>
                  </tr>

                  {disposal && isExpanded && (
                    <tr key={`details-${i}`} style={{ background: "rgba(30, 41, 59, 0.3)" }}>
                      <td colSpan={6} style={{ padding: "24px" }}>
                        <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <Coins size={16} color="#2dd4bf" />
                          Disposal Calculation
                        </h4>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                          {[
                            { label: "Disposed Amount", value: formatNumber(disposal.disposedAmount) },
                            { label: "Cost Basis", value: `R${formatNumber(disposal.cost)}` },
                            { label: "Proceeds", value: `R${formatNumber(disposal.proceeds)}` },
                            { label: "Gain/Loss", value: `${disposal.gain >= 0 ? '+' : ''}R${formatNumber(disposal.gain)}`, isGain: disposal.gain >= 0 }
                          ].map((item, j) => (
                            <div key={j} style={{ padding: "12px", borderRadius: "8px", background: "rgba(30, 41, 59, 0.5)" }}>
                              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>{item.label}</p>
                              <p style={{ ...styles.mono, fontWeight: "600", ...(item.isGain !== undefined ? (item.isGain ? styles.success : styles.danger) : {}) }}>
                                {item.value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div>
                          <p style={{ fontSize: "12px", fontWeight: "600", color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Consumed Lots (FIFO)
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {disposal.consumedLots.map((lot, j) => (
                              <div key={j} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "8px", borderRadius: "8px", background: "rgba(30, 41, 59, 0.3)", fontSize: "14px" }}>
                                <span style={styles.mono}>{formatNumber(lot.amount)}</span>
                                <span style={{ color: "#64748b" }}>@</span>
                                <span style={styles.mono}>R{formatNumber(lot.pricePerCoin)}</span>
                                <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "auto" }}>{lot.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}