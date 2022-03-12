import { PageThreeComponent } from './page-three.component';
import { PageTwoComponent } from './page-two.component';
import { PageOneComponent } from './page-one.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path: 'one',
  component: PageOneComponent
},
{
  path: 'two',
  component: PageTwoComponent
},
{
  path: 'three',
  component: PageThreeComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
