import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';

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
  public chart: any;

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

    this.createChart();
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

  createChart() {
    const labels = this.employeeWorkingHoursSorted.map(employee => employee[0]); 
    const data = this.employeeWorkingHoursSorted.map(employee => employee[1]); 
  
    this.chart = new Chart("MyChart", {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(153, 102, 255)',

            'rgb(255, 70, 132)',
            'rgb(34, 162, 235)',
            'rgb(255, 235, 86)',
            'rgb(75, 172, 192)',
            'rgb(153, 122, 255)'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        aspectRatio: 2.5,
        plugins: {
          title: {
            display: true,
            font: {
              size: 24,
              weight: 'bold',
              family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          legend: {  
            display: true,
            labels: {
              font: {
                size: 14,
                family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                let value = context.parsed || 0;
                let dataset = context.dataset || {};
                let total = dataset.data.reduce((acc, curr) => acc + curr, 0);
                let percent = Math.round((value / total) * 100);
                return `${label}: ${value} (${percent}%)`;
              }
            }
          }
        }
      }
    });
  }
}
