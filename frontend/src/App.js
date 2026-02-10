import { useState } from "react";
import { Calculator, Loader2, Sparkles, Info } from "lucide-react";
import { Link } from "react-router-dom";

import TransactionUpload from "@/components/TransactionUpload";
import TransactionsTable from "@/components/TransactionsTable";
import FinalSummary from "@/components/FinalSummary";
import ExportReport from "@/components/ExportReport";

const App = () => {
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">

        {/* Top Navigation */}
        <nav className="mb-12 flex items-center justify-center gap-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline"
          >
            <Calculator className="h-4 w-4" />
            Calculator
          </Link>

          <Link
            to="/tax-info"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent no-underline"
          >
            <Info className="h-4 w-4" />
            Crypto Tax Info
          </Link>
        </nav>

        <div className="flex flex-col gap-8">

          {/* Header */}
          <header className="text-center">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              FIFO Tax Calculator
            </div>

            <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Crypto FIFO
              </span>{" "}
              Calculator
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Upload your transaction history and calculate capital gains using
              the First-In-First-Out method
            </p>
          </header>

          {/* Upload Section */}
          <section>
            <a
              href="/transaction_template.csv"
              download
              className="mb-3 inline-block text-sm font-semibold text-primary no-underline hover:underline"
            >
              Download CSV Template
            </a>

            <TransactionUpload onDataReady={setTransactions} />

            {transactions.length > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-sm font-medium text-primary">
                  ✓ {transactions.length} transactions loaded
                </p>

                <button
                  onClick={calculate}
                  disabled={isCalculating}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-5 w-5" />
                      Calculate FIFO
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive">
              {errorMessage}
            </div>
          )}

          {/* Transactions Table */}
          <section>
            <TransactionsTable processedTransactions={processed} />
          </section>

          {/* Summary + Export */}
          {processed.length > 0 && (
            <section className="space-y-6">
              <FinalSummary
                processedTransactions={processed}
                finalBalances={finalBalances}
              />

              <div className="flex justify-center">
                <ExportReport
                  processedTransactions={processed}
                  finalBalances={finalBalances}
                />
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>Crypto FIFO Calculator • Calculate your capital gains accurately</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
