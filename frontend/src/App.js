import { useState } from "react";

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

  // Normalize headers: lowercase, trim spaces
  const headers = lines[0].split(/\t|,| {2,}/).map((h) => h.trim());

  return lines
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line) // skip empty lines
    .map((line) => {
      const values = line.split(/\t|,| {2,}/);
      const tx = {};

      headers.forEach((h, i) => {
        tx[h] = values[i]?.trim() || "";
      });

      // Ensure all required fields exist
      requiredFields.forEach((f) => {
        if (!(f in tx)) tx[f] = "";
      });

      // Normalize numbers
      tx.buyAmount = parseFloat((tx.buyAmount || 0).toString().replace(/,/g, "")) || 0;
      tx.sellAmount = parseFloat((tx.sellAmount || 0).toString().replace(/,/g, "")) || 0;
      tx.buyPricePerCoin = parseFloat(
        (tx.buyPricePerCoin || "").toString().replace(/[^0-9.-]+/g, "")
      ) || 0;
      tx.sellPricePerCoin = parseFloat(
        (tx.sellPricePerCoin || "").toString().replace(/[^0-9.-]+/g, "")
      ) || 0;

      // Normalize type to uppercase
      tx.type = (tx.type || "").toUpperCase();

      // Default date if missing
      tx.date = tx.date || new Date().toISOString().slice(0, 19).replace("T", " ");

      return tx;
    });
}


function TransactionUpload({ onDataReady }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const transactions = parseCSV(content);
      onDataReady(transactions);
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <input type="file" accept=".csv" onChange={handleFile} />
    </div>
  );
}

// Transactions table
function TransactionsTable({ processedTransactions }) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (i) =>
    setExpandedRows((prev) => ({ ...prev, [i]: !prev[i] }));

  const expandAll = () => {
    const all = {};
    processedTransactions.forEach((_, i) => (all[i] = true));
    setExpandedRows(all);
  };

  return (
    <div>
      <button onClick={expandAll} style={{ marginBottom: 10 }}>
        Expand All
      </button>
      <table border="1" cellPadding="5" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>SellCoin</th>
            <th>SellAmount</th>
            <th>BuyCoin</th>
            <th>BuyAmount</th>
            <th>BuyPricePerCoin</th>
            <th>Calculations</th>
          </tr>
        </thead>
        <tbody>
          {processedTransactions.map((txObj, i) => {
            const tx = txObj.transaction;
            const disposal = txObj.disposal;
            return (
              <>
                <tr key={i}>
                  <td>{tx.date}</td>
                  <td>{tx.type}</td>
                  <td>{tx.sellCoin}</td>
                  <td>{tx.sellAmount}</td>
                  <td>{tx.buyCoin}</td>
                  <td>{tx.buyAmount}</td>
                  <td>{tx.buyPricePerCoin}</td>
                  <td>
                    {disposal ? (
                      <button onClick={() => toggleRow(i)}>
                        {expandedRows[i] ? "Hide" : "Show"}
                      </button>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
                {disposal && expandedRows[i] && (
                  <tr>
                    <td colSpan="8">
                      <strong>Disposal Details:</strong>
                      <div>Disposed Amount: {disposal.disposedAmount}</div>
                      <div>Cost: {disposal.cost}</div>
                      <div>Proceeds: {disposal.proceeds}</div>
                      <div>Gain: {disposal.gain}</div>
                      <div>
                        <strong>Consumed Lots:</strong>
                        <ul>
                          {disposal.consumedLots.map((lot, j) => (
                            <li key={j}>
                              {lot.amount} @ {lot.pricePerCoin} (Date: {lot.date})
                            </li>
                          ))}
                        </ul>
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
  );
}

// Final summary
function FinalSummary({ processedTransactions, finalBalances }) {
  const capitalGains = {};

  processedTransactions.forEach((txObj) => {
    const disposal = txObj.disposal;
    if (!disposal) return;
    const coin = txObj.transaction.sellCoin;
    if (!capitalGains[coin]) capitalGains[coin] = 0;
    capitalGains[coin] += disposal.gain;
  });

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Final Balances</h2>
      <table border="1" cellPadding="5" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Coin</th>
            <th>Total Amount</th>
            <th>Lots</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(finalBalances).map(([coin, data], i) => (
            <tr key={i}>
              <td>{coin}</td>
              <td>{data.totalAmount}</td>
              <td>
                <ul>
                  {(Array.isArray(data.lots) ? data.lots : []).map((lot, j) => (
                    <li key={j}>
                      {lot.amount} @ {lot.pricePerCoin} (Date: {lot.date})
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 20 }}>Capital Gains per Coin</h2>
      <table border="1" cellPadding="5" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Coin</th>
            <th>Total Gain</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(capitalGains).map(([coin, gain], i) => (
            <tr key={i}>
              <td>{coin}</td>
              <td>{gain.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Main App
function App() {
  const [transactions, setTransactions] = useState([]);
  const [processed, setProcessed] = useState([]);
  const [finalBalances, setFinalBalances] = useState({});

  const calculate = async () => {
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
      }
    };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Crypto FIFO Calculator (Upload CSV)</h1>

      <TransactionUpload onDataReady={setTransactions} />

      <button onClick={calculate} style={{ marginBottom: 20 }}>
        Calculate
      </button>

      <TransactionsTable processedTransactions={processed} />

      {processed.length > 0 && (
        <FinalSummary
          processedTransactions={processed}
          finalBalances={finalBalances}
        />
      )}
    </div>
  );
}

export default App;
