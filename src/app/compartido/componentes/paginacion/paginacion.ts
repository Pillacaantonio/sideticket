import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-paginacion',
  styleUrl: './paginacion.css',
  templateUrl: './paginacion.html',
})
export class Paginacion {
  readonly total = input.required<number>();
  readonly pagina = input.required<number>();
  readonly porPagina = input(6);
  readonly paginaCambiada = output<number>();

  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.porPagina())));
  protected readonly paginas = computed(() => {
    const total = this.totalPaginas();
    const actual = this.pagina();
    const inicio = Math.max(1, Math.min(actual - 1, total - 2));
    return Array.from({ length: Math.min(3, total) }, (_, indice) => inicio + indice);
  });
  protected readonly desde = computed(() => this.total() === 0 ? 0 : (this.pagina() - 1) * this.porPagina() + 1);
  protected readonly hasta = computed(() => Math.min(this.pagina() * this.porPagina(), this.total()));

  protected irA(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas() && pagina !== this.pagina()) {
      this.paginaCambiada.emit(pagina);
    }
  }
}
