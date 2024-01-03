import { Component, OnInit } from '@angular/core';
import { DataExtractorComponent } from '../../components/data-extractor/data-extractor.component';
import { TableComponent } from '../../components/table/table.component';
import { Employee } from '../../entities/employee';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  standalone: true,
  imports: [DataExtractorComponent, TableComponent],
})
export class MainComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
