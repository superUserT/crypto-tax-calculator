import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, ChevronDown, ChevronRight, Expand, ArrowRightLeft, Calendar, Coins, Wallet, TrendingUp, TrendingDown, Layers, Calculator, Loader2, Sparkles } from "lucide-react";

// CSV parsing helper
function parseCSV(content) {
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
  if (lines.length < 2) return [];

  const headers = lines[0].split(/\t|,| {2,}/).map((h) => h.trim());

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
      tx.buyPricePerCoin = parseFloat(
        (tx.buyPricePerCoin || "").toString().replace(/[^0-9.-]+/g, "")
      ) || 0;
      tx.sellPricePerCoin = parseFloat(
        (tx.sellPricePerCoin || "").toString().replace(/[^0-9.-]+/g, "")
      ) || 0;

      tx.type = (tx.type || "").toUpperCase();
      tx.date = tx.date || new Date().toISOString().slice(0, 19).replace("T", " ");

      return tx;
    });
}

// Styles object
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0f1a 0%, #111827 100%)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#f1f5f9",
  },
  wrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "48px 16px",
    position: "relative",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "9999px",
    background: "rgba(45, 212, 191, 0.1)",
    border: "1px solid rgba(45, 212, 191, 0.2)",
    color: "#2dd4bf",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "24px",
  },
  header: {
    textAlign: "center",
    marginBottom: "48px",
  },
  title: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: "700",
    marginBottom: "16px",
  },
  titleGradient: {
    background: "linear-gradient(135deg, #2dd4bf, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    fontSize: "18px",
    color: "#94a3b8",
    maxWidth: "600px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(71, 85, 105, 0.3)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  uploadCard: {
    padding: "32px",
    border: "2px dashed rgba(71, 85, 105, 0.5)",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  uploadIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "rgba(45, 212, 191, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  button: {
    padding: "12px 24px",
    background: "#2dd4bf",
    color: "#0a0f1a",
    fontWeight: "600",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 20px rgba(45, 212, 191, 0.25)",
  },
  buttonSecondary: {
    padding: "8px 16px",
    background: "rgba(51, 65, 85, 0.5)",
    color: "#f1f5f9",
    fontWeight: "500",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  table: {
    width: "100%",
    fontSize: "14px",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    fontSize: "12px",
    letterSpacing: "0.05em",
    background: "rgba(51, 65, 85, 0.3)",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(71, 85, 105, 0.3)",
  },
  tag: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statCard: {
    padding: "24px",
    background: "rgba(30, 41, 59, 0.5)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(71, 85, 105, 0.3)",
    borderRadius: "16px",
  },
  statIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mono: {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  success: { color: "#22c55e" },
  danger: { color: "#ef4444" },
  successBg: { background: "rgba(34, 197, 94, 0.2)", color: "#22c55e" },
  dangerBg: { background: "rgba(239, 68, 68, 0.2)", color: "#ef4444" },
  accentBg: { background: "rgba(167, 139, 250, 0.2)", color: "#a78bfa" },
  primaryBg: { background: "rgba(45, 212, 191, 0.2)", color: "#2dd4bf" },
  mutedBg: { background: "rgba(51, 65, 85, 0.5)", color: "#94a3b8" },
};

// Transaction Upload Component
function TransactionUpload({ onDataReady }) {
  const fileInputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const transactions = parseCSV(content);
      onDataReady(transactions);
    };
    reader.readAsText(file);
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      style={{ ...styles.card, ...styles.uploadCard }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.5)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)"}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <div style={styles.uploadIcon}>
          <Upload size={32} color="#2dd4bf" />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
            Drop your CSV file here
          </p>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>
            or click to browse files
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#64748b" }}>
          <FileSpreadsheet size={16} />
          <span>Supports .csv files with transaction data</span>
        </div>
      </div>
    </div>
  );
}

// Transactions Table Component
function TransactionsTable({ processedTransactions }) {
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
                      {tx.buyPricePerCoin > 0 && `$${formatNumber(tx.buyPricePerCoin)}`}
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
                            { label: "Cost Basis", value: `$${formatNumber(disposal.cost)}` },
                            { label: "Proceeds", value: `$${formatNumber(disposal.proceeds)}` },
                            { label: "Gain/Loss", value: `${disposal.gain >= 0 ? '+' : ''}$${formatNumber(disposal.gain)}`, isGain: disposal.gain >= 0 }
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
                                <span style={styles.mono}>${formatNumber(lot.pricePerCoin)}</span>
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

// Final Summary Component
function FinalSummary({ processedTransactions, finalBalances }) {
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

// Main App Component
function App() {
  const [transactions, setTransactions] = useState([]);
  const [processed, setProcessed] = useState([]);
  const [finalBalances, setFinalBalances] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = async () => {
    setIsCalculating(true);
    try {
      const res = await fetch("http://localhost:8000/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });

      if (!res.ok) {
        throw new Error("Network response not ok");
      }

      const data = await res.json();
      setProcessed(data.processedTransactions);
      setFinalBalances(data.finalBalances);
    } catch (err) {
      console.error("Error calculating FIFO:", err);
      alert("Error calculating FIFO. See console for details.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.badge}>
            <Sparkles size={16} />
            FIFO Tax Calculator
          </div>
          <h1 style={styles.title}>
            <span style={styles.titleGradient}>Crypto FIFO</span>
            <span> Calculator</span>
          </h1>
          <p style={styles.subtitle}>
            Upload your transaction history and calculate capital gains using the First-In-First-Out method
          </p>
        </header>

        {/* Main Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Upload Section */}
          <section>
            <TransactionUpload onDataReady={setTransactions} />

            {transactions.length > 0 && (
              <div style={{
                marginTop: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(34, 197, 94, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}>
                <p style={{ color: "#22c55e", fontWeight: "500" }}>
                  ✓ {transactions.length} transactions loaded
                </p>
                <button
                  onClick={calculate}
                  disabled={isCalculating}
                  style={{
                    ...styles.button,
                    opacity: isCalculating ? 0.5 : 1,
                    cursor: isCalculating ? "not-allowed" : "pointer",
                  }}
                >
                  {isCalculating ? (
                    <>
                      <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator size={20} />
                      Calculate FIFO
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* Transactions Table */}
          <section>
            <TransactionsTable processedTransactions={processed} />
          </section>

          {/* Summary */}
          {processed.length > 0 && (
            <section>
              <FinalSummary
                processedTransactions={processed}
                finalBalances={finalBalances}
              />
            </section>
          )}
        </div>

        {/* Footer */}
        <footer style={{ marginTop: "64px", paddingTop: "32px", borderTop: "1px solid rgba(71, 85, 105, 0.3)", textAlign: "center", fontSize: "14px", color: "#64748b" }}>
          <p>Crypto FIFO Calculator • Calculate your capital gains accurately</p>
        </footer>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>
    </div>
  );
}

export default App;
