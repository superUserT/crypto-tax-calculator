import { useState } from "react";
import { Calculator, Loader2, Sparkles, Info } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TransactionUpload from "./components/TransactionUpload";
import TransactionsTable from "./components/TransactionsTable";
import FinalSummary from "./components/FinalSummary";
import CryptoTaxInfo from "./components/CryptoTaxInfo";
import { styles } from "./styles/style";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [processed, setProcessed] = useState([]);
  const [finalBalances, setFinalBalances] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const calculate = async () => {
    setIsCalculating(true);
    setErrorMessage("");
    try {
      const res = await fetch("http://localhost:8000/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Calculation failed on the server");
      }

      const data = await res.json();
      setProcessed(data.processedTransactions);
      setFinalBalances(data.finalBalances);
    } catch (err) {
      console.error("Error calculating FIFO:", err);

      // Friendly messages
      const message =
        err.message === "Failed to fetch"
          ? "Cannot reach backend. Make sure the server is running"
          : err.message || "Error calculating FIFO.";

      setErrorMessage(message);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <Router>
      <div style={styles.container}>
        <div style={styles.wrapper}>
          {/* Top Navigation */}
          <nav
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "32px",
              marginBottom: "48px",
            }}
          >
            <Link
              to="/"
              style={{
                color: "#2dd4bf",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              <Calculator size={16} style={{ marginRight: "6px" }} />
              Calculator
            </Link>

            <Link
              to="/tax-info"
              style={{
                color: "#a78bfa",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              <Info size={16} style={{ marginRight: "6px" }} />
              Crypto Tax Info
            </Link>
          </nav>

          <Routes>
            {/* Calculator Page */}
            <Route
              path="/"
              element={
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  {/* Header */}
                  <header style={styles.header}>
                    <div style={styles.badge}>
                      <Sparkles size={16} />
                      FIFO Tax Calculator
                    </div>
                    <h1 style={styles.title}>
                      <span style={styles.titleGradient}>Crypto FIFO</span> Calculator
                    </h1>
                    <p style={styles.subtitle}>
                      Upload your transaction history and calculate capital gains using the First-In-First-Out method
                    </p>
                  </header>

                  {/* Upload Section */}
                  <section>
                    {/* Downloadable CSV template */}
                    <a
                      href="/transaction_template.csv"
                      download
                      style={{
                        display: "inline-block",
                        marginBottom: "12px",
                        color: "#60a5fa",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Download CSV Template
                    </a>

                    <TransactionUpload onDataReady={setTransactions} />

                    {transactions.length > 0 && (
                      <div
                        style={{
                          marginTop: "16px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px",
                          borderRadius: "12px",
                          background: "rgba(34, 197, 94, 0.1)",
                          border: "1px solid rgba(34, 197, 94, 0.2)",
                        }}
                      >
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

                  {/* Error Message */}
                  {errorMessage && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "16px",
                        borderRadius: "12px",
                        background: "rgba(239, 68, 68, 0.2)",
                        color: "#ef4444",
                        fontWeight: "600",
                        textAlign: "center",
                      }}
                    >
                      {errorMessage}
                    </div>
                  )}

                  {/* Transactions Table */}
                  <section>
                    <TransactionsTable processedTransactions={processed} />
                  </section>

                  {/* Summary */}
                  {processed.length > 0 && (
                    <section>
                      <FinalSummary processedTransactions={processed} finalBalances={finalBalances} />
                    </section>
                  )}
                </div>
              }
            />

            {/* Crypto Tax Info Page */}
            <Route path="/tax-info" element={<CryptoTaxInfo />} />
          </Routes>

          {/* Footer */}
          <footer
            style={{
              marginTop: "64px",
              paddingTop: "32px",
              borderTop: "1px solid rgba(71, 85, 105, 0.3)",
              textAlign: "center",
              fontSize: "14px",
              color: "#64748b",
            }}
          >
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
    </Router>
  );
}

export default App;
