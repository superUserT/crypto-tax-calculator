import { useState } from "react";
import { Calculator, Loader2, Sparkles } from "lucide-react";
import TransactionUpload from "./components/TransactionUpload";
import TransactionsTable from "./components/TransactionsTable";
import FinalSummary from "./components/FinalSummary";
import { styles } from "./styles/style";


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
      <br /><br />
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
