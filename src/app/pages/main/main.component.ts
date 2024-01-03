import { Component, OnInit } from '@angular/core';
import { ExtractorComponent } from '../extractor/extractor.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TableEmployeesComponent } from '../../components/table-employees/table-employees.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  standalone: true,
  imports: [MatTabsModule, ExtractorComponent, TableEmployeesComponent],
})
export class MainComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
