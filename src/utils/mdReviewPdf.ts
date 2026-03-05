import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ClaimEmergencyBill } from "../types/ClaimEmergencyBills";

interface MdReviewPdfOptions {
  mdName: string;
  signatureDataUrl: string;
  claimId: string;
  bills: ClaimEmergencyBill[];
}

// Primary brand color RGB
const PRIMARY_R = 220;
const PRIMARY_G = 38;
const PRIMARY_B = 38;

const formatCurrency = (amount: number): string => {
  return `NGN ${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const blank = "___________________";

const formatDate = (dateStr: string) => {
  if (!dateStr) return blank;
  try {
    return new Date(dateStr).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export function generateMdReviewPdf(options: MdReviewPdfOptions) {
  const { mdName, signatureDataUrl, claimId, bills } = options;
  const doc = new jsPDF({ unit: "pt" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 50;
  const marginRight = 50;
  let y = 50;

  const now = new Date();
  const dateSigned = now.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const facilityName = bills[0]?.hospitalName || blank;
  const providerCode = bills[0]?.providerId || blank;

  // Helper: print bold label + normal value with proper spacing
  const labelValue = (label: string, value: string, x: number) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, x, y);
    const labelW = doc.getTextWidth(label);
    doc.setFont("helvetica", "normal");
    doc.text(value || blank, x + labelW + 2, y);
  };

  // ===== TITLE =====
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
  doc.text(
    "MEDICAL DIRECTOR REVIEW & ENDORSEMENT LETTER",
    marginLeft,
    y,
  );
  doc.setTextColor(0);

  // ===== Red accent line under title =====
  y += 8;
  doc.setDrawColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
  doc.setLineWidth(2);
  doc.line(marginLeft, y, pageWidth - marginRight, y);

  // ===== TO: =====
  y += 22;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("To:", marginLeft, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.text(
    "The State NEMSAS Review & Claims Processing Unit",
    marginLeft,
    y,
  );

  // ===== LETTER BODY =====
  y += 22;
  const lineHeight = 16;

  // "I, Dr. ____, Medical Director for"
  doc.text("I, ", marginLeft, y);
  const iW = doc.getTextWidth("I, ");
  doc.setFont("helvetica", "bold");
  doc.text("Dr. ", marginLeft + iW, y);
  const drW = doc.getTextWidth("Dr. ");
  // Name value (keep bold for the name, then measure before switching)
  const nameVal = mdName || blank;
  doc.text(nameVal, marginLeft + iW + drW + 2, y);
  const nameW = doc.getTextWidth(nameVal);
  doc.setFont("helvetica", "normal");
  doc.text(
    ", Medical Director for",
    marginLeft + iW + drW + 2 + nameW + 2,
    y,
  );

  // Facility line
  y += lineHeight;
  doc.setFont("helvetica", "bolditalic");
  doc.text(facilityName, marginLeft, y);
  const facW = doc.getTextWidth(facilityName);
  doc.setFont("helvetica", "bold");
  doc.text(" (Health Facility / Provider) ", marginLeft + facW, y);
  const hfpW = doc.getTextWidth(" (Health Facility / Provider) ");
  doc.setFont("helvetica", "normal");
  doc.text("in _______________", marginLeft + facW + hfpW, y);

  // "State, Medical Registration Number: ___, Health Facility / Provider"
  y += lineHeight;
  doc.setFont("helvetica", "bold");
  doc.text("State", marginLeft, y);
  const stW = doc.getTextWidth("State");
  doc.setFont("helvetica", "normal");
  doc.text(
    ", Medical Registration Number: " +
      blank +
      ", Health Facility / Provider",
    marginLeft + stW + 2,
    y,
  );

  // "Code: ___, confirm that..."
  y += lineHeight;
  doc.text("Code: ", marginLeft, y);
  const codeL = doc.getTextWidth("Code: ");
  doc.text(providerCode.substring(0, 18), marginLeft + codeL + 2, y);
  const codeVW = doc.getTextWidth(providerCode.substring(0, 18));
  doc.text(
    ", confirm that I have reviewed the emergency medical",
    marginLeft + codeL + 2 + codeVW,
    y,
  );

  y += lineHeight;
  doc.text(
    "encounters and billing submissions captured on the NEMSAS ",
    marginLeft,
    y,
  );
  const prefW = doc.getTextWidth(
    "encounters and billing submissions captured on the NEMSAS ",
  );
  doc.setFont("helvetica", "bolditalic");
  doc.text("Provider Emergency", marginLeft + prefW, y);

  y += lineHeight;
  doc.setFont("helvetica", "bolditalic");
  doc.text("Bill Capture Platform ", marginLeft, y);
  const bcpW = doc.getTextWidth("Bill Capture Platform ");
  doc.setFont("helvetica", "normal");
  doc.text(
    "and certify that they are medically necessary, properly",
    marginLeft + bcpW,
    y,
  );

  y += lineHeight;
  doc.text(
    "documented, and compliant with State NEMSAS-approved protocols and billing",
    marginLeft,
    y,
  );

  y += lineHeight;
  doc.text("guidelines.", marginLeft, y);

  // Endorsement paragraph
  y += lineHeight + 6;
  doc.text("Accordingly, I ", marginLeft, y);
  const accW = doc.getTextWidth("Accordingly, I ");
  doc.setFont("helvetica", "bold");
  doc.text("endorse and approve ", marginLeft + accW, y);
  const eaW = doc.getTextWidth("endorse and approve ");
  doc.setFont("helvetica", "normal");
  doc.text(
    "the emergency bills for NEMSAS validation",
    marginLeft + accW + eaW,
    y,
  );

  y += lineHeight;
  doc.text("and reimbursement processing.", marginLeft, y);

  // ===== HORIZONTAL LINE (red accent) =====
  y += 18;
  doc.setDrawColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
  doc.setLineWidth(1.5);
  doc.line(marginLeft, y, pageWidth - marginRight, y);

  // ===== E-SIGNATURE =====
  y += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("E-Signature:  ", marginLeft, y);
  const esigL = doc.getTextWidth("E-Signature:  ");
  doc.setFont("helvetica", "italic");
  doc.text(
    "(Auto-generated from pre-uploaded signature)",
    marginLeft + esigL,
    y,
  );

  // Signature image
  y += 8;
  try {
    if (signatureDataUrl) {
      doc.addImage(signatureDataUrl, "PNG", marginLeft, y, 150, 45);
    }
  } catch {
    // ignore if image can't be added
  }

  y += 54;

  // ===== DATE SIGNED =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Date Signed:  ", marginLeft, y);
  doc.setFont("helvetica", "normal");
  const dsL = doc.getTextWidth("Date Signed:  ");
  doc.text(dateSigned, marginLeft + dsL, y);

  // ===== APPROVED EMERGENCY BILLS HEADING =====
  y += 28;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
  doc.text("Approved Emergency Bills", marginLeft, y);
  doc.setTextColor(0);

  // ===== TABLE =====
  interface PatientRow {
    hospitalNumber: string;
    firstName: string;
    lastName: string;
    insuranceStatus: string;
    gender: string;
    encounterCount: number;
    totalAmount: number;
  }

  const patientMap = new Map<string, PatientRow>();

  bills.forEach((bill) => {
    const patient = bill.patient;
    const key = patient?.id || bill.patientId || bill.id;
    const existing = patientMap.get(key);
    const billTotal =
      bill.productServices?.reduce((sum, s) => sum + s.netAmount, 0) || 0;

    if (existing) {
      existing.encounterCount += 1;
      existing.totalAmount += billTotal;
    } else {
      patientMap.set(key, {
        hospitalNumber: patient?.hospitalNumber || "",
        firstName: patient?.firstName || "",
        lastName: patient?.lastName || "",
        insuranceStatus: patient?.insuranceStatus || "",
        gender: patient?.gender || "",
        encounterCount: 1,
        totalAmount: billTotal,
      });
    }
  });

  const tableRows: string[][] = [];
  let grandTotal = 0;

  patientMap.forEach((row) => {
    grandTotal += row.totalAmount;
    tableRows.push([
      row.hospitalNumber,
      row.firstName,
      row.lastName,
      row.insuranceStatus,
      row.gender,
      `${row.encounterCount}`,
      formatCurrency(row.totalAmount),
    ]);
  });

  y += 8;

  autoTable(doc, {
    startY: y,
    margin: { left: marginLeft, right: marginRight },
    head: [
      [
        "Hospital\nNumber",
        "First\nName",
        "Last\nName",
        "Insurance\nStatus",
        "Gender",
        "Number of\nEncounters",
        "Total Amount\n(NGN)",
      ],
    ],
    body: tableRows,
    styles: {
      fontSize: 9,
      cellPadding: 5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [PRIMARY_R, PRIMARY_G, PRIMARY_B],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      6: { halign: "right" },
    },
    theme: "grid",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 20;

  if (y > doc.internal.pageSize.getHeight() - 120) {
    doc.addPage();
    y = 50;
  }

  // ===== TOTALS & CLAIM INFO =====
  doc.setFontSize(11);
  labelValue("Total Approved Amount:  ", formatCurrency(grandTotal), marginLeft);

  y += 18;
  labelValue("Claim Id:  ", claimId, marginLeft);

  y += 18;
  labelValue("Total Bills:  ", `${bills.length}`, marginLeft);

  y += 18;
  labelValue("Total Patients:  ", `${patientMap.size}`, marginLeft);

  y += 18;
  labelValue("Date Generated:  ", dateSigned, marginLeft);

  // ===== BOTTOM LINE =====
  y += 24;
  doc.setDrawColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
  doc.setLineWidth(1.5);
  doc.line(marginLeft, y, pageWidth - marginRight, y);

  // ===== DETAILED BILL BREAKDOWN =====
  doc.addPage();
  y = 50;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
  doc.text("Detailed Bill Breakdown", marginLeft, y);
  doc.setTextColor(0);

  // Red accent line
  y += 8;
  doc.setDrawColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
  doc.setLineWidth(2);
  doc.line(marginLeft, y, pageWidth - marginRight, y);

  bills.forEach((bill, index) => {
    const pageHeight = doc.internal.pageSize.getHeight();

    if (y > pageHeight - 160) {
      doc.addPage();
      y = 50;
    }

    // Separator between bills
    y += 20;
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginRight, y);

    // Bill header with red accent
    y += 18;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
    doc.text(`Bill ${index + 1} of ${bills.length}`, marginLeft, y);
    doc.setTextColor(0);

    y += 18;
    doc.setFontSize(9);

    const patient = bill.patient;
    const patientName = patient
      ? `${patient.firstName} ${patient.lastName}`
      : blank;

    const col2X = marginLeft + 260;
    const detailLineH = 15;

    labelValue("Patient:  ", patientName, marginLeft);
    labelValue("Hospital No:  ", patient?.hospitalNumber || blank, col2X);

    y += detailLineH;
    labelValue("Encounter ID:  ", bill.encounterId || blank, marginLeft);
    labelValue("Department:  ", bill.department || blank, col2X);

    y += detailLineH;
    labelValue("Service Type:  ", bill.serviceType || blank, marginLeft);
    labelValue("Status:  ", bill.status || blank, col2X);

    y += detailLineH;
    labelValue(
      "Encounter Date:  ",
      formatDate(bill.encounterStartDateTime),
      marginLeft,
    );
    labelValue("Discharge Date:  ", formatDate(bill.dischargeDate), col2X);

    y += detailLineH;
    labelValue(
      "Discharge Status:  ",
      bill.dischargeStatus || blank,
      marginLeft,
    );
    labelValue(
      "Attending Physician:  ",
      bill.attendingPhysician || blank,
      col2X,
    );

    // Diagnoses
    if (bill.diagnoses && bill.diagnoses.length > 0) {
      y += 20;
      if (y > pageHeight - 80) {
        doc.addPage();
        y = 50;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
      doc.text("Diagnoses", marginLeft, y);
      doc.setTextColor(0);
      y += 6;

      autoTable(doc, {
        startY: y,
        margin: { left: marginLeft, right: marginRight },
        head: [["Type", "Code", "Diagnosis", "Note"]],
        body: bill.diagnoses.map((d) => [
          d.type || "",
          d.code || "",
          d.diagnosis || "",
          d.note || "-",
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 4,
          textColor: [0, 0, 0],
          lineColor: [180, 180, 180],
          lineWidth: 0.3,
        },
        headStyles: {
          fillColor: [PRIMARY_R, PRIMARY_G, PRIMARY_B],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        theme: "grid",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY;
    }

    // Product / Services
    if (bill.productServices && bill.productServices.length > 0) {
      y += 16;
      if (y > pageHeight - 80) {
        doc.addPage();
        y = 50;
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
      doc.text("Services & Products", marginLeft, y);
      doc.setTextColor(0);
      y += 6;

      const billTotal = bill.productServices.reduce(
        (sum, s) => sum + s.netAmount,
        0,
      );

      autoTable(doc, {
        startY: y,
        margin: { left: marginLeft, right: marginRight },
        head: [["Service", "Category", "Qty", "Price", "Net Amount"]],
        body: [
          ...bill.productServices.map((s) => [
            s.name || s.description || "",
            s.productCategory || "",
            `${s.quantity}`,
            formatCurrency(s.price),
            formatCurrency(s.netAmount),
          ]),
          [
            {
              content: "Bill Total",
              colSpan: 4,
              styles: {
                fontStyle: "bold" as const,
                halign: "right" as const,
              },
            },
            {
              content: formatCurrency(billTotal),
              styles: { fontStyle: "bold" as const },
            },
          ],
        ],
        styles: {
          fontSize: 8,
          cellPadding: 4,
          textColor: [0, 0, 0],
          lineColor: [180, 180, 180],
          lineWidth: 0.3,
        },
        headStyles: {
          fillColor: [PRIMARY_R, PRIMARY_G, PRIMARY_B],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: {
          2: { halign: "center" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
        theme: "grid",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      y = (doc as any).lastAutoTable.finalY;
    }
  });

  // ===== GRAND TOTAL FOOTER =====
  y += 28;
  if (y > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    y = 50;
  }
  doc.setDrawColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
  doc.setLineWidth(1.5);
  doc.line(marginLeft, y, pageWidth - marginRight, y);

  y += 18;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
  doc.text("Grand Total:  ", marginLeft, y);
  const gtL = doc.getTextWidth("Grand Total:  ");
  doc.setTextColor(0);
  doc.text(formatCurrency(grandTotal), marginLeft + gtL, y);

  y += 16;
  doc.setDrawColor(PRIMARY_R, PRIMARY_G, PRIMARY_B);
  doc.setLineWidth(1.5);
  doc.line(marginLeft, y, pageWidth - marginRight, y);

  const fileName = `MD_Approval_${claimId}.pdf`;
  doc.save(fileName);
}
