import { Routes } from '@angular/router';
import { InterviewChatComponent } from './interview-chat/interview-chat.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ConversationHistoryComponent } from './conversation-history/conversation-history.component';
import { ConversationDetailComponent } from './conversation-detail/conversation-detail.component';
import { AuthGuard } from './services/auth.guard';
import { QuizComponent } from './quiz/quiz.component';
import { QuizListComponent } from './quiz-list/quiz-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/interview', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'interview', component: InterviewChatComponent, canActivate: [AuthGuard] },
  { path: 'history', component: ConversationHistoryComponent, canActivate: [AuthGuard] },
  { path: 'conversation/:id', component: ConversationDetailComponent, canActivate: [AuthGuard] },
  { path: 'quiz', redirectTo: '/quizzes', pathMatch: 'full' },
  { path: 'quiz/:id', component: QuizComponent, canActivate: [AuthGuard] },
  { path: 'conversation/:id/quiz', component: QuizComponent, canActivate: [AuthGuard] },
  { path: 'quizzes', component: QuizListComponent, canActivate: [AuthGuard] }
];