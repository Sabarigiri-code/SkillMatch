const fs = require('fs');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function createPdf() {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const fontSize = 12;
  page.drawText('Jane Doe\nSoftware Engineer\nJava, Spring Boot, React, MongoDB\n5 years of experience.', {
    x: 50,
    y: height - 4 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('sample.pdf', pdfBytes);
  console.log('sample.pdf created successfully');
}

createPdf();
