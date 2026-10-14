export type PrintOrientation = "portrait" | "landscape";

export interface PrintMetric {
  label: string;
  value: string | number;
}

export interface PrintColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

export interface PrintReportOptions {
  title: string;
  subtitle?: string;
  period?: string;
  orientation?: PrintOrientation;

  employeeName?: string;
  employeeId?: string | number;

  metrics?: PrintMetric[];

  columns: PrintColumn[];

  rows: Array<Record<string, string | number | null | undefined>>;

  note?: string;
}

const escapeHtml = (value: unknown) => {
  return String(value ?? "—").replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character] ?? character;
  });
};

const getPrintInitials = (name: string) => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase();
};

export const printReport = (options: PrintReportOptions) => {
  if (import.meta.server) {
    return;
  }

  const portraitWindow = options.orientation !== "landscape";

  const windowWidth = portraitWindow ? 850 : 1200;

  const windowHeight = portraitWindow ? 1200 : 850;

  const printWindow = window.open(
    "",
    "_blank",
    `width=${windowWidth},height=${windowHeight},resizable=yes,scrollbars=yes`,
  );

  if (!printWindow) {
    throw new Error(
      "Unable to open the print window. Please allow pop-ups for this site.",
    );
  }

  const orientation = options.orientation ?? "portrait";

  const generatedAt = new Date().toLocaleString("en-PH", {
    month: "short",

    day: "2-digit",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",

    hour12: true,
  });

  /* =========================================================
       METRICS
    ========================================================== */

  const metricsHtml = (options.metrics ?? [])
    .map(
      (metric) => `
            <div class="metric">
              <div class="metric-value">
                ${escapeHtml(metric.value)}
              </div>

              <div class="metric-label">
                ${escapeHtml(metric.label)}
              </div>
            </div>
          `,
    )
    .join("");

  /* =========================================================
       TABLE HEADERS
    ========================================================== */

  const headerHtml = options.columns
    .map(
      (column) => `
            <th
              style="
                text-align:
                ${column.align ?? "left"};
              "
            >
              ${escapeHtml(column.label)}
            </th>
          `,
    )
    .join("");

  /* =========================================================
       TABLE ROWS
    ========================================================== */

  const rowsHtml = options.rows.length
    ? options.rows
        .map(
          (row) => `
                <tr>
                  ${options.columns
                    .map(
                      (column) => `
                          <td
                            style="
                              text-align:
                              ${column.align ?? "left"};
                            "
                          >
                            ${escapeHtml(row[column.key])}
                          </td>
                        `,
                    )
                    .join("")}
                </tr>
              `,
        )
        .join("")
    : `
          <tr>
            <td
              colspan="${options.columns.length}"
              class="no-records"
            >
              No records available.
            </td>
          </tr>
        `;

  /* =========================================================
       DOCUMENT
    ========================================================== */

  printWindow.document.open();

  printWindow.document.write(`
      <!DOCTYPE html>

      <html>
        <head>
          <meta charset="UTF-8">

          <title>
            ${escapeHtml(options.title)}
          </title>

          <style>
            @page {
              size:
                A4
                ${orientation};

              margin:
                11mm;
            }

            * {
              box-sizing:
                border-box;
            }

            html,
            body {
              margin:
                0;

              padding:
                0;

              background:
                #ffffff;

              color:
                #1f2937;

              font-family:
                Arial,
                Helvetica,
                sans-serif;

              font-size:
                10px;
            }

            body {
              padding:
                0;
            }

            /* ==============================================
               HEADER
            ============================================== */

            .report-header {
              display:
                flex;

              align-items:
                flex-start;

              justify-content:
                space-between;

              gap:
                20px;

              padding-bottom:
                12px;

              border-bottom:
                3px solid
                #15803d;
            }

            .school-name {
              color:
                #14532d;

              font-size:
                15px;

              font-weight:
                700;

              line-height:
                1.25;
            }

            .system-name {
              margin-top:
                2px;

              color:
                #6b7280;

              font-size:
                9px;
            }

            .report-type {
              padding:
                5px 8px;

              border:
                1px solid
                #cfe7d6;

              border-radius:
                5px;

              background:
                #f1faf4;

              color:
                #15803d;

              font-size:
                8px;

              font-weight:
                700;

              text-transform:
                uppercase;

              letter-spacing:
                .06em;
            }

            /* ==============================================
               TITLE
            ============================================== */

            .title-section {
              margin-top:
                14px;
            }

            .report-title {
              margin:
                0;

              color:
                #111827;

              font-size:
                18px;

              font-weight:
                700;
            }

            .report-subtitle {
              margin-top:
                4px;

              color:
                #6b7280;

              font-size:
                9px;
            }

            .employee-report-info {
              display:
                flex;

              align-items:
                center;

              gap:
                10px;

              margin-top:
                11px;

              padding:
                10px 12px;

              border:
                1px solid
                #dce9df;

              border-left:
                4px solid
                #15803d;

              border-radius:
                6px;

              background:
                linear-gradient(
                  90deg,
                  #f4faf6 0%,
                  #ffffff 100%
                );
            }

            .employee-report-avatar {
              width:
                38px;

              height:
                38px;

              display:
                flex;

              align-items:
                center;

              justify-content:
                center;

              flex-shrink:
                0;

              border:
                1px solid
                #cce6d3;

              border-radius:
                7px;

              background:
                #e4f5e9;

              color:
                #15803d;

              font-size:
                10px;

              font-weight:
                700;
            }

            .employee-report-details {
              min-width:
                0;
            }

            .employee-report-label {
              color:
                #15803d;

              font-size:
                6.5px;

              font-weight:
                700;

              letter-spacing:
                .08em;
            }

            .employee-report-name {
              margin-top:
                2px;

              color:
                #111827;

              font-size:
                14px;

              font-weight:
                700;

              line-height:
                1.15;

              text-transform:
                uppercase;
            }

            .employee-report-id {
              margin-top:
                3px;

              color:
                #6b7280;

              font-size:
                8px;
            }

            .employee-report-id strong {
              color:
                #374151;

              font-weight:
                700;
            }

            .period-label-print {
              color:
                #6b7280;

              font-weight:
                500;
            }

            .period {
              display:
                inline-flex;

              margin-top:
                9px;

              padding:
                5px 8px;

              border-radius:
                5px;

              background:
                #f3f7f4;

              color:
                #374151;

              font-size:
                9px;

              font-weight:
                600;
            }

            /* ==============================================
               METRICS
            ============================================== */

            .metrics {
              display:
                grid;

              grid-template-columns:
                repeat(
                  ${Math.min(Math.max((options.metrics ?? []).length, 1), 4)},
                  1fr
                );

              gap:
                7px;

              margin-top:
                12px;
            }

            .metric {
              padding:
                9px;

              border:
                1px solid
                #e5e7eb;

              border-radius:
                6px;

              background:
                #fafbfa;
            }

            .metric-value {
              color:
                #14532d;

              font-size:
                16px;

              font-weight:
                700;
            }

            .metric-label {
              margin-top:
                2px;

              color:
                #6b7280;

              font-size:
                8px;

              font-weight:
                600;

              text-transform:
                uppercase;
            }

            /* ==============================================
               NOTE
            ============================================== */

            .report-note {
              margin-top:
                10px;

              padding:
                7px 9px;

              border-left:
                3px solid
                #15803d;

              background:
                #f5faf7;

              color:
                #4b5563;

              font-size:
                8px;
            }

            /* ==============================================
               TABLE
            ============================================== */

            .table-wrapper {
              margin-top:
                14px;
            }

            table {
              width:
                100%;

              border-collapse:
                collapse;

              table-layout:
                fixed;
            }

            th,
            td {
              overflow-wrap:
                anywhere;

              word-break:
                normal;
            }

            thead {
              display:
                table-header-group;
            }

            tr {
              page-break-inside:
                avoid;
            }

            th {
              padding:
                8px 6px;

              border:
                1px solid
                #dfe5e1;

              background:
                #edf7f0;

              color:
                #14532d;

              font-size:
                10px;

              font-weight:
                700;
              
              line-height:
                1.25;

              text-transform:
                uppercase;

              white-space:
                nowrap;
            }

            td {
              padding:
                8px 6px;

              border:
                1px solid
                #e5e7eb;

              color:
                #374151;

              font-size:
                10.5px;

              line-height:
                1.35;

              vertical-align:
                middle;
            }

            th:nth-child(1),
            td:nth-child(1) {
              width:
                15%;
            }

            th:nth-child(2),
            td:nth-child(2) {
              width:
                14%;
            }

            th:nth-child(3),
            td:nth-child(3) {
              width:
                17%;
            }

            th:nth-child(4),
            td:nth-child(4) {
              width:
                12%;
            }

            th:nth-child(5),
            td:nth-child(5) {
              width:
                12%;
            }

            th:nth-child(6),
            td:nth-child(6) {
              width:
                12%;
            }

            th:nth-child(7),
            td:nth-child(7) {
              width:
                9%;
            }

            th:nth-child(8),
            td:nth-child(8) {
              width:
                9%;
            }

            tbody tr:nth-child(even) {
              background:
                #fafbfa;
            }

            .no-records {
              padding:
                28px;

              color:
                #9ca3af;

              text-align:
                center;
            }

            /* ==============================================
               FOOTER
            ============================================== */

            .report-footer {
              display:
                flex;

              align-items:
                center;

              justify-content:
                space-between;

              gap:
                20px;

              margin-top:
                14px;

              padding-top:
                8px;

              border-top:
                1px solid
                #e5e7eb;

              color:
                #9ca3af;

              font-size:
                7px;
            }

            .footer-brand {
              color:
                #15803d;

              font-weight:
                600;
            }

            @media print {
              body {
                -webkit-print-color-adjust:
                  exact;

                print-color-adjust:
                  exact;
              }
            }
          </style>
        </head>

        <body>
          <header class="report-header">
            <div>
              <div class="school-name">
                St. Nicolas College of Business and Technology
              </div>

              <div class="system-name">
                Biometric Attendance System
              </div>
            </div>

            <div class="report-type">
              Official Report
            </div>
          </header>

          <section class="title-section">
  <h1 class="report-title">
    ${escapeHtml(options.title)}
  </h1>

  ${
    options.subtitle
      ? `
        <div class="report-subtitle">
          ${escapeHtml(options.subtitle)}
        </div>
      `
      : ""
  }

  ${
    options.employeeName
      ? `
        <div class="employee-report-info">
          <div class="employee-report-avatar">
            ${escapeHtml(getPrintInitials(options.employeeName))}
          </div>

          <div class="employee-report-details">
            <div class="employee-report-label">
              EMPLOYEE
            </div>

            <div class="employee-report-name">
              ${escapeHtml(options.employeeName)}
            </div>

            ${
              options.employeeId !== undefined
                ? `
                  <div class="employee-report-id">
                    Employee ID:
                    <strong>
                      ${escapeHtml(options.employeeId)}
                    </strong>
                  </div>
                `
                : ""
            }
          </div>
        </div>
      `
      : ""
  }

  ${
    options.period
      ? `
        <div class="period">
          <span class="period-label-print">
            Report Period:
          </span>

          ${escapeHtml(options.period)}
        </div>
      `
      : ""
  }
</section>

          ${
            metricsHtml
              ? `
                <section class="metrics">
                  ${metricsHtml}
                </section>
              `
              : ""
          }

          ${
            options.note
              ? `
                <div class="report-note">
                  ${escapeHtml(options.note)}
                </div>
              `
              : ""
          }

          <section class="table-wrapper">
            <table>
              <thead>
                <tr>
                  ${headerHtml}
                </tr>
              </thead>

              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </section>

          <footer class="report-footer">
            <div>
              Generated:
              ${escapeHtml(generatedAt)}
            </div>

            <div class="footer-brand">
              Biometric Attendance System
            </div>
          </footer>
        </body>
      </html>
    `);

  printWindow.document.close();

  /*
   * Wait for the print document
   * to finish rendering.
   */
  setTimeout(() => {
    printWindow.focus();

    printWindow.print();
  }, 300);
};
