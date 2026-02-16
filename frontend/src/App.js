import { useState } from "react";
import { Calculator, Loader2, Sparkles, Info } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


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
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/calculate`, {
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


  // ✅ Download Professional PDF Report
  const downloadReport = () => {
    if (processed.length === 0) return;

    const doc = new jsPDF("landscape");

    const format = (num) =>
      Number(num || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
      });

    // =============================
    // TITLE
    // =============================
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Crypto FIFO Tax Report", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(120);
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      14,
      28
    );

    let y = 40;

    // =============================
    // FINAL SUMMARY CALCULATION
    // =============================
    const ANNUAL_EXCLUSION = 40000;

    const capitalGains = {};
    processed.forEach((txObj) => {
      if (!txObj?.disposal) return;

      const coin =
        txObj.transaction?.sellCoin ||
        txObj.transaction?.buyCoin ||
        "Unknown";

      if (!capitalGains[coin]) capitalGains[coin] = 0;
      capitalGains[coin] += txObj.disposal.gain || 0;
    });

    const totalGain = Object.values(capitalGains).reduce(
      (sum, g) => sum + g,
      0
    );

    const taxableGain = Math.max(totalGain - ANNUAL_EXCLUSION, 0);

    const getSACryptoTaxRate = (gain) => {
      if (gain <= 237100) return 0.18;
      if (gain <= 370500) return 0.26;
      if (gain <= 512800) return 0.31;
      if (gain <= 673000) return 0.36;
      if (gain <= 857900) return 0.39;
      if (gain <= 1817000) return 0.41;
      return 0.45;
    };

    const marginalTaxRate = getSACryptoTaxRate(taxableGain);
    const taxOwed = taxableGain * marginalTaxRate;

    // =============================
    // SUMMARY TABLE
    // =============================
    autoTable(doc, {
      startY: y,
      head: [["Summary", "Value"]],
      body: [
        ["Total Capital Gain", `R${format(totalGain)}`],
        ["Annual Exclusion", `R${format(ANNUAL_EXCLUSION)}`],
        ["Taxable Gain", `R${format(taxableGain)}`],
        ["Tax Rate Applied", `${(marginalTaxRate * 100).toFixed(0)}%`],
        ["Estimated Tax Owed", `R${format(taxOwed)}`],
      ],
      theme: "grid",
      headStyles: { fillColor: [45, 212, 191] },
      styles: { fontSize: 10 },
    });

    y = doc.lastAutoTable.finalY + 15;

    // =============================
    // CAPITAL GAINS PER COIN
    // =============================
    autoTable(doc, {
      startY: y,
      head: [["Coin", "Gain / Loss (R)"]],
      body: Object.entries(capitalGains).map(([coin, gain]) => [
        coin,
        `${gain >= 0 ? "+" : ""}R${format(gain)}`,
      ]),
      theme: "striped",
      headStyles: { fillColor: [167, 139, 250] },
      styles: { fontSize: 10 },
    });

    y = doc.lastAutoTable.finalY + 15;

    // =============================
    // FINAL HOLDINGS
    // =============================
    autoTable(doc, {
      startY: y,
      head: [["Coin", "Amount Held"]],
      body: Object.entries(finalBalances).map(([coin, balance]) => [
        coin,
        format(balance.totalAmount),
      ]),
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 10 },
    });

    // =============================
    // NEW PAGE — TRANSACTIONS TABLE
    // =============================
    doc.addPage();

    doc.setFontSize(18);
    doc.text("Transaction Details (FIFO)", 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [[
        "Date",
        "Type",
        "Sell Coin",
        "Sell Amount",
        "Buy Coin",
        "Buy Amount",
        "Cost (R)",
        "Proceeds (R)",
        "Gain/Loss (R)"
      ]],
      body: processed.map((txObj) => {
        const tx = txObj.transaction || {};
        const disposal = txObj.disposal || {};

        return [
          tx.date || "",
          tx.type || "",
          tx.sellCoin || "",
          tx.sellAmount ? format(tx.sellAmount) : "",
          tx.buyCoin || "",
          tx.buyAmount ? format(tx.buyAmount) : "",
          disposal.cost ? `R${format(disposal.cost)}` : "",
          disposal.proceeds ? `R${format(disposal.proceeds)}` : "",
          disposal.gain !== undefined
            ? `${disposal.gain >= 0 ? "+" : ""}R${format(disposal.gain)}`
            : "",
        ];
      }),
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });

    doc.save("crypto_fifo_tax_report.pdf");
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "24px",
                        flexWrap: "wrap",
                        marginBottom: "50px",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={downloadTemplate}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 20px rgba(96,165,250,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.1)";
                        }}
                        style={{
                          backgroundColor: "#60a5fa",
                          color: "white",
                          padding: "16px 36px",
                          fontSize: "18px",
                          fontWeight: 600,
                          borderRadius: "10px",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.25s ease",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          minWidth: "220px",
                        }}
                      >
                        Download CSV Template
                      </button>

                      <a
                        href="https://www.taxtim.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-4px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 20px rgba(52,211,153,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "none";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.1)";
                        }}
                        style={{
                          backgroundColor: "#34d399",
                          color: "white",
                          padding: "16px 36px",
                          fontSize: "18px",
                          fontWeight: 600,
                          borderRadius: "10px",
                          textDecoration: "none",
                          display: "inline-block",
                          transition: "all 0.25s ease",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          minWidth: "220px",
                        }}
                      >
                        Visit TaxTim
                      </a>
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

