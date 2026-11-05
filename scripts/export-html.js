'use strict';

const fs = require('fs');
const path = require('path');

const mdPath = 'D:\\BCA_Academic_Project_Report.md';
const htmlPath = 'D:\\BCA_Academic_Project_Report.html';

if (!fs.existsSync(mdPath)) {
  console.error('Markdown file not found at:', mdPath);
  process.exit(1);
}

const md = fs.readFileSync(mdPath, 'utf8');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BCA Academic Project Report - Online E-Commerce Platform</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    @page {
      size: A4;
      margin: 25mm 20mm;
    }
    body {
      font-family: "Times New Roman", Times, serif;
      color: #111;
      background: #f4f6f8;
      line-height: 1.6;
      font-size: 12pt;
      margin: 0;
      padding: 2rem;
    }
    .report-container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      padding: 3.5rem 4.5rem;
      box-shadow: 0 4px 25px rgba(0,0,0,0.08);
      border-radius: 4px;
    }
    h1, h2, h3, h4 {
      font-family: "Times New Roman", Times, serif;
      color: #000;
      font-weight: bold;
      margin-top: 2rem;
      margin-bottom: 0.8rem;
    }
    h1 {
      font-size: 20pt;
      text-align: center;
      text-transform: uppercase;
      margin-top: 2.5rem;
    }
    h2 {
      font-size: 15pt;
      border-bottom: 1px solid #333;
      padding-bottom: 4px;
    }
    h3 {
      font-size: 13pt;
    }
    p {
      text-align: justify;
      text-justify: inter-word;
      margin-bottom: 1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 10.5pt;
    }
    th, td {
      border: 1px solid #444;
      padding: 7px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    pre, code {
      font-family: "Consolas", monospace;
      font-size: 9.5pt;
      background: #f7f7f7;
    }
    pre {
      border: 1px solid #ccc;
      padding: 12px;
      overflow-x: auto;
      white-space: pre;
      margin: 1.2rem 0;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
      border-top: 2px dashed #bbb;
      margin: 3.5rem 0;
    }
    .print-bar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #fff;
      padding: 0.9rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      margin: -2rem -2rem 2rem -2rem;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .print-btn {
      background: #f59e0b;
      color: #0f172a;
      border: none;
      padding: 0.6rem 1.4rem;
      font-weight: 700;
      font-size: 0.95rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .print-btn:hover {
      background: #fbbf24;
    }
    @media print {
      body {
        background: #fff;
        padding: 0;
      }
      .report-container {
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .print-bar {
        display: none !important;
      }
      .page-break {
        border: none;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span><strong>Academic Project Report:</strong> Online E-Commerce Platform (BCA 2023-2026, IKGPTU)</span>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="report-container" id="content"></div>
  <script>
    const rawMarkdown = ${JSON.stringify(md)};
    const processed = rawMarkdown.replace(/\\\\newpage/g, '<div class="page-break"></div>');
    document.getElementById("content").innerHTML = marked.parse(processed);
  </script>
</body>
</html>`;

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('Successfully written HTML report to:', htmlPath);
