import { Info } from "lucide-react";
import { styles } from "../styles/style";

export default function CryptoTaxInfo() {
  return (
    <div style={{ ...styles.container, padding: "48px 16px" }}>
      <div style={{ ...styles.wrapper, maxWidth: "900px" }}>
        <header style={{ marginBottom: "32px", textAlign: "center" }}>
          <div style={styles.badge}>
            <Info size={16} />
            Crypto Tax Guide
          </div>
          <h1 style={styles.title}>
            <span style={styles.titleGradient}>Understanding Crypto Tax</span>
          </h1>
          <p style={styles.subtitle}>
            Learn how cryptocurrency is taxed in South Africa and how this calculator estimates your capital gains tax.
          </p>
        </header>

        {/* Intro */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
            How Crypto is Taxed in South Africa
          </h2>
          <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
            In South Africa, cryptocurrency is treated as an asset, not currency. This means that capital gains tax (CGT) applies whenever you dispose of crypto:
          </p>
          <ul style={{ color: "#94a3b8", marginTop: "12px", lineHeight: "1.6", paddingLeft: "20px" }}>
            <li>SELLING crypto for cash</li>
            <li>TRADING one crypto for another</li>
            <li>Using crypto to purchase goods or services</li>
          </ul>
          <p style={{ color: "#cbd5e1", marginTop: "12px" }}>
            If you simply hold crypto (HODL), no tax is due until a disposal occurs.
          </p>
        </section>

        {/* Annual exclusion */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
            Annual Exclusion
          </h2>
          <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
            South African residents benefit from an annual CGT exclusion of R40,000. This means that the first R40,000 of capital gains each year are tax-free.
          </p>
        </section>

        {/* Marginal tax */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
            Applying the Marginal Tax Rate
          </h2>
          <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
            Only the taxable gain (total gain minus R40,000 exclusion) is taxed. South Africa uses progressive income tax rates applied to the taxable gain.
          </p>

          <table style={{ width: "100%", marginTop: "16px", borderCollapse: "collapse", color: "#94a3b8" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                <th style={{ textAlign: "left", padding: "8px" }}>Taxable Gain (R)</th>
                <th style={{ textAlign: "left", padding: "8px" }}>Tax Rate</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["0 – 237,100", "18%"],
                ["237,101 – 370,500", "26%"],
                ["370,501 – 512,800", "31%"],
                ["512,801 – 673,000", "36%"],
                ["673,001 – 857,900", "39%"],
                ["857,901 – 1,817,000", "41%"],
                ["1,817,001+", "45%"]
              ].map(([range, rate], i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1f2937" }}>
                  <td style={{ padding: "8px" }}>{range}</td>
                  <td style={{ padding: "8px" }}>{rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Example */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
            Example Calculation
          </h2>

          <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
            Suppose you sold some Bitcoin with the following details:
          </p>

          <ul style={{ color: "#94a3b8", marginTop: "12px", lineHeight: "1.6", paddingLeft: "20px" }}>
            <li>Disposed Amount: 1 BTC</li>
            <li>Cost Basis: R150,000</li>
            <li>Proceeds: R200,000</li>
          </ul>

          <p style={{ color: "#cbd5e1", marginTop: "12px" }}>
            Total Gain = R50,000  
            <br />Annual exclusion = R40,000  
            <br />Taxable gain = R10,000  
            <br />Tax Owed (18%) = R1,800
          </p>
        </section>

        {/* CSV Upload Guide */}
        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "12px" }}>
            CSV Upload Format
          </h2>

          <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
            You can upload a CSV file containing your crypto transactions. The file must follow the required format for accurate FIFO capital gains calculations.
          </p>

          <h3 style={{ marginTop: "16px", color: "#e2e8f0" }}>Required Columns</h3>

          <ul style={{ color: "#94a3b8", paddingLeft: "20px", lineHeight: "1.6" }}>
            <li>type – BUY, SELL, or TRADE</li>
            <li>buyCoin – Crypto asset received</li>
            <li>sellCoin – Crypto asset disposed</li>
            <li>buyAmount – Quantity received</li>
            <li>sellAmount – Quantity disposed</li>
            <li>buyPricePerCoin – Price per coin received (ZAR)</li>
            <li>sellPricePerCoin – Price per coin disposed (ZAR)</li>
            <li>date – Transaction date (YYYY-MM-DD)</li>
          </ul>

          <h3 style={{ marginTop: "16px", color: "#e2e8f0" }}>Transaction Types</h3>

          <ul style={{ color: "#94a3b8", paddingLeft: "20px", lineHeight: "1.6" }}>
            <li>BUY – Purchasing crypto with fiat</li>
            <li>SELL – Selling crypto for fiat</li>
            <li>TRADE – Swapping one crypto for another</li>
          </ul>

        </section>

        {/* Footer */}
        <footer
          style={{
            marginTop: "48px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(71, 85, 105, 0.3)",
            textAlign: "center",
            fontSize: "14px",
            color: "#64748b"
          }}
        >
          <p>Crypto Tax Info • South Africa 2026 • For educational purposes only</p>
        </footer>
      </div>
    </div>
  );
}
