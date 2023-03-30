import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { LinkBattleComponent } from './link-battle/link-battle.component';
import { LoginComponent } from './login/login.component';
import { NewsfeedComponent } from './newsfeed/newsfeed.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { OpponentSearchComponent } from './opponent-search/opponent-search.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: '',               component: IndexComponent     },
  { path: 'login',          component: LoginComponent     },
  { path: 'home',           component: NewsfeedComponent },
  { path: 'register',       component: RegisterComponent  },
  { path: 'profile',        component: ProfileComponent   },
  { path: 'profile/:username',        component: ProfileComponent   },
  { path: 'opponentsearch', component: OpponentSearchComponent },
  { path: 'linkbattle',     component: LinkBattleComponent },
  { path: 'linkbattle/:test',     component: LinkBattleComponent },

  { path: '**',             component: NotFoundComponent  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
