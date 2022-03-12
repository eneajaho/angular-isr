import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { take } from "rxjs";

@Component({
  selector: "app-root",
  template: `
    <a routerLink="one" routerLinkActive="active">One</a>
    <a routerLink="two" routerLinkActive="active">Two</a>
    <a routerLink="three" routerLinkActive="active">Three</a>

    <router-outlet></router-outlet>

    <button (click)="invalidate('/one')">Clear one</button>
    <button (click)="invalidate('/two')">Clear two</button>
    <button (click)="invalidate('/three')">Clear three</button>
  `
})
export class AppComponent {
  constructor(private http: HttpClient){}

  invalidate(url: string): void {
    const path = `http://localhost:4200/api/invalidate?secret=MY_TOKEN&urlToInvalidate=${url}&revalidate=true`
    this.http.get(path).pipe(take(1)).subscribe();
  }
}
