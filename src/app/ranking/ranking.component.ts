import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.scss'
})
export class RankingComponent {
  rankingData = [
    { name: 'João Silva', score: 95 },
    { name: 'Maria Oliveira', score: 90 },
    { name: 'Carlos Souza', score: 85 },
    { name: 'Ana Costa', score: 80 },
    { name: 'Pedro Santos', score: 75 },
  ];
}
