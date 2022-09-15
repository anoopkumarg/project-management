import { Component, Inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { Timestamp } from '@angular/fire/firestore';
import { TasksService } from '../services/tasks.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-create-task-dialog',
  templateUrl: './create-task-dialog.component.html',
  styleUrls: ['./create-task-dialog.component.scss'],
})
export class CreateTaskDialogComponent implements OnInit {
  taskForm = this.fb.group({
    name: ['', Validators.required],
    owner: ['', Validators.required],
    status: ['not-started', Validators.required],
    deadline: ['', Validators.required],
  });
  constructor(
    public dialogRef: MatDialogRef<CreateTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { isEdit: boolean; task?: Task; users: User[] },
    private fb: NonNullableFormBuilder,
    private tasksService: TasksService,
    private toast: HotToastService
  ) {}

  ngOnInit(): void {
    if (this.data.isEdit && !!this.data.task) {
      this.setFormValues(this.data.task);
    }
  }

  setFormValues(task: Task) {
    this.taskForm.get('name')?.setValue(task.name);
    this.taskForm.get('status')?.setValue(task.status);
    this.taskForm.get('owner')?.setValue(task.owner.name);
    this.taskForm.get('deadline')?.setValue(this.toDate(task.deadline));
  }

  toDate(time: any) {
    return new Date(
      time['seconds'] * 1000 + time['nanoseconds'] / 1000000
    ).toISOString();
  }

  get taskName() {
    return this.taskForm.get('name');
  }
  get owner() {
    return this.taskForm.get('owner');
  }
  get status() {
    return this.taskForm.get('status');
  }
  get deadline() {
    return this.taskForm.get('deadline');
  }

  submit() {
    let taskObj = {} as Task;
    let deadline: any = this.taskForm.value.deadline;
    taskObj.deadline = Timestamp.fromDate(new Date(deadline)) as any;
    taskObj.name = this.taskForm.value.name as string;
    taskObj.status = this.taskForm.value.status as string;
    taskObj.owner = this.data.users.find(
      (user) =>
        user.name.toLocaleLowerCase() ===
        this.taskForm.value.owner?.toLocaleLowerCase()
    ) as User;
    if (this.data.isEdit) {
      taskObj.uid = this.data.task?.uid as string;
      this.tasksService
        .updateTask(taskObj)
        .pipe(
          this.toast.observe({
            success: 'Task updated successfully',
            loading: 'Updating Task..',
            error: ({ message }) => `There was an error: ${message} `,
          })
        )
        .subscribe(() => {
          this.dialogRef.close();
        });
    } else {
      taskObj.uid = (Math.random() + 1).toString(36).substring(2);
      this.tasksService
        .addTask(taskObj)
        .pipe(
          this.toast.observe({
            success: 'Task created successfully',
            loading: 'Creating Task..',
            error: ({ message }) => `There was an error: ${message} `,
          })
        )
        .subscribe(() => {
          this.dialogRef.close();
        });
    }
  }
}
