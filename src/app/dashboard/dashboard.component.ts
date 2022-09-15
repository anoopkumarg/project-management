import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { take, tap, timestamp } from 'rxjs';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { TasksService } from '../services/tasks.service';
import { UserService } from '../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateTaskDialogComponent } from '../create-task-dialog/create-task-dialog.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { HotToastService } from '@ngneat/hot-toast';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'owner',
    'status',
    'deadline',
    'edit',
    'delete',
  ];
  dataSource = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator = {} as MatPaginator;
  tasks: Task[] = [];
  users: User[] = [];
  constructor(
    private userService: UserService,
    private tasksService: TasksService,
    public dialog: MatDialog,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe((users) => {
      this.users = users as User[];
    });
    this.fetchTasks();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  fetchTasks() {
    this.tasksService
      .getAllTasks()
      .pipe(take(1))
      .subscribe((tasks) => {
        this.tasks = tasks as Task[];
        console.log(tasks);
        this.dataSource.data = this.tasks;
      });
  }

  openDialog(action: string, task?: Task) {
    if (action === 'delete') {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '250px',
      });
      dialogRef.afterClosed().subscribe((isDelete) => {
        if (isDelete) {
          this.tasksService
            .deleteTask(task as Task)
            .pipe(
              this.toast.observe({
                success: 'Task deleted successfully',
                loading: 'Deleting Task..',
                error: ({ message }) => `There was an error: ${message} `,
              })
            )
            .subscribe(() => this.fetchTasks());
        }
      });
    } else {
      const dialogRef = this.dialog.open(CreateTaskDialogComponent, {
        height: '400px',
        width: '300px',
        data: {
          isEdit: action === 'edit' ? true : false,
          users: this.users,
          task: action === 'edit' ? task : null,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        this.fetchTasks();
      });
    }
  }

  filterTasks(status: string) {
    if (status === 'all') {
      this.dataSource.data = this.tasks;
    } else {
      this.dataSource.data = this.tasks.filter(
        (task) => task.status === status
      );
    }
  }

  toDate(time: { seconds: number; nanoseconds: number }) {
    return new Date(
      time.seconds * 1000 + time.nanoseconds / 1000000
    ).toDateString();
  }

  applySearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
