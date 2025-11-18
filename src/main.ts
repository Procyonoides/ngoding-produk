import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app/app.routes';
import { authInterceptor } from '../src/app/auth/auth.interceptor';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), importProvidersFrom(FormsModule),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideHttpClient(withFetch()),
  ],
}).catch((err) => console.error(err));
