import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { LoginComponent } from './login/login.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: '',               component: IndexComponent     },
  { path: 'login',          component: LoginComponent     },
  { path: 'register',       component: RegisterComponent  },
  { path: 'profile',        component: ProfileComponent   },
  { path: 'profile/:username',        component: ProfileComponent   },
  { path: '**',             component: NotFoundComponent  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
