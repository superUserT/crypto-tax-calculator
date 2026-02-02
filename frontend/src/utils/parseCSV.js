import * as XLSX from "xlsx";

export async function processUploadFile(file) {
    if (!file) {
        throw new Error("No file selected.");
    }

    // ================= FILE VALIDATION =================
    const allowedExtensions = [".csv", ".xls", ".xlsx"];
    const fileName = file.name.toLowerCase();

    if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
        throw new Error(
            "Only CSV or Excel files (.csv, .xls, .xlsx) are allowed.",
        );
    }

    if (file.size === 0) {
        throw new Error("The uploaded file is empty.");
    }

    // ================= READ FILE =================
    let csvContent = "";

    if (fileName.endsWith(".csv")) {
        csvContent = await file.text();
    } else {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        csvContent = XLSX.utils.sheet_to_csv(sheet);
    }

    if (!csvContent.trim()) {
        throw new Error("File contains no readable data.");
    }

    // ================= CSV PARSE + VALIDATION =================
    const requiredFields = [
        "type",
        "buyCoin",
        "sellCoin",
        "buyAmount",
        "sellAmount",
        "buyPricePerCoin",
        "sellPricePerCoin",
        "date",
    ];

    const lines = csvContent.trim().split("\n");

    if (lines.length < 2) {
        throw new Error("File must contain headers and at least one data row.");
    }

    const headers = lines[0].split(/\t|,| {2,}/).map((h) => h.trim());

    // 🔒 Required header check
    requiredFields.forEach((field) => {
        if (!headers.includes(field)) {
            throw new Error(`Missing required column: ${field}`);
        }
    });

    const dataLines = lines.slice(1).filter((line) => line.trim());

    if (!dataLines.length) {
        throw new Error("File contains no data rows.");
    }

    return dataLines.map((line, index) => {
        const values = line.split(/\t|,| {2,}/);
        const tx = {};

        headers.forEach((h, i) => {
            tx[h] = values[i]?.trim() || "";
        });

        // ================= NORMALIZATION =================
        tx.type = (tx.type || "").toUpperCase();
        tx.buyCoin = (tx.buyCoin || "").toUpperCase();
        tx.sellCoin = (tx.sellCoin || "").toUpperCase();

        tx.buyAmount = parseFloat(tx.buyAmount.replace(/,/g, ""));
        tx.sellAmount = parseFloat(tx.sellAmount.replace(/,/g, ""));
        tx.buyPricePerCoin = parseFloat(
            tx.buyPricePerCoin.replace(/[^0-9.-]+/g, ""),
        );
        tx.sellPricePerCoin = parseFloat(
            tx.sellPricePerCoin.replace(/[^0-9.-]+/g, ""),
        );

        // ================= TYPE-BASED VALIDATION =================
        if (!["BUY", "SELL", "TRADE"].includes(tx.type)) {
            throw new Error(`Invalid transaction type on row ${index + 2}`);
        }

        if (tx.type === "BUY") {
            if (isNaN(tx.buyAmount) || isNaN(tx.buyPricePerCoin)) {
                throw new Error(`Invalid BUY values on row ${index + 2}`);
            }
            tx.sellAmount = isNaN(tx.sellAmount) ? 0 : tx.sellAmount;
            tx.sellPricePerCoin = isNaN(tx.sellPricePerCoin)
                ? 0
                : tx.sellPricePerCoin;
        }

        if (tx.type === "SELL") {
            if (isNaN(tx.sellAmount) || isNaN(tx.sellPricePerCoin)) {
                throw new Error(`Invalid SELL values on row ${index + 2}`);
            }
            tx.buyAmount = isNaN(tx.buyAmount) ? 0 : tx.buyAmount;
            tx.buyPricePerCoin = isNaN(tx.buyPricePerCoin)
                ? 0
                : tx.buyPricePerCoin;
        }

        if (tx.type === "TRADE") {
            if (
                isNaN(tx.buyAmount) ||
                isNaN(tx.sellAmount) ||
                isNaN(tx.buyPricePerCoin) ||
                isNaN(tx.sellPricePerCoin)
            ) {
                throw new Error(`Invalid TRADE values on row ${index + 2}`);
            }
        }

        // ================= DATE VALIDATION =================
        const parsedDate = new Date(tx.date);
        if (isNaN(parsedDate.getTime())) {
            throw new Error(`Invalid date on row ${index + 2}`);
        }

        tx.date = parsedDate.toISOString().slice(0, 19).replace("T", " ");

        return tx;
    });
}
