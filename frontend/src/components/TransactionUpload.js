import { useRef, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { parseCSV } from "../utils/parseCSV";
import { styles } from "../styles/style";

export default function TransactionUpload({ onDataReady }) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!/\.(csv|xlsx?|xls)$/i.test(file.name)) {
      setError("Invalid file type. Please upload a valid file.");
      onDataReady([]); // clear previous
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const transactions = parseCSV(content);
        setError(""); // clear error
        onDataReady(transactions);
      } catch (err) {
        setError(err.message);
        onDataReady([]); // clear previous
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      style={{ ...styles.card, ...styles.uploadCard, position: "relative" }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(45, 212, 191, 0.5)"}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.5)"}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
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
          <span>Supports .csv or Excel files with transaction data</span>
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          borderRadius: "12px",
          background: "rgba(239, 68, 68, 0.1)",
          color: "#ef4444",
          fontWeight: "500",
          textAlign: "center",
        }}>
          {error}
        </div>
      )}

    </div>
  );
}
