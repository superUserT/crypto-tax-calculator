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

  // ✅ FIFO Calculation Request
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

      const message =
        err.message === "Failed to fetch"
          ? "Cannot reach backend. Make sure the server is running"
          : err.message || "Error calculating FIFO.";

      setErrorMessage(message);
    } finally {
      setIsCalculating(false);
    }
  };

  // ✅ Correct Download Report (Matches FinalSummary Structure)
  const downloadReport = () => {
    if (processed.length === 0) return;

    // ✅ CSV Headers
    const headers = [
      "Date",
      "Type",
      "Buy Coin",
      "Sell Coin",
      "Buy Amount",
      "Sell Amount",
      "Gain (R)",
      "Cost Basis (R)",
      "Proceeds (R)",
    ];

    // ✅ Rows from processedTransactions
    const rows = processed.map((txObj) => {
      const tx = txObj.transaction || {};
      const disposal = txObj.disposal || {};

      return [
        tx.date || "",
        tx.type || "",
        tx.buyCoin || "",
        tx.sellCoin || "",
        tx.buyAmount || "",
        tx.sellAmount || "",
        disposal.gain?.toFixed(2) || "0.00",
        disposal.costBasis?.toFixed(2) || "0.00",
        disposal.proceeds?.toFixed(2) || "0.00",
      ];
    });

    // ✅ Add Final Holdings Section
    rows.push([]);
    rows.push(["FINAL HOLDINGS"]);
    rows.push(["Coin", "Amount"]);

    Object.entries(finalBalances).forEach(([coin, data]) => {
      rows.push([coin, data.totalAmount]);
    });

    // ✅ Build CSV
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    // ✅ Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "crypto_fifo_full_report.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    const headers = [
      "type",
      "buyCoin",
      "sellCoin",
      "buyAmount",
      "sellAmount",
      "buyPricePerCoin",
      "sellPricePerCoin",
      "date",
    ];

    const csvContent = headers.join(",") + "\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transaction_template.csv";
    link.click();
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
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "32px",
                  }}
                >
                  {/* Header */}
                  <header style={styles.header}>
                    <div style={styles.badge}>
                      <Sparkles size={16} />
                      FIFO Tax Calculator
                    </div>

                    <h1 style={styles.title}>
                      <span style={styles.titleGradient}>Crypto FIFO</span>{" "}
                      Calculator
                    </h1>

                    <p style={styles.subtitle}>
                      Upload your transaction history and calculate capital
                      gains using the First-In-First-Out method
                    </p>
                  </header>

                  {/* Upload Section */}
                  <section>
                    <div style={{ textAlign: "center" }}>
                      <button
                        onClick={downloadTemplate}
                        style={{
                          background: "none",
                          border: "none",
                          ...styles.subtitle,
                          color: "#60a5fa",
                          cursor: "pointer",
                          marginBottom: "50px",
                          marginRight: "50px"
                        }}
                      >
                        Download CSV Template
                      </button>

                      <a
                        href="https://www.taxtim.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          ...styles.subtitle,
                          color: "#34d399",
                          fontWeight: 600,
                          textDecoration: "none",
                          marginBottom: "50px"
                        }}
                      >
                        Visit TaxTim
                      </a>
                      <br />
                    </div>


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
                            cursor: isCalculating
                              ? "not-allowed"
                              : "pointer",
                          }}
                        >
                          {isCalculating ? (
                            <>
                              <Loader2
                                size={20}
                                style={{
                                  animation: "spin 1s linear infinite",
                                }}
                              />
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

                  {/* Summary + Download Report */}
                  {processed.length > 0 && (
                    <section style={{ textAlign: "center" }}>
                      <FinalSummary
                        processedTransactions={processed}
                        finalBalances={finalBalances}
                      />

                      {/* ✅ Download Button */}
                      <button
                        onClick={downloadReport}
                        style={{
                          marginTop: "25px",
                          padding: "14px 22px",
                          borderRadius: "10px",
                          background: "#22c55e",
                          color: "white",
                          fontWeight: "700",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        📥 Download Full FIFO Tax Report
                      </button>
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

        {/* Spinner Animation */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </Router>
  );
}

export default App;

