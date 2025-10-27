import ExcelJS from 'exceljs';

async function createSampleExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Debtors');

  // Define columns with headers
  worksheet.columns = [
    { header: 'firstName', key: 'firstName', width: 15 },
    { header: 'lastName', key: 'lastName', width: 15 },
    { header: 'phone', key: 'phone', width: 15 },
    { header: 'alternatePhone', key: 'alternatePhone', width: 15 },
    { header: 'email', key: 'email', width: 25 },
    { header: 'debtAmount', key: 'debtAmount', width: 15 },
    { header: 'currency', key: 'currency', width: 10 },
    { header: 'contractNumber', key: 'contractNumber', width: 18 },
    { header: 'dueDate', key: 'dueDate', width: 15 },
    { header: 'productService', key: 'productService', width: 30 },
    { header: 'debtReason', key: 'debtReason', width: 25 },
  ];

  // Style the header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add sample data rows
  const sampleData = [
    {
      firstName: 'Sardor',
      lastName: 'Karimov',
      phone: '998901234567',
      alternatePhone: '998907654321',
      email: 'sardor@example.com',
      debtAmount: 5000000,
      currency: 'UZS',
      contractNumber: 'LOAN-2024-001',
      dueDate: '2024-10-01',
      productService: 'Kreditga olingan telefon',
      debtReason: 'Muddat o\'tgan'
    },
    {
      firstName: 'Dilnoza',
      lastName: 'Rahimova',
      phone: '998901234568',
      alternatePhone: '',
      email: 'dilnoza@example.com',
      debtAmount: 3500000,
      currency: 'UZS',
      contractNumber: 'LOAN-2024-002',
      dueDate: '2024-09-15',
      productService: 'Noutbuk krediti',
      debtReason: ''
    },
    {
      firstName: 'Aziz',
      lastName: 'Tursunov',
      phone: '998909876543',
      alternatePhone: '998905555555',
      email: '',
      debtAmount: 7200000,
      currency: 'UZS',
      contractNumber: 'LOAN-2024-003',
      dueDate: '2024-08-20',
      productService: 'Avtomobil krediti',
      debtReason: 'To\'lov qilmagan'
    },
    {
      firstName: 'Malika',
      lastName: 'Uzbekova',
      phone: '998901112233',
      alternatePhone: '998907778899',
      email: 'malika@example.com',
      debtAmount: 2800000,
      currency: 'UZS',
      contractNumber: 'LOAN-2024-004',
      dueDate: '2024-09-01',
      productService: 'Uy jihozlari krediti',
      debtReason: 'Qisman to\'lov'
    },
    {
      firstName: 'Jamshid',
      lastName: 'Aliyev',
      phone: '998903334455',
      alternatePhone: '',
      email: 'jamshid@example.com',
      debtAmount: 10000000,
      currency: 'UZS',
      contractNumber: 'LOAN-2024-005',
      dueDate: '2024-07-15',
      productService: 'Ko\'chmas mulk krediti',
      debtReason: 'Muddat jiddiy o\'tgan'
    }
  ];

  // Add rows
  sampleData.forEach(data => {
    worksheet.addRow(data);
  });

  // Format the debtAmount column as number
  worksheet.getColumn('debtAmount').numFmt = '#,##0';

  // Save the file
  await workbook.xlsx.writeFile('sample-debtors.xlsx');
  console.log('✅ Sample Excel file created: sample-debtors.xlsx');
  console.log('📊 Contains 5 sample debtor records');
  console.log('📁 Location: /Users/mac/Desktop/navai-call-analytics/sample-debtors.xlsx');
}

createSampleExcel().catch(console.error);
