import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Employee {
    Id: string;
    EmployeeName: string;
    StarTimeUtc: string;
    EndTimeUtc: string;
    EntryNotes: string;
    DeletedOn: string | null;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'EmployeeWebApplication';

  public employees: Employee[] = [];
  public employeeWorkingHours: Map<string, number> = new Map();
  public employeeWorkingHoursSorted: [string, number][] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    
    this.getEmployees();

    this.employees.forEach(entry => {

      if (entry.EmployeeName == null) {
        return;
      }

      const hoursWorked = this.calculateWorkingHours(entry.StarTimeUtc, entry.EndTimeUtc);
      const totalHours = this.employeeWorkingHours.get(entry.EmployeeName) || 0;
      this.employeeWorkingHours.set(entry.EmployeeName, totalHours + hoursWorked);
    });

    // U array stavlja kopiju od mape
    // Sortira array, i svaki element zaokruzuje na najblizi ceo broj koji je veci ili jednak tom broju.
    this.employeeWorkingHoursSorted = Array.from(this.employeeWorkingHours).sort((a, b) => b[1] - a[1]).map(item => [item[0], Math.ceil(item[1])]);
  }

  calculateWorkingHours(start: string, end: string): number {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);    // Convert milliseconds to hours
    return Math.abs(duration);
  }

  getEmployees() {
    this.http.get<Employee[]>('https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==').subscribe(
      (result) => {
        this.employees = result;
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
