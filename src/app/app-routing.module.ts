import { PageThreeComponent } from "./page-three.component";
import { PageTwoComponent } from "./page-two.component";
import { PageOneComponent } from "./page-one.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "one",
    component: PageOneComponent,
  },
  {
    path: "two",
    component: PageTwoComponent,
    data: {
      revalidate: 5,
    },
  },
  {
    path: "three",
    component: PageThreeComponent,
    data: {
      revalidate: 0,
    },
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: "enabledBlocking",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
