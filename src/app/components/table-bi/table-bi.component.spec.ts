/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TableBIComponent } from './table-bi.component';

describe('TableComponent', () => {
  let component: TableBIComponent;
  let fixture: ComponentFixture<TableBIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableBIComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableBIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
