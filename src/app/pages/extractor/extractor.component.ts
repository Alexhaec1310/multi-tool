import { Component, OnInit } from '@angular/core';
import { DataExtractorComponent } from '../../components/data-extractor/data-extractor.component';
import { TableBIComponent } from '../../components/table-bi/table-bi.component';

@Component({
  selector: 'app-extractor',
  templateUrl: './extractor.component.html',
  styleUrls: ['./extractor.component.css'],
  standalone: true,
  imports: [DataExtractorComponent, TableBIComponent],
})
export class ExtractorComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
