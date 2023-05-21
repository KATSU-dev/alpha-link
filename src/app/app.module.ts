import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { MaterialModule } from './material/material.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RouterModule } from '@angular/router';
import { EmailUsagePolicyComponent } from './email-usage-policy/email-usage-policy.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { AvatarCustomiserComponent } from './avatar-customiser/avatar-customiser.component';
import { AvatarLayeredViewComponent } from './avatar-layered-view/avatar-layered-view.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ProfileComponent } from './profile/profile.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { AvatarViewComponent } from './avatar-view/avatar-view.component';
import { CustomTextComponent } from './custom-text/custom-text.component';
import { PostElementSmallComponent } from './post-element-small/post-element-small.component';
import { PostsListComponent } from './posts-list/posts-list.component';
import { ShortNumberPipe } from './pipes/short-number.pipe';
import { NewsfeedComponent } from './newsfeed/newsfeed.component';
import { AddPartnerComponent } from './add-partner/add-partner.component';
import { PillComponent } from './pill/pill.component';
import { MonViewComponent } from './mon-view/mon-view.component';
import { OpponentSearchComponent } from './opponent-search/opponent-search.component';
import { ChallengeComponent } from './challenge/challenge.component';
import { CreateChallengeComponent } from './create-challenge/create-challenge.component';
import { ChallengeInteractComponent } from './challenge-interact/challenge-interact.component';
import { ChallengeResponseComponent } from './challenge-response/challenge-response.component';
import { LinkBattleComponent } from './link-battle/link-battle.component';
import { LinkBattleDisplayComponent } from './link-battle-display/link-battle-display.component';
import { LinkBattleConcludeComponent } from './link-battle-conclude/link-battle-conclude.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    LoginComponent,
    RegisterComponent,
    EmailUsagePolicyComponent,
    TermsAndConditionsComponent,
    AvatarCustomiserComponent,
    AvatarLayeredViewComponent,
    SidebarComponent,
    ProfileComponent,
    NotFoundComponent,
    TopBarComponent,
    AvatarViewComponent,
    CustomTextComponent,
    PostElementSmallComponent,
    PostsListComponent,
    ShortNumberPipe,
    NewsfeedComponent,
    AddPartnerComponent,
    PillComponent,
    MonViewComponent,
    OpponentSearchComponent,
    ChallengeComponent,
    CreateChallengeComponent,
    ChallengeInteractComponent,
    ChallengeResponseComponent,
    LinkBattleComponent,
    LinkBattleDisplayComponent,
    LinkBattleConcludeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
