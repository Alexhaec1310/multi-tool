import * as XLSX from 'xlsx';

const getFileName = (date: string) => {
  let fileName = `Empleados-${date}`;
  return fileName;
};

export class TableUtil {
  static exportTableToExcel(tableId: string, date: string) {
    let table = document.getElementById(tableId);
    let clonedTable = table?.cloneNode(true) as HTMLElement;

    if (clonedTable && clonedTable.getElementsByTagName('tbody').length > 0) {
      let tbody = clonedTable.getElementsByTagName('tbody')[0];

      if (tbody.rows.length > 0) {
        let lastRow = tbody.rows[tbody.rows.length - 1];
        lastRow.parentNode!.removeChild(lastRow);
      }
    }

    if (clonedTable) {
      let rows = clonedTable.querySelectorAll('tr');

      for (let i = 0; i < rows.length; i++) {
        let cells = rows[i].querySelectorAll('td');

        if (cells.length > 0) {
          let lastCell = cells[cells.length - 1];
          lastCell.parentNode!.removeChild(lastCell);
        }
      }
    }

    let wb = XLSX.utils.table_to_book(clonedTable, <XLSX.Table2SheetOpts>{
      dateNF: 'dd/mm/yyyy;@',
      sheet: 'Empleados',
      cellDates: true,
      raw: true,
    });
    XLSX.writeFile(wb, `${getFileName(date)}.xlsx`);
  }
}
