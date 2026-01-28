import { useRef } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { parseCSV } from "../utils/parseCSV";
import { styles } from "../styles/style";

export default function TransactionUpload({ onDataReady }) {
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