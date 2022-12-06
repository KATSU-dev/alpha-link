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
import { CreatePostComponent } from './create-post/create-post.component';
import { PostElementSmallComponent } from './post-element-small/post-element-small.component';
import { PostElementFullComponent } from './post-element-full/post-element-full.component';
import { PostsListComponent } from './posts-list/posts-list.component';

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
    CreatePostComponent,
    PostElementSmallComponent,
    PostElementFullComponent,
    PostsListComponent
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
